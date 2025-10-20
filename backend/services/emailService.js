const { sendEmail } = require('../utils/sendEmail');

class EmailService {
  static async sendOtpEmail({ to, otp }) {
    const subject = 'Your verification code (OTP)';
    const text = `Your OTP is ${otp}. It expires in 5 minutes.`;
    const html = `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`;
    return await sendEmail({ to, subject, text, html });
  }
  
  static async sendPaymentReceipt({ toEmail, customerName, amount, paymentMethod, transactionId, orderId }) {
    const subject = 'Payment Receipt - CeylonMart';
    const text = `Dear ${customerName || 'Customer'},

Thank you for your purchase!

Payment Details:
- Amount: Rs. ${amount}
- Payment Method: ${paymentMethod}
- Transaction ID: ${transactionId}
- Order ID: ${orderId}

Your order is being processed and will be delivered soon.

Best regards,
CeylonMart Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2e7d32;">Payment Receipt</h2>
        <p>Dear ${customerName || 'Customer'},</p>
        <p>Thank you for your purchase!</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Amount:</strong> Rs. ${amount}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
        </div>
        
        <p>Your order is being processed and will be delivered soon.</p>
        <p>Best regards,<br/>CeylonMart Team</p>
      </div>
    `;
    
    return await sendEmail({ to: toEmail, subject, text, html });
  }
}

module.exports = EmailService;
module.exports.sendPaymentReceipt = EmailService.sendPaymentReceipt;


