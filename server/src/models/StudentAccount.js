const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentAccount = sequelize.define('StudentAccount', {
  account_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  login_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'student_account',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = StudentAccount;
