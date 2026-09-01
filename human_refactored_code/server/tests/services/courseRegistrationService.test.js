jest.mock('../../src/models', () => ({
  Student: { findByPk: jest.fn() },
  Course: { findAll: jest.fn() },
  CourseRegistration: { findOrCreate: jest.fn(), findByPk: jest.fn() },
  CourseRegistrationItem: { destroy: jest.fn(), bulkCreate: jest.fn() },
  Semester: { findByPk: jest.fn() },
  sequelize: { transaction: jest.fn((cb) => cb({})) },
}));
jest.mock('../../src/services/auditService', () => ({ record: jest.fn() }));

const {
  Student, Course, CourseRegistration, CourseRegistrationItem, Semester,
} = require('../../src/models');
const auditService = require('../../src/services/auditService');
const courseRegistrationService = require('../../src/services/courseRegistrationService');

const REGISTERED_STUDENT = { student_id: 1, current_status: 'Registered' };
const SEMESTER = { semester_id: 3 };

function course(overrides) {
  return { course_id: 1, credits: 3, is_elective: false, ...overrides };
}

describe('getAvailableCourses (eligibility gate)', () => {
  it('404s when the student does not exist', async () => {
    Student.findByPk.mockResolvedValue(null);
    await expect(courseRegistrationService.getAvailableCourses(1, 3)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('403s when the student is not Registered (e.g. still Prospective)', async () => {
    Student.findByPk.mockResolvedValue({ student_id: 1, current_status: 'Prospective' });
    await expect(courseRegistrationService.getAvailableCourses(1, 3)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('404s when the semester does not exist', async () => {
    Student.findByPk.mockResolvedValue(REGISTERED_STUDENT);
    Semester.findByPk.mockResolvedValue(null);
    await expect(courseRegistrationService.getAvailableCourses(1, 3)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns every course (no programme/year catalog exists to scope by), ordered by course_code', async () => {
    Student.findByPk.mockResolvedValue(REGISTERED_STUDENT);
    Semester.findByPk.mockResolvedValue(SEMESTER);
    const courses = [course({ course_id: 1 }), course({ course_id: 2 })];
    Course.findAll.mockResolvedValue(courses);

    const result = await courseRegistrationService.getAvailableCourses(1, 3);

    expect(Course.findAll).toHaveBeenCalledWith({ order: [['course_code', 'ASC']] });
    expect(result).toBe(courses);
  });
});

describe('submitRegistration', () => {
  beforeEach(() => {
    Student.findByPk.mockResolvedValue(REGISTERED_STUDENT);
    Semester.findByPk.mockResolvedValue(SEMESTER);
  });

  it('422s when a course ID is not a positive integer', async () => {
    await expect(courseRegistrationService.submitRegistration(1, 3, ['1'])).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringMatching(/positive integers/i),
    });
    expect(Student.findByPk).not.toHaveBeenCalled();
  });

  it('422s on an empty courseIds array', async () => {
    await expect(courseRegistrationService.submitRegistration(1, 3, [])).rejects.toMatchObject({ statusCode: 422 });
  });

  it('422s on duplicate course IDs', async () => {
    await expect(courseRegistrationService.submitRegistration(1, 3, [1, 1])).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringMatching(/duplicate/i),
    });
  });

  it('propagates the eligibility check (e.g. student not Registered) before looking at courses at all', async () => {
    Student.findByPk.mockResolvedValue({ student_id: 1, current_status: 'Prospective' });
    await expect(courseRegistrationService.submitRegistration(1, 3, [1, 2])).rejects.toMatchObject({ statusCode: 403 });
    expect(Course.findAll).not.toHaveBeenCalled();
  });

  it('422s when one or more course IDs do not exist', async () => {
    Course.findAll.mockResolvedValue([course({ course_id: 1 })]); // only 1 of 2 found
    await expect(courseRegistrationService.submitRegistration(1, 3, [1, 2])).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringMatching(/do not exist/i),
    });
  });

  it('422s when total credits are below the minimum (15)', async () => {
    Course.findAll.mockResolvedValue([course({ course_id: 1, credits: 3 })]);
    await expect(courseRegistrationService.submitRegistration(1, 3, [1])).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringMatching(/between 15 and 22/),
    });
  });

  it('422s when total credits exceed the maximum (22)', async () => {
    Course.findAll.mockResolvedValue([
      course({ course_id: 1, credits: 12 }), course({ course_id: 2, credits: 12 }),
    ]);
    await expect(courseRegistrationService.submitRegistration(1, 3, [1, 2])).rejects.toMatchObject({ statusCode: 422 });
  });

  it('409s when the semester registration is already Approved', async () => {
    Course.findAll.mockResolvedValue([course({ course_id: 1, credits: 18 })]);
    CourseRegistration.findOrCreate.mockResolvedValue([{ status: 'Approved', registration_id: 99 }, false]);

    await expect(courseRegistrationService.submitRegistration(1, 3, [1])).rejects.toMatchObject({ statusCode: 409 });
    expect(CourseRegistrationItem.destroy).not.toHaveBeenCalled();
  });

  it('replaces existing items, copies is_elective/is_compulsory from each course, and sets status Submitted', async () => {
    const courses = [
      course({ course_id: 1, credits: 10, is_elective: false }),
      course({ course_id: 2, credits: 8, is_elective: true }),
    ];
    Course.findAll.mockResolvedValueOnce(courses); // credit-range lookup
    const reg = { status: 'Draft', registration_id: 55, update: jest.fn().mockResolvedValue(undefined) };
    CourseRegistration.findOrCreate.mockResolvedValue([reg, true]);
    const finalRegistration = { registration_id: 55, status: 'Submitted' };
    CourseRegistration.findByPk.mockResolvedValue(finalRegistration);

    const result = await courseRegistrationService.submitRegistration(1, 3, [1, 2]);

    expect(CourseRegistrationItem.destroy).toHaveBeenCalledWith(expect.objectContaining({
      where: { registration_id: 55 },
    }));
    expect(CourseRegistrationItem.bulkCreate).toHaveBeenCalledWith(
      [
        { registration_id: 55, course_id: 1, is_elective: false, is_compulsory: true },
        { registration_id: 55, course_id: 2, is_elective: true, is_compulsory: false },
      ],
      expect.objectContaining({ transaction: expect.anything() }),
    );
    expect(reg.update).toHaveBeenCalledWith(
      { status: 'Submitted', registration_date: expect.any(Date) },
      expect.objectContaining({ transaction: expect.anything() }),
    );
    expect(result).toBe(finalRegistration);
  });
});

