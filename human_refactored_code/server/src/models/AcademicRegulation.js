const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AcademicRegulation = sequelize.define('AcademicRegulation', {
  regulation_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  regulation_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  regulation_name: { type: DataTypes.STRING(200), allowNull: false },
  effective_from: { type: DataTypes.DATEONLY, allowNull: false },
}, {
  tableName: 'academic_regulation',
});

module.exports = AcademicRegulation;
