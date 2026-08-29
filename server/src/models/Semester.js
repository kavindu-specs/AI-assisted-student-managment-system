const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Semester = sequelize.define('Semester', {
  semester_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  academic_year_id: { type: DataTypes.INTEGER, allowNull: false },
  semester_no: { type: DataTypes.TINYINT, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  registration_open: { type: DataTypes.DATE, allowNull: true },
  registration_close: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
}, {
  tableName: 'semester',
});

module.exports = Semester;
