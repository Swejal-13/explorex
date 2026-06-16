const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 */
exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"ExploreX" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    // Don't throw — email failure should not crash the request
  }
};
