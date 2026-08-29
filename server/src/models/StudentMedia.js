const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentMedia = sequelize.define('StudentMedia', {
  media_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  media_type: { type: DataTypes.ENUM('Profile Photo', 'Signature'), allowNull: false },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  mime_type: { type: DataTypes.STRING(100), allowNull: false },
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
  is_current: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'student_media',
});

module.exports = StudentMedia;
