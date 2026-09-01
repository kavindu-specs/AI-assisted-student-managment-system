jest.mock('../../src/models', () => ({
  Student: { findByPk: jest.fn() },
  UserAccount: { findByPk: jest.fn() },
  sequelize: { transaction: jest.fn((cb) => cb({})) },
}));
jest.mock('../../src/utils/password', () => ({
  generateTempPassword: jest.fn(),
  hash: jest.fn(),
}));
jest.mock('../../src/services/notificationService', () => ({ notify: jest.fn() }));
jest.mock('../../src/services/auditService', () => ({ record: jest.fn() }));

const { Student, UserAccount } = require('../../src/models');
const { generateTempPassword, hash } = require('../../src/utils/password');
const notificationService = require('../../src/services/notificationService');
const auditService = require('../../src/services/auditService');
const approvalService = require('../../src/services/approvalService');

function fakeStudent(overrides = {}) {
  return {
    student_id: 5,
    reg_number: 'AGRI-2026-0005',
    current_status: 'Prospective',
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function fakeAccount(overrides = {}) {
  return {
    user_id: 5,
    username: 'agri20260005',
    email: 'agri20260005@students.rjt.ac.lk',
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('approveStudent', () => {
  it('404s when the student does not exist', async () => {
    Student.findByPk.mockResolvedValue(null);
    await expect(approvalService.approveStudent(999, 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('409s when the student is not Prospective (already decided)', async () => {
    Student.findByPk.mockResolvedValue(fakeStudent({ current_status: 'Registered' }));
    await expect(approvalService.approveStudent(5, 1))
      .rejects.toMatchObject({ statusCode: 409, message: 'Student is already Registered' });
  });

  it('500s if a Prospective student somehow has no matching UserAccount row', async () => {
    Student.findByPk.mockResolvedValue(fakeStudent());
    UserAccount.findByPk.mockResolvedValue(null);
    await expect(approvalService.approveStudent(5, 1)).rejects.toMatchObject({ statusCode: 500 });
  });

  it('activates the account, registers the student, audits, notifies, and returns the temp password once', async () => {
    const student = fakeStudent();
    const account = fakeAccount();
    Student.findByPk.mockResolvedValue(student);
    UserAccount.findByPk.mockResolvedValue(account);
    generateTempPassword.mockReturnValue('Xk92Ptn4Qb');
    hash.mockResolvedValue('hashed-temp-password');

    const result = await approvalService.approveStudent(5, 42);

    expect(account.update).toHaveBeenCalledWith(
      { password_hash: 'hashed-temp-password', status: 'Active' },
      expect.objectContaining({ transaction: expect.anything() }),
    );
    expect(student.update).toHaveBeenCalledWith(
      { current_status: 'Registered', account_status: 'Active' },
      expect.objectContaining({ transaction: expect.anything() }),
    );
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 42,
      action: 'APPROVE',
      entityName: 'student',
      entityId: 5,
      description: expect.stringContaining('AGRI-2026-0005'),
    }));
    expect(notificationService.notify).toHaveBeenCalledWith(expect.objectContaining({
      userId: 5,
      email: account.email,
      message: expect.stringContaining('Xk92Ptn4Qb'),
    }));
    expect(result).toEqual({ student, account, tempPassword: 'Xk92Ptn4Qb' });
  });
});

describe('rejectStudent', () => {
  it('404s when the student does not exist', async () => {
    Student.findByPk.mockResolvedValue(null);
    await expect(approvalService.rejectStudent(999, 1, 'reason')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('409s when the student is not Prospective', async () => {
    Student.findByPk.mockResolvedValue(fakeStudent({ current_status: 'Graduated' }));
    await expect(approvalService.rejectStudent(5, 1, 'reason')).rejects.toMatchObject({ statusCode: 409 });
  });

  it('suspends the account_status (no dedicated Rejected value exists) and audits the reason', async () => {
    const student = fakeStudent();
    Student.findByPk.mockResolvedValue(student);

    const result = await approvalService.rejectStudent(5, 42, 'Duplicate NIC');

    expect(student.update).toHaveBeenCalledWith({ account_status: 'Suspended' });
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 42,
      action: 'REJECT',
      entityId: 5,
      description: 'Duplicate NIC',
    }));
    expect(result).toBe(student);
  });

  it('audits a null description when no reason is given', async () => {
    Student.findByPk.mockResolvedValue(fakeStudent());
    await approvalService.rejectStudent(5, 42);
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({ description: null }));
  });
});

describe('bulkDecide', () => {
  it('processes every ID independently, isolating one failure from the rest', async () => {
    Student.findByPk.mockImplementation((id) => {
      if (id === 1) return Promise.resolve(fakeStudent({ student_id: 1, current_status: 'Prospective' }));
      if (id === 2) return Promise.resolve(fakeStudent({ student_id: 2, current_status: 'Registered' })); // already decided
      return Promise.resolve(null); // id 3: not found
    });
    UserAccount.findByPk.mockResolvedValue(fakeAccount({ user_id: 1 }));
    generateTempPassword.mockReturnValue('tempPass1');
    hash.mockResolvedValue('hashed');

    const results = await approvalService.bulkDecide([1, 2, 3], 'approve', 42);

    expect(results).toEqual([
      { studentId: 1, success: true, data: expect.objectContaining({ tempPassword: 'tempPass1' }) },
      { studentId: 2, success: false, error: 'Student is already Registered' },
      { studentId: 3, success: false, error: 'Student not found' },
    ]);
  });

  it('routes to rejectStudent when decision is "reject"', async () => {
    Student.findByPk.mockResolvedValue(fakeStudent({ student_id: 7 }));

    const results = await approvalService.bulkDecide([7], 'reject', 42, 'not eligible');

    expect(results).toEqual([{ studentId: 7, success: true, data: expect.objectContaining({ student_id: 7 }) }]);
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'REJECT', description: 'not eligible' }));
  });
});
