const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AcademicYear = sequelize.define('AcademicYear', {
  academic_year_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  year_code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
}, {
  tableName: 'academic_year',
});

module.exports = AcademicYear;
