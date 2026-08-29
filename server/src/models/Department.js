const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Department = sequelize.define('Department', {
  department_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  faculty_id: { type: DataTypes.INTEGER, allowNull: false },
  department_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  department_name: { type: DataTypes.STRING(150), allowNull: false },
}, {
  tableName: 'department',
});

module.exports = Department;
