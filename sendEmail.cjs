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
       git add .
    git commit -m "Make floating puzzle people fully visible in modal"
    git push