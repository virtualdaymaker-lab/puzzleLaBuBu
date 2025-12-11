// api/send-activation-email.js
// Vercel/Netlify/Node.js Express compatible API route
const nodemailer = require('nodemailer');

const GMAIL_USER = 'ptahuntilmylastbreathS@gmail.com';
const GMAIL_PASS = 'vkftvgnmociaovus';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { to, code } = req.body || req.query;
  if (!to || !code) {
    res.status(400).json({ error: 'Missing to or code' });
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });
  const mailOptions = {
    from: GMAIL_USER,
    to,
    subject: 'Your PuzLabu Activation Code',
    text: `Your activation code: ${code}\n\nThank you for your purchase!`,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
