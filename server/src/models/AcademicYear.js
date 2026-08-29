const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AcademicYear = sequelize.define('AcademicYear', {
  academic_year_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  academic_year: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
}, {
  tableName: 'academic_year',
});

module.exports = AcademicYear;
