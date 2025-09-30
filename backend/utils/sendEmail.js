const nodemailer = require('nodemailer');

// Configure via environment variables for security
// EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
const port = Number(process.env.EMAIL_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port,
  secure: port === 465, // true for port 465, false for others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function verifyEmailTransport() {
  try {
    await transporter.verify();
    console.log('Email transport verified. Ready to send emails.');
  } catch (err) {
    console.error('Email transport verification failed:', err?.message || err);
  }
}

async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = { sendEmail, verifyEmailTransport };


