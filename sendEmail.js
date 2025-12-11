// sendEmail.js
// Usage: node sendEmail.js recipient@example.com ACTIVATIONCODE

const nodemailer = require('nodemailer');

// TODO: Replace with your Gmail and app password
const GMAIL_USER = 'ptahuntilmylastbreathS@gmail.com';
const GMAIL_PASS = 'vkftvgnmociaovus';

async function sendActivationEmail(to, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: GMAIL_USER,
    to,
    subject: 'Your PuzLabu Activation Code',
    text: `Your activation code: ${code}\n\nThank you for your purchase!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent to', to);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
}

// Command line usage
if (require.main === module) {
  const [,, to, code] = process.argv;
  if (!to || !code) {
    console.log('Usage: node sendEmail.js recipient@example.com ACTIVATIONCODE');
    process.exit(1);
  }
  sendActivationEmail(to, code);
}
