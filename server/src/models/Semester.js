const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Semester = sequelize.define('Semester', {
  semester_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  academic_year_id: { type: DataTypes.INTEGER, allowNull: false },
  semester_code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  semester_name: { type: DataTypes.STRING(100), allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
}, {
  tableName: 'semester',
});

module.exports = Semester;
