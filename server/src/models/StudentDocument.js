const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentDocument = sequelize.define('StudentDocument', {
  document_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  document_type: {
    type: DataTypes.ENUM(
      'NIC Copy',
      'Birth Certificate',
      'Admission Letter',
      'Medical Certificate',
      'School Certificate',
      'Other',
    ),
    allowNull: false,
  },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  verification_status: {
    type: DataTypes.ENUM('Pending', 'Verified', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
  uploaded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  verified_by: { type: DataTypes.INTEGER, allowNull: true },
  verified_at: { type: DataTypes.DATE, allowNull: true },
  rejection_reason: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'student_document',
});

module.exports = StudentDocument;
