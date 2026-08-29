const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProgrammeCourse = sequelize.define('ProgrammeCourse', {
  programme_course_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  programme_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  recommended_year: { type: DataTypes.TINYINT, allowNull: false },
  semester_no: { type: DataTypes.TINYINT, allowNull: false },
  course_type: {
    type: DataTypes.ENUM('Compulsory', 'Elective'),
    allowNull: false,
    defaultValue: 'Compulsory',
  },
  is_compulsory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'programme_course',
  indexes: [{ unique: true, fields: ['programme_id', 'course_id', 'recommended_year', 'semester_no'] }],
});

module.exports = ProgrammeCourse;
