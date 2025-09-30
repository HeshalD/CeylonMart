const { sendEmail } = require('../utils/sendEmail');

class EmailService {
  static async sendOtpEmail({ to, otp }) {
    const subject = 'Your verification code (OTP)';
    const text = `Your OTP is ${otp}. It expires in 5 minutes.`;
    const html = `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`;
    return await sendEmail({ to, subject, text, html });
  }
}

module.exports = EmailService;


