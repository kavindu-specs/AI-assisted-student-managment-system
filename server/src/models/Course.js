const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
  course_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  course_name: { type: DataTypes.STRING(150), allowNull: false },
  credits: { type: DataTypes.TINYINT, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
}, {
  tableName: 'course',
});

module.exports = Course;
