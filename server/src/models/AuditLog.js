const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  audit_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: true },
  entity_type: { type: DataTypes.STRING(50), allowNull: false },
  entity_id: { type: DataTypes.STRING(50), allowNull: false },
  action: { type: DataTypes.STRING(50), allowNull: false },
  old_value: { type: DataTypes.JSON, allowNull: true },
  new_value: { type: DataTypes.JSON, allowNull: true },
  reason: { type: DataTypes.STRING(255), allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  ip_address: { type: DataTypes.STRING(45), allowNull: true },
}, {
  tableName: 'audit_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AuditLog;
