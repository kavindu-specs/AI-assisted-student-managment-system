jest.mock('fs', () => ({
  unlink: jest.fn((filePath, cb) => cb()),
}));
jest.mock('xlsx', () => ({
  readFile: jest.fn(() => ({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } })),
  utils: { sheet_to_json: jest.fn() },
}));
jest.mock('../../src/models', () => ({
  ImportBatch: { create: jest.fn() },
  Student: { findAll: jest.fn(), create: jest.fn() },
  StudentAccount: { create: jest.fn() },
  StudentProfile: { create: jest.fn() },
  UserAccount: { create: jest.fn() },
  Role: { findOne: jest.fn() },
  Programme: { findByPk: jest.fn() },
  Intake: { findByPk: jest.fn() },
  sequelize: { transaction: jest.fn((cb) => cb({})) },
}));
jest.mock('../../src/utils/registrationNumber', () => ({ generateRegistrationNo: jest.fn() }));
jest.mock('../../src/utils/password', () => ({ generateTempPassword: jest.fn(), hash: jest.fn() }));

const fs = require('fs');
const XLSX = require('xlsx');
const {
  ImportBatch, Student, StudentAccount, StudentProfile, UserAccount, Role, Programme, Intake, sequelize,
} = require('../../src/models');
const { generateRegistrationNo } = require('../../src/utils/registrationNumber');
const { generateTempPassword, hash } = require('../../src/utils/password');
const bulkImportService = require('../../src/services/bulkImportService');

const BASE_PARAMS = {
  filePath: '/tmp/upload.xlsx',
  originalFileName: 'intake-2026.xlsx',
  programmeId: 1,
  intakeId: 2,
  regulationId: 3,
  importedByAdminId: 42,
};

function validRow(overrides = {}) {
  return {
    'Full Name': 'Nimal Perera',
    NIC: '200012345678',
    DOB: '2000-05-14',
    Gender: 'Male',
    Email: 'nimal@example.com',
    Phone: '0771234567',
    Address: '123 Main St',
    ...overrides,
  };
}

function fakeAccount(overrides = {}) {
  return { user_id: 101, addRole: jest.fn().mockResolvedValue(undefined), ...overrides };
}

beforeEach(() => {
  Programme.findByPk.mockResolvedValue({ programme_code: 'AGRI' });
  Intake.findByPk.mockResolvedValue({ intake_year: 2026 });
  Student.findAll.mockResolvedValue([]);
  Role.findOne.mockResolvedValue({ role_name: 'student' });
  ImportBatch.create.mockResolvedValue({ import_batch_id: 7, update: jest.fn().mockResolvedValue(undefined) });
  generateRegistrationNo.mockResolvedValue('AGRI-2026-0001');
  generateTempPassword.mockReturnValue('tempPass1');
  hash.mockResolvedValue('hashed-temp-password');
  UserAccount.create.mockResolvedValue(fakeAccount());
  Student.create.mockResolvedValue({ student_id: 101 });
  StudentAccount.create.mockResolvedValue({});
  StudentProfile.create.mockResolvedValue({});
});

