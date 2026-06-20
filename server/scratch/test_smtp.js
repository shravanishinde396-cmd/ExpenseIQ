require('dotenv').config();
const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL;

console.log('Using SMTP Settings:');
console.log('Host:', smtpHost);
console.log('Port:', smtpPort);
console.log('User:', smtpUser);
console.log('From:', fromEmail);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: parseInt(smtpPort),
  secure: parseInt(smtpPort) === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

transporter.sendMail({
  from: `"ExpenseIQ Test" <${fromEmail}>`,
  to: 'shravanishinde396@gmail.com',
  subject: 'ExpenseIQ SMTP Test Email',
  text: 'This is a test email to verify SMTP configuration.'
})
.then(info => {
  console.log('Email sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('Response:', info.response);
})
.catch(err => {
  console.error('SMTP Error occurred:');
  console.error(err);
});
