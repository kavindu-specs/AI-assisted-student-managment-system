// server/src/models/StudentProfile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentProfile = sequelize.define('StudentProfile', {
  profile_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  contact_no: { type: DataTypes.STRING(20), allowNull: true },
  email: { type: DataTypes.STRING(150), allowNull: true },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: true },
  family_info: { type: DataTypes.TEXT, allowNull: true },
  emergency_contact: { type: DataTypes.STRING(150), allowNull: true },
  other_details: { type: DataTypes.TEXT, allowNull: true },
  profile_completion_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, //add created at column
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, //add updated at column
}, {
  tableName: 'student_profile',
  timestamps: false,
});

module.exports = StudentProfile;