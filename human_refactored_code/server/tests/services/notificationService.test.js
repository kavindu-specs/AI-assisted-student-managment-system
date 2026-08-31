describe('notificationService (SMTP not configured)', () => {
  let Notification;
  let logger;
  let notify;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../../src/config/env', () => ({
      mail: {
        host: '', port: 587, user: '', password: '', from: 'no-reply@rjt.ac.lk',
      },
    }));
    jest.doMock('../../src/models', () => ({ Notification: { create: jest.fn() } }));
    jest.doMock('../../src/utils/logger', () => ({ warn: jest.fn(), error: jest.fn() }));
    jest.doMock('nodemailer', () => ({ createTransport: jest.fn() }));

    ({ Notification } = require('../../src/models'));
    // eslint-disable-next-line global-require
    logger = require('../../src/utils/logger');
    // eslint-disable-next-line global-require
    ({ notify } = require('../../src/services/notificationService'));
  });

  it('creates the in-app Notification row with the expected column mapping', async () => {
    Notification.create.mockResolvedValue({ notification_id: 1 });

    await notify({
      userId: 1, title: 'Hi', message: 'Body', email: 'a@b.com',
    });

    expect(Notification.create).toHaveBeenCalledWith({
      user_id: 1, title: 'Hi', message: 'Body', type: 'Info', created_as: 'System',
    });
  });

  it('respects an explicit type override instead of the "Info" default', async () => {
    Notification.create.mockResolvedValue({ notification_id: 1 });
    await notify({
      userId: 1, title: 'Hi', message: 'Body', type: 'Warning',
    });
    expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'Warning' }));
  });

  it('logs a warning instead of sending when an email was requested but SMTP is not configured', async () => {
    Notification.create.mockResolvedValue({ notification_id: 1 });
    await notify({
      userId: 1, title: 'Hi', message: 'Body', email: 'a@b.com',
    });
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('SMTP not configured'));
  });

  it('does not warn at all when no email address is given (in-app notification only)', async () => {
    Notification.create.mockResolvedValue({ notification_id: 2 });
    await notify({ userId: 1, title: 'Hi', message: 'Body' });
    expect(logger.warn).not.toHaveBeenCalled();
  });
});

describe('notificationService (SMTP configured)', () => {
  let Notification;
  let logger;
  let notify;
  let sendMail;

  beforeEach(() => {
    jest.resetModules();
    sendMail = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../../src/config/env', () => ({
      mail: {
        host: 'smtp.example.com', port: 587, user: 'u', password: 'p', from: 'no-reply@rjt.ac.lk',
      },
    }));
    jest.doMock('../../src/models', () => ({ Notification: { create: jest.fn() } }));
    jest.doMock('../../src/utils/logger', () => ({ warn: jest.fn(), error: jest.fn() }));
    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({ sendMail })),
    }));

    ({ Notification } = require('../../src/models'));
    // eslint-disable-next-line global-require
    logger = require('../../src/utils/logger');
    // eslint-disable-next-line global-require
    ({ notify } = require('../../src/services/notificationService'));
  });

  it('sends the email through the configured transporter using the notification title/message', async () => {
    Notification.create.mockResolvedValue({ notification_id: 3 });

    await notify({
      userId: 1, title: 'Subject', message: 'Body text', email: 'student@x.com',
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'no-reply@rjt.ac.lk', to: 'student@x.com', subject: 'Subject', text: 'Body text',
    });
  });

  it('does not attempt to send when notify() is called with no email', async () => {
    Notification.create.mockResolvedValue({ notification_id: 3 });
    await notify({ userId: 1, title: 'Subject', message: 'Body text' });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('logs the error and still resolves (never throws) when sendMail rejects', async () => {
    sendMail.mockRejectedValue(new Error('SMTP down'));
    Notification.create.mockResolvedValue({ notification_id: 4 });

    await expect(notify({
      userId: 1, title: 'x', message: 'y', email: 'a@b.com',
    })).resolves.toBeDefined();
    expect(logger.error).toHaveBeenCalledWith('Failed to send email notification:', 'SMTP down');
  });
});
