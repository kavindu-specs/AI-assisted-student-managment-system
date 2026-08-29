const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Programme = sequelize.define('Programme', {
  programme_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  programme_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  programme_name: { type: DataTypes.STRING(150), allowNull: false },
  programme_type: { type: DataTypes.STRING(50), allowNull: false },
  duration_years: { type: DataTypes.TINYINT, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
}, {
  tableName: 'programme',
});

module.exports = Programme;
