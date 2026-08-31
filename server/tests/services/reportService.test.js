jest.mock('../../src/models', () => ({
  Student: { count: jest.fn(), findAll: jest.fn() },
  Programme: { count: jest.fn() },
  Faculty: {},
  Intake: { count: jest.fn() },
  CourseRegistration: { count: jest.fn(), findAll: jest.fn() },
}));

const {
  Student, Programme, Intake, CourseRegistration,
} = require('../../src/models');
const reportService = require('../../src/services/reportService');

describe('getSummary', () => {
  it('aggregates each count independently and maps them onto named fields', async () => {
    Student.count
      .mockResolvedValueOnce(1200) // total students
      .mockResolvedValueOnce(980); // Registered-status students
    Intake.count.mockResolvedValue(3);
    CourseRegistration.count.mockResolvedValue(890);
    Programme.count.mockResolvedValue(12);

    const result = await reportService.getSummary();

    expect(result).toEqual({
      students: 1200,
      registeredStudents: 980,
      intakes: 3,
      courseRegistrations: 890,
      programmes: 12,
    });
    expect(Student.count).toHaveBeenNthCalledWith(2, { where: { current_status: 'Registered' } });
  });
});

describe('getFacultyDistribution', () => {
  it('maps raw grouped rows into {faculty, count} with count coerced to a number', async () => {
    Student.findAll.mockResolvedValue([
      { 'Programme.Faculty.faculty_name': 'Faculty of Agriculture', count: '640' },
      { 'Programme.Faculty.faculty_name': 'Faculty of Science', count: '210' },
    ]);

    const result = await reportService.getFacultyDistribution();

    expect(result).toEqual([
      { faculty: 'Faculty of Agriculture', count: 640 },
      { faculty: 'Faculty of Science', count: 210 },
    ]);
  });

  it('groups by Programme.Faculty.faculty_id and returns raw rows', async () => {
    Student.findAll.mockResolvedValue([]);
    await reportService.getFacultyDistribution();

    const callArgs = Student.findAll.mock.calls[0][0];
    expect(callArgs.group).toEqual(['Programme.Faculty.faculty_id']);
    expect(callArgs.raw).toBe(true);
  });
});

describe('getMonthlyCourseRegistrations', () => {
  it('maps raw rows into {month, count}, both coerced to numbers', async () => {
    CourseRegistration.findAll.mockResolvedValue([
      { month: '1', count: '34' },
      { month: '2', count: '19' },
    ]);

    const result = await reportService.getMonthlyCourseRegistrations(2026);

    expect(result).toEqual([{ month: 1, count: 34 }, { month: 2, count: 19 }]);
  });

  it('filters by the given year', async () => {
    CourseRegistration.findAll.mockResolvedValue([]);
    await reportService.getMonthlyCourseRegistrations(2027);

    const callArgs = CourseRegistration.findAll.mock.calls[0][0];
    expect(callArgs.where.val).toBe('YEAR(registration_date) = 2027');
  });

  it('defaults to the current calendar year when no year is given', async () => {
    CourseRegistration.findAll.mockResolvedValue([]);
    await reportService.getMonthlyCourseRegistrations(undefined);

    const callArgs = CourseRegistration.findAll.mock.calls[0][0];
    expect(callArgs.where.val).toBe(`YEAR(registration_date) = ${new Date().getFullYear()}`);
  });

  it('falls back to the current year for a non-numeric year value', async () => {
    CourseRegistration.findAll.mockResolvedValue([]);
    await reportService.getMonthlyCourseRegistrations('not-a-year');

    const callArgs = CourseRegistration.findAll.mock.calls[0][0];
    expect(callArgs.where.val).toBe(`YEAR(registration_date) = ${new Date().getFullYear()}`);
  });
});
