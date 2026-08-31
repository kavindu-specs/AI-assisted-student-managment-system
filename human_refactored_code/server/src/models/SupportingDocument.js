const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SupportingDocument = sequelize.define('SupportingDocument', {
  document_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  doc_type: { type: DataTypes.STRING(100), allowNull: false },
  file_path: { type: DataTypes.STRING(255), allowNull: false },
  uploaded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  is_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  verified_by: { type: DataTypes.INTEGER, allowNull: true },
  verified_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'supporting_document',
  timestamps: false,
});

module.exports = SupportingDocument;
