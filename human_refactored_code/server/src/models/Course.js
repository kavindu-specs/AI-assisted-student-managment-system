const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
  course_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  course_name: { type: DataTypes.STRING(200), allowNull: false },
  credits: { type: DataTypes.INTEGER, allowNull: false },
  is_elective: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'course',
});

module.exports = Course;
