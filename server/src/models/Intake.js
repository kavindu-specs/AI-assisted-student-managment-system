const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Intake = sequelize.define('Intake', {
  intake_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  programme_id: { type: DataTypes.INTEGER, allowNull: false },
  intake_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  intake_year: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'intake',
});

module.exports = Intake;
