const { fn, col, literal } = require('sequelize');
const {
  Student, Programme, Department, Intake, CourseRegistration, sequelize,
} = require('../models');

async function getSummary() {
  const [studentCount, intakeCount, registrationCount, programmeCount] = await Promise.all([
    Student.count(),
    Intake.count({ where: { status: 'Active' } }),
    CourseRegistration.count(),
    Programme.count({ where: { status: 'Active' } }),
  ]);

  return {
    students: studentCount,
    activeIntakes: intakeCount,
    courseRegistrations: registrationCount,
    activeProgrammes: programmeCount,
  };
}

async function getDepartmentDistribution() {
  const rows = await Student.findAll({
    attributes: [[fn('COUNT', col('Student.student_id')), 'count']],
    include: [{
      model: Programme,
      attributes: [],
      required: true,
      include: [{ model: Department, attributes: ['department_id', 'department_name'], required: true }],
    }],
    group: ['Programme.Department.department_id'],
    raw: true,
  });

  return rows.map((r) => ({
    department: r['Programme.Department.department_name'],
    count: Number(r.count),
  }));
}

async function getMonthlyRegistrations(year) {
  const rows = await Student.findAll({
    attributes: [
      [fn('MONTH', col('registration_date')), 'month'],
      [fn('COUNT', col('student_id')), 'count'],
    ],
    where: literal(`YEAR(registration_date) = ${Number(year) || new Date().getFullYear()}`),
    group: [fn('MONTH', col('registration_date'))],
    order: [[fn('MONTH', col('registration_date')), 'ASC']],
    raw: true,
  });

  return rows.map((r) => ({ month: Number(r.month), count: Number(r.count) }));
}

module.exports = { getSummary, getDepartmentDistribution, getMonthlyRegistrations };
