const nodemailer = require("nodemailer");

// Reads SMTP creds from env or uses a JSON transport for dev
async function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  // Auto-create Ethereal test account for dev
  const testAccount = await nodemailer.createTestAccount();
  const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
  console.log("[emailService] Using Ethereal SMTP. Login:", testAccount.user);
  return transport;
}

let transporterPromise = null;
async function getTransporter() {
  if (!transporterPromise) transporterPromise = createTransport();
  return transporterPromise;
}

exports.sendPaymentReceipt = async ({ toEmail, customerName, amount, paymentMethod, transactionId, orderId }) => {
  const subject = `Your payment receipt for Order ${orderId}`;
  const text = `Hello ${customerName || "Customer"},\n\nThank you for your payment.\n\nOrder: ${orderId}\nAmount: ${amount}\nMethod: ${paymentMethod}\nTransaction: ${transactionId || "N/A"}\n\nCeylonMart`;
  const html = `<p>Hello ${customerName || "Customer"},</p>
<p>Thank you for your payment.</p>
<ul>
  <li><b>Order:</b> ${orderId}</li>
  <li><b>Amount:</b> ${amount}</li>
  <li><b>Method:</b> ${paymentMethod}</li>
  <li><b>Transaction:</b> ${transactionId || "N/A"}</li>
  </ul>
  <p>CeylonMart</p>`;

  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@ceylonmart.local",
    to: toEmail,
    subject,
    text,
    html
  });

  // If Ethereal, log preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("[emailService] Ethereal preview URL:", previewUrl);
  } else {
    console.log("[emailService] Email sent via real SMTP to:", toEmail);
  }
  return previewUrl || null;
};



