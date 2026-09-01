const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Not part of the refined EER diagram - added so admin OTP verification
// works correctly across clustered worker processes (see authService.js).
const OtpChallenge = sequelize.define('OtpChallenge', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  otp_hash: { type: DataTypes.STRING(255), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'otp_challenge',
  timestamps: false,
});

module.exports = OtpChallenge;