describe('decideRegistration', () => {
  it('422s for an unsupported decision before querying the registration', async () => {
    await expect(courseRegistrationService.decideRegistration(1, 'pending', 42)).rejects.toMatchObject({
      statusCode: 422,
    });
    expect(CourseRegistration.findByPk).not.toHaveBeenCalled();
  });

  it('404s when the registration does not exist', async () => {
    CourseRegistration.findByPk.mockResolvedValue(null);
    await expect(courseRegistrationService.decideRegistration(1, 'approve', 42)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('409s when the registration is not Submitted', async () => {
    CourseRegistration.findByPk.mockResolvedValue({ status: 'Draft' });
    await expect(courseRegistrationService.decideRegistration(1, 'approve', 42)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('approves a submitted registration and audits it', async () => {
    const registration = { status: 'Submitted', registration_id: 10, update: jest.fn().mockResolvedValue(undefined) };
    CourseRegistration.findByPk.mockResolvedValue(registration);

    const result = await courseRegistrationService.decideRegistration(10, 'approve', 42);

    expect(registration.update).toHaveBeenCalledWith({ status: 'Approved' });
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 42,
      action: 'APPROVED',
      entityName: 'course_registration',
      entityId: 10,
    }));
    expect(result).toBe(registration);
  });

  it('rejects a submitted registration when the decision is anything other than "approve"', async () => {
    const registration = { status: 'Submitted', registration_id: 11, update: jest.fn().mockResolvedValue(undefined) };
    CourseRegistration.findByPk.mockResolvedValue(registration);

    await courseRegistrationService.decideRegistration(11, 'reject', 42);

    expect(registration.update).toHaveBeenCalledWith({ status: 'Rejected' });
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'REJECTED' }));
  });
});
