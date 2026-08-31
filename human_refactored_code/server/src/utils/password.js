const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const env = require('../config/env');

function hash(plain) {
  return bcrypt.hash(plain, env.bcryptSaltRounds);
}

function compare(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

const TEMP_PASSWORD_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function generateTempPassword(length = 10) {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += TEMP_PASSWORD_CHARS[crypto.randomInt(TEMP_PASSWORD_CHARS.length)];
  }
  return out;
}

function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

module.exports = { hash, compare, generateTempPassword, generateOtp };
