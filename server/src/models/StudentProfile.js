const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentProfile = sequelize.define('StudentProfile', {
  profile_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  address_line_1: { type: DataTypes.STRING(150), allowNull: true },
  address_line_2: { type: DataTypes.STRING(150), allowNull: true },
  district: { type: DataTypes.STRING(50), allowNull: true },
  gs_division: { type: DataTypes.STRING(100), allowNull: true },
  electorate: { type: DataTypes.STRING(100), allowNull: true },
  mobile_phone: { type: DataTypes.STRING(20), allowNull: true },
  land_phone: { type: DataTypes.STRING(20), allowNull: true },
  email: { type: DataTypes.STRING(150), allowNull: true },
  guardian_name: { type: DataTypes.STRING(150), allowNull: true },
  guardian_relationship: { type: DataTypes.STRING(50), allowNull: true },
  guardian_phone: { type: DataTypes.STRING(20), allowNull: true },
  emergency_contact: { type: DataTypes.STRING(150), allowNull: true },
  profile_completion_status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed'),
    allowNull: false,
    defaultValue: 'Not Started',
  },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'student_profile',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: false,
});

module.exports = StudentProfile;
