jest.mock('../../src/models', () => ({
  Student: { findByPk: jest.fn() },
  StudentProfile: { findOrCreate: jest.fn() },
  ProfilePhotograph: {
    count: jest.fn(), findAll: jest.fn(), update: jest.fn(), create: jest.fn(),
  },
  Signature: {
    count: jest.fn(), findAll: jest.fn(), update: jest.fn(), create: jest.fn(),
  },
  SupportingDocument: {
    count: jest.fn(), findAll: jest.fn(), create: jest.fn(),
  },
  Programme: {},
  Faculty: {},
  Intake: {},
}));
jest.mock('../../src/services/storageService', () => ({ persist: jest.fn() }));

const {
  Student, StudentProfile, ProfilePhotograph, Signature, SupportingDocument,
} = require('../../src/models');
const storageService = require('../../src/services/storageService');
const studentService = require('../../src/services/studentService');

function fakeProfile(overrides = {}) {
  return { student_id: 1, update: jest.fn().mockResolvedValue(undefined), ...overrides };
}

beforeEach(() => {
  ProfilePhotograph.count.mockResolvedValue(0);
  Signature.count.mockResolvedValue(0);
  SupportingDocument.count.mockResolvedValue(0);
  ProfilePhotograph.findAll.mockResolvedValue([]);
  Signature.findAll.mockResolvedValue([]);
  SupportingDocument.findAll.mockResolvedValue([]);
});

