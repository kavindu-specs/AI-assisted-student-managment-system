const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  audit_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  actor_id: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entity_name: { type: DataTypes.STRING(100), allowNull: false },
  entity_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  ip_address: { type: DataTypes.STRING(45), allowNull: true },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'audit_log',
  timestamps: false,
});

module.exports = AuditLog;
