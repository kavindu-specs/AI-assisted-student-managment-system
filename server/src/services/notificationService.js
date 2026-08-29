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
 * Creates a notification record and attempts delivery.
 * TODO: wire a real SMS provider for the 'SMS' channel; email uses SMTP when configured.
 */
async function notify({ userId, type, channel = 'Email', subject, message, to }) {
  const notification = await Notification.create({
    user_id: userId,
    type,
    channel,
    subject,
    message,
  });

  if (channel === 'Email') {
    if (transporter && to) {
      try {
        await transporter.sendMail({ from: env.mail.from, to, subject, text: message });
        await notification.update({ sent_at: new Date() });
      } catch (err) {
        logger.error('Failed to send email notification:', err.message);
      }
    } else {
      logger.warn(`SMTP not configured - notification #${notification.notification_id} logged only.`);
    }
  } else {
    logger.warn(`Channel "${channel}" not yet wired to a real provider - notification #${notification.notification_id} logged only.`);
  }

  return notification;
}

module.exports = { notify };
