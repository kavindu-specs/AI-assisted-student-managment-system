const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentSemesterRegistration = sequelize.define('StudentSemesterRegistration', {
  semester_registration_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  semester_id: { type: DataTypes.INTEGER, allowNull: false },
  study_year: { type: DataTypes.TINYINT, allowNull: false },
  study_level: { type: DataTypes.STRING(30), allowNull: true },
  academic_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'Continuing' },
  financial_eligibility: {
    type: DataTypes.ENUM('Eligible', 'Not Eligible'),
    allowNull: false,
    defaultValue: 'Eligible',
  },
  registration_status: {
    type: DataTypes.ENUM('Pending', 'Registered', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  registered_at: { type: DataTypes.DATE, allowNull: true },
  registered_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'student_semester_registration',
  indexes: [{ unique: true, fields: ['student_id', 'semester_id'] }],
});

module.exports = StudentSemesterRegistration;
