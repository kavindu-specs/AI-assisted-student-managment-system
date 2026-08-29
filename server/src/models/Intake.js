const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Intake = sequelize.define('Intake', {
  intake_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  intake_name: { type: DataTypes.STRING(100), allowNull: false },
  admission_year: { type: DataTypes.INTEGER, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
}, {
  tableName: 'intake',
});

module.exports = Intake;
