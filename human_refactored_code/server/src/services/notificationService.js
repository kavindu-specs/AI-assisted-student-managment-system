const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');
const { Notification } = require('../models');

let transporter = null;
if (env.mail.host) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.password } : undefined,
  });
}

/**
 * Creates an in-app Notification record and, when an email address is given,
 * best-effort sends it by mail too. The schema only models the in-app record
 * (no channel/sent_at columns) so email delivery outcome is logged, not persisted.
 * TODO: wire a real SMS provider if an SMS channel is ever needed.
 */
async function notify({
  userId, title, message, type = 'Info', email = null,
}) {
  const notification = await Notification.create({
    user_id: userId,
    title,
    message,
    type,
    created_as: 'System',
  });

  if (email) {
    if (transporter) {
      try {
        await transporter.sendMail({
          from: env.mail.from, to: email, subject: title, text: message,
        });
      } catch (err) {
        logger.error('Failed to send email notification:', err.message);
      }
    } else {
      logger.warn(`SMTP not configured - notification #${notification.notification_id} logged only.`);
    }
  }

  return notification;
}

module.exports = { notify };
