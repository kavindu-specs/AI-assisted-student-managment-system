const os = require('os');

require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  return value;
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: [process.env.CLIENT_ADMIN_ORIGIN, process.env.CLIENT_STUDENT_ORIGIN].filter(Boolean),

  // Multi-process serving (see server.js). Disable for local debugging with
  // a single attached process (CLUSTER_ENABLED=false), or pin a worker count
  // (defaults to one worker per CPU core).
  clusterEnabled: required('CLUSTER_ENABLED', 'true') !== 'false',
  clusterWorkers: Number(process.env.CLUSTER_WORKERS) || os.cpus().length,

  db: {
    host: required('DB_HOST', '127.0.0.1'),
    port: Number(process.env.DB_PORT) || 3306,
    name: required('DB_NAME', 'rajarata_sms'),
    user: required('DB_USER', 'root'),
    password: required('DB_PASSWORD', ''),
    // Per-worker pool cap - see the comment in config/db.js.
    poolMax: Number(process.env.DB_POOL_MAX) || 5,
  },

  jwt: {
    secret: required('JWT_SECRET', 'dev-secret-change-me'),
    expiresIn: required('JWT_EXPIRES_IN', '8h'),
    preAuthExpiresIn: required('PRE_AUTH_TOKEN_EXPIRES_IN', '10m'),
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  adminEmailDomain: required('ADMIN_EMAIL_DOMAIN', 'agri.rjt.ac.lk'),
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES) || 5,
  tempPasswordValidDays: Number(process.env.TEMP_PASSWORD_VALID_DAYS) || 7,

  upload: {
    dir: required('UPLOAD_DIR', 'uploads'),
    maxSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB) || 5,
  },

  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: required('MAIL_FROM', 'no-reply@rjt.ac.lk'),
  },
};
