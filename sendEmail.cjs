// sendEmail.js
// Usage: node sendEmail.js recipient@example.com ACTIVATIONCODE

const nodemailer = require('nodemailer');

// TODO: Replace with your Gmail and app password
const GMAIL_USER = 'ptahuntilmylastbreath@gmail.com';
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
    from: `"ptah" <${GMAIL_USER}>`,
    to,
    subject: 'Your PuzLabu Activation Code',
    text: `Your activation code is: ${code}\n\nEnter this code in the app to unlock your puzzles.\n\nThank you for your purchase!`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ' + error.message);
  }
}

// Get command-line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node sendEmail.js recipient@example.com ACTIVATIONCODE');
  process.exit(1);
}

const [recipient, activationCode] = args;

// Send the activation email
sendActivationEmail(recipient, activationCode);