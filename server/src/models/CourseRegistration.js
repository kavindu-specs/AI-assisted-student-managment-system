const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CourseRegistration = sequelize.define('CourseRegistration', {
  course_registration_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  semester_id: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Rejected'),
    allowNull: false,
    defaultValue: 'Draft',
  },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  approved_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'course_registration',
  indexes: [{ unique: true, fields: ['student_id', 'semester_id'] }],
});

module.exports = CourseRegistration;
