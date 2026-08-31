const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CorrectionRequest = sequelize.define('CorrectionRequest', {
  correction_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.INTEGER, allowNull: false },
  requested_by: { type: DataTypes.INTEGER, allowNull: false },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  justification: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending',
  },
}, {
  tableName: 'correction_request',
  timestamps: false,
});

module.exports = CorrectionRequest;