describe('findStudentOrThrow', () => {
  it('404s when the student does not exist', async () => {
    Student.findByPk.mockResolvedValue(null);
    await expect(studentService.findStudentOrThrow(999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns the student when found', async () => {
    const student = { student_id: 1 };
    Student.findByPk.mockResolvedValue(student);
    await expect(studentService.findStudentOrThrow(1)).resolves.toBe(student);
  });
});

describe('refreshCompletionPct', () => {
  it('recomputes and persists profile_completion_pct from the current profile + upload counts', async () => {
    const profile = fakeProfile({ address: 'x', contact_no: 'y' }); // 2 of 10 checks
    StudentProfile.findOrCreate.mockResolvedValue([profile, false]);
    ProfilePhotograph.count.mockResolvedValue(1); // has an active photo -> +1 check

    await studentService.refreshCompletionPct(1);

    expect(profile.update).toHaveBeenCalledWith({ profile_completion_pct: 30 });
  });

  it('returns the updated profile', async () => {
    const profile = fakeProfile();
    StudentProfile.findOrCreate.mockResolvedValue([profile, false]);
    await expect(studentService.refreshCompletionPct(1)).resolves.toBe(profile);
  });
});

describe('getFullProfile', () => {
  it('404s when the student does not exist', async () => {
    Student.findByPk.mockResolvedValue(null);
    await expect(studentService.getFullProfile(999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('assembles student + profile + active photo/signature (or null) + documents', async () => {
    const student = { student_id: 1 };
    const profile = fakeProfile();
    Student.findByPk.mockResolvedValue(student);
    StudentProfile.findOrCreate.mockResolvedValue([profile, false]);
    ProfilePhotograph.findAll.mockResolvedValue([{ photo_id: 1 }]);
    Signature.findAll.mockResolvedValue([]); // none uploaded yet
    SupportingDocument.findAll.mockResolvedValue([{ document_id: 1 }]);

    const result = await studentService.getFullProfile(1);

    expect(result).toEqual({
      student, profile, photo: { photo_id: 1 }, signature: null, documents: [{ document_id: 1 }],
    });
  });
});

describe('updateProfile', () => {
  it('only applies allow-listed fields, ignoring anything else in the payload', async () => {
    const profile = fakeProfile();
    StudentProfile.findOrCreate.mockResolvedValue([profile, false]);

    await studentService.updateProfile(1, {
      address: '123 Main St',
      contact_no: '0771234567',
      student_id: 999, // not allow-listed - must be ignored
      profile_completion_pct: 100, // not allow-listed - must be ignored (server-computed only)
    });

    expect(profile.update).toHaveBeenCalledWith({ address: '123 Main St', contact_no: '0771234567' });
  });

  it('does not send fields that were not present in the payload at all', async () => {
    const profile = fakeProfile();
    StudentProfile.findOrCreate.mockResolvedValue([profile, false]);

    await studentService.updateProfile(1, { address: 'only this' });

    expect(profile.update).toHaveBeenCalledWith({ address: 'only this' });
  });

  it('recomputes profile_completion_pct after saving', async () => {
    const profile = fakeProfile({ address: 'x' });
    StudentProfile.findOrCreate.mockResolvedValue([profile, false]);

    await studentService.updateProfile(1, { address: 'x' });

    // update() is called twice: once with the caller's fields, once by refreshCompletionPct with the pct
    expect(profile.update).toHaveBeenNthCalledWith(2, { profile_completion_pct: 10 });
  });
});

describe('uploadPhoto', () => {
  it('404s when the student does not exist', async () => {
    Student.findByPk.mockResolvedValue(null);
    await expect(studentService.uploadPhoto(999, { path: '/tmp/a.jpg' })).rejects.toMatchObject({ statusCode: 404 });
    expect(storageService.persist).not.toHaveBeenCalled();
  });

  it('persists the file, deactivates any previous photo, creates the new one, and refreshes completion', async () => {
    Student.findByPk.mockResolvedValue({ student_id: 1 });
    storageService.persist.mockResolvedValue('uploads/students/1/photo/abc.jpg');
    const created = { photo_id: 9 };
    ProfilePhotograph.create.mockResolvedValue(created);
    StudentProfile.findOrCreate.mockResolvedValue([fakeProfile(), false]);

    const result = await studentService.uploadPhoto(1, { path: '/tmp/abc.jpg' });

    expect(storageService.persist).toHaveBeenCalledWith('/tmp/abc.jpg', { studentId: 1, category: 'photo' });
    expect(ProfilePhotograph.update).toHaveBeenCalledWith(
      { is_active: false },
      { where: { student_id: 1, is_active: true } },
    );
    expect(ProfilePhotograph.create).toHaveBeenCalledWith({
      student_id: 1, file_path: 'uploads/students/1/photo/abc.jpg',
    });
    expect(result).toBe(created);
  });
});

describe('uploadSignature', () => {
  it('persists the file under the "signature" category and deactivates the previous one', async () => {
    Student.findByPk.mockResolvedValue({ student_id: 1 });
    storageService.persist.mockResolvedValue('uploads/students/1/signature/sig.png');
    Signature.create.mockResolvedValue({ signature_id: 3 });
    StudentProfile.findOrCreate.mockResolvedValue([fakeProfile(), false]);

    await studentService.uploadSignature(1, { path: '/tmp/sig.png' });

    expect(storageService.persist).toHaveBeenCalledWith('/tmp/sig.png', { studentId: 1, category: 'signature' });
    expect(Signature.update).toHaveBeenCalledWith(
      { is_active: false },
      { where: { student_id: 1, is_active: true } },
    );
  });
});

describe('uploadDocument', () => {
  it('persists the file under "documents" and stamps the given docType, with no deactivation step', async () => {
    Student.findByPk.mockResolvedValue({ student_id: 1 });
    storageService.persist.mockResolvedValue('uploads/students/1/documents/nic.pdf');
    const created = { document_id: 4 };
    SupportingDocument.create.mockResolvedValue(created);
    StudentProfile.findOrCreate.mockResolvedValue([fakeProfile(), false]);

    const result = await studentService.uploadDocument(1, 'NIC Copy', { path: '/tmp/nic.pdf' });

    expect(storageService.persist).toHaveBeenCalledWith('/tmp/nic.pdf', { studentId: 1, category: 'documents' });
    expect(SupportingDocument.create).toHaveBeenCalledWith({
      student_id: 1, doc_type: 'NIC Copy', file_path: 'uploads/students/1/documents/nic.pdf',
    });
    expect(result).toBe(created);
  });
});
