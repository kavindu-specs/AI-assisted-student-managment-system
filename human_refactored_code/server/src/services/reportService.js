const { fn, col, literal } = require('sequelize');
const {
  Student, Programme, Faculty, Intake, CourseRegistration,
} = require('../models');
const { STUDENT_CURRENT_STATUS } = require('../config/constants');

async function getSummary() {
  const [studentCount, registeredCount, activeIntakeCount, courseRegistrationCount, programmeCount] = await Promise.all([
    Student.count(),
    Student.count({ where: { current_status: STUDENT_CURRENT_STATUS.REGISTERED } }),
    Intake.count(),
    CourseRegistration.count(),
    Programme.count(),
  ]);

  return {
    students: studentCount,
    registeredStudents: registeredCount,
    intakes: activeIntakeCount,
    courseRegistrations: courseRegistrationCount,
    programmes: programmeCount,
  };
}

async function getFacultyDistribution() {
  const rows = await Student.findAll({
    attributes: [[fn('COUNT', col('Student.student_id')), 'count']],
    include: [{
      model: Programme,
      attributes: [],
      required: true,
      include: [{ model: Faculty, attributes: ['faculty_id', 'faculty_name'], required: true }],
    }],
    group: ['Programme.Faculty.faculty_id'],
    raw: true,
  });

  return rows.map((r) => ({
    faculty: r['Programme.Faculty.faculty_name'],
    count: Number(r.count),
  }));
}

async function getMonthlyCourseRegistrations(year) {
  const rows = await CourseRegistration.findAll({
    attributes: [
      [fn('MONTH', col('registration_date')), 'month'],
      [fn('COUNT', col('registration_id')), 'count'],
    ],
    where: literal(`YEAR(registration_date) = ${Number(year) || new Date().getFullYear()}`),
    group: [fn('MONTH', col('registration_date'))],
    order: [[fn('MONTH', col('registration_date')), 'ASC']],
    raw: true,
  });

  return rows.map((r) => ({ month: Number(r.month), count: Number(r.count) }));
}

module.exports = { getSummary, getFacultyDistribution, getMonthlyCourseRegistrations };
