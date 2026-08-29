const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  registration_no: { type: DataTypes.STRING(30), allowNull: true, unique: true },
  index_no: { type: DataTypes.STRING(30), allowNull: true, unique: true },
  nic_no: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  full_name: { type: DataTypes.STRING(150), allowNull: false },
  name_with_initials: { type: DataTypes.STRING(150), allowNull: false },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
  gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
  registration_date: { type: DataTypes.DATEONLY, allowNull: true },
  student_status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Active', 'Suspended', 'Graduated', 'Withdrawn'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  programme_id: { type: DataTypes.INTEGER, allowNull: false },
  intake_id: { type: DataTypes.INTEGER, allowNull: false },
  regulation_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'student',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Student;
