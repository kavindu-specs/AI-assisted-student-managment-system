const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Signature = sequelize.define('Signature', {
  signature_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  file_path: { type: DataTypes.STRING(255), allowNull: false },
  uploaded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'signature',
  timestamps: false,
});

module.exports = Signature;