describe('importStudents - guard clauses', () => {
  it('422s when the sheet has no data rows', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([]);
    await expect(bulkImportService.importStudents(BASE_PARAMS)).rejects.toMatchObject({ statusCode: 422 });
  });

  it('404s when the programme does not exist', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow()]);
    Programme.findByPk.mockResolvedValue(null);
    await expect(bulkImportService.importStudents(BASE_PARAMS)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('404s when the intake does not exist', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow()]);
    Intake.findByPk.mockResolvedValue(null);
    await expect(bulkImportService.importStudents(BASE_PARAMS)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('importStudents - per-row validation', () => {
  it('creates a full identity for a fully valid row and marks it Valid', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow()]);

    const { batch, rows } = await bulkImportService.importStudents(BASE_PARAMS);

    expect(UserAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'AGRI20260001', status: 'Inactive' }),
      expect.anything(),
    );
    expect(Student.create).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 101, reg_number: 'AGRI-2026-0001', full_name: 'Nimal Perera', nic: '200012345678',
      }),
      expect.anything(),
    );
    expect(StudentAccount.create).toHaveBeenCalledWith({ student_id: 101 }, expect.anything());
    expect(StudentProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 101, email: 'nimal@example.com', contact_no: '0771234567', address: '123 Main St',
      }),
      expect.anything(),
    );
    expect(rows).toEqual([expect.objectContaining({
      row_number: 1, reg_number: 'AGRI-2026-0001', nic: '200012345678', validation_status: 'Valid', student_id: 101,
    })]);
    expect(batch.update).toHaveBeenCalledWith(
      { valid_records: 1, invalid_records: 0, status: 'Completed' },
      expect.anything(),
    );
  });

  it('assigns the student role to the newly created account', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow()]);
    const account = fakeAccount();
    UserAccount.create.mockResolvedValue(account);
    const role = { role_name: 'student' };
    Role.findOne.mockResolvedValue(role);

    await bulkImportService.importStudents(BASE_PARAMS);

    expect(account.addRole).toHaveBeenCalledWith(role, expect.anything());
  });

  it('marks a row Error and creates nothing when Full Name is missing', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow({ 'Full Name': '' })]);

    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);

    expect(rows[0]).toEqual(expect.objectContaining({
      validation_status: 'Error',
      message: expect.stringContaining('Full Name is required'),
      student_id: null,
    }));
    expect(UserAccount.create).not.toHaveBeenCalled();
  });

  it('marks a row Error when the NIC is missing', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow({ NIC: '' })]);
    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);
    expect(rows[0].message).toContain('NIC is required');
  });

  it('marks a row Error when the NIC format is invalid', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow({ NIC: 'not-a-nic' })]);
    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);
    expect(rows[0].message).toContain('NIC format is invalid');
  });

  it.each(['200012345678', '200012345v', '200012345X'])('accepts NIC format "%s"', async (nic) => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow({ NIC: nic })]);
    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);
    expect(rows[0].validation_status).not.toBe('Error');
  });

  it('marks a row Error when NIC duplicates one already in the database', async () => {
    Student.findAll.mockResolvedValue([{ nic: '200012345678' }]);
    XLSX.utils.sheet_to_json.mockReturnValue([validRow()]);

    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);

    expect(rows[0].validation_status).toBe('Error');
    expect(rows[0].message).toContain('duplicated');
  });

  it('marks the second occurrence Error when the same NIC repeats within the file', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow(), validRow({ 'Full Name': 'Someone Else' })]);

    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);

    expect(rows[0].validation_status).toBe('Valid');
    expect(rows[1].validation_status).toBe('Error');
    expect(rows[1].message).toContain('duplicated');
  });

  it('marks a row Error when DOB is missing/unparsable', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow({ DOB: '' })]);
    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);
    expect(rows[0].message).toContain('DOB is required');
  });

  it('marks a row Error when Gender is missing', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow({ Gender: '' })]);
    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);
    expect(rows[0].message).toContain('Gender must be Male, Female, or Other');
  });

  it.each([['Male', 'Male'], ['female', 'Female'], ['M', 'Male'], ['nonbinary', 'Other']])(
    'normalizes Gender "%s" to "%s"',
    async (input, expected) => {
      XLSX.utils.sheet_to_json.mockReturnValue([validRow({ Gender: input })]);
      await bulkImportService.importStudents(BASE_PARAMS);
      expect(Student.create).toHaveBeenCalledWith(expect.objectContaining({ nic: '200012345678' }), expect.anything());
      expect(StudentProfile.create).toHaveBeenCalledWith(expect.objectContaining({ gender: expected }), expect.anything());
    },
  );

  it('marks a row Warning (but still creates the student) when no contact details are supplied', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow({ Email: '', Phone: '', Address: '' })]);

    const { rows } = await bulkImportService.importStudents(BASE_PARAMS);

    expect(rows[0].validation_status).toBe('Warning');
    expect(rows[0].message).toMatch(/contact details/i);
    expect(rows[0].student_id).not.toBeNull();
    expect(UserAccount.create).toHaveBeenCalled();
  });

  it('processes a mix of valid/warning/error rows independently and tallies the batch counts', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([
      validRow({ NIC: '111111111111' }),
      validRow({ NIC: '222222222222', Email: '', Phone: '', Address: '' }),
      validRow({ NIC: 'bad-nic' }),
    ]);
    generateRegistrationNo
      .mockResolvedValueOnce('AGRI-2026-0001')
      .mockResolvedValueOnce('AGRI-2026-0002');

    const { batch, rows } = await bulkImportService.importStudents(BASE_PARAMS);

    expect(rows.map((r) => r.validation_status)).toEqual(['Valid', 'Warning', 'Error']);
    expect(batch.update).toHaveBeenCalledWith(
      { valid_records: 2, invalid_records: 1, status: 'Completed' },
      expect.anything(),
    );
  });

  it('deletes the temp upload file once processing finishes', async () => {
    XLSX.utils.sheet_to_json.mockReturnValue([validRow()]);
    await bulkImportService.importStudents(BASE_PARAMS);
    expect(fs.unlink).toHaveBeenCalledWith(BASE_PARAMS.filePath, expect.any(Function));
  });

  it('processes larger uploads in chunks while keeping the final batch totals accurate', async () => {
    const manyRows = Array.from({ length: 125 }, (_, index) => validRow({
      NIC: `200012345${String(index + 100).padStart(3, '0')}`,
      'Full Name': `Student ${index + 1}`,
      Email: `student${index + 1}@example.com`,
    }));
    XLSX.utils.sheet_to_json.mockReturnValue(manyRows);

    const { rows, batch } = await bulkImportService.importStudents(BASE_PARAMS);

    expect(rows).toHaveLength(125);
    expect(batch.update).toHaveBeenCalledWith(
      { valid_records: 125, invalid_records: 0, status: 'Completed' },
      expect.anything(),
    );
    expect(sequelize.transaction).toHaveBeenCalledTimes(2);
  });
});
