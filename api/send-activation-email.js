// api/send-activation-email.js
// Vercel API route for sending activation emails securely
const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, code } = req.body;
  if (!to || !code) {
    return res.status(400).json({ error: 'Missing recipient or code' });
  }

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
    text: `Your activation code: ${code}\n\nThank you for your purchase!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
