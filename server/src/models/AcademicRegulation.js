const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AcademicRegulation = sequelize.define('AcademicRegulation', {
  regulation_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regulation_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  regulation_name: { type: DataTypes.STRING(150), allowNull: false },
  effective_from: { type: DataTypes.DATEONLY, allowNull: false },
  effective_to: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
}, {
  tableName: 'academic_regulation',
});

module.exports = AcademicRegulation;
