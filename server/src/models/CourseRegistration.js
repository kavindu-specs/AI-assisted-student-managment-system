const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CourseRegistration = sequelize.define('CourseRegistration', {
  registration_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  semester_id: { type: DataTypes.INTEGER, allowNull: false },
  registration_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Rejected'),
    allowNull: false,
    defaultValue: 'Draft',
  },
}, {
  tableName: 'course_registration',
  timestamps: false,
  indexes: [{ unique: true, fields: ['student_id', 'semester_id'] }],
});

module.exports = CourseRegistration;
