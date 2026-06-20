const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// 1. SMTP/Brevo Configuration
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const fromName = process.env.FROM_NAME || 'ExpenseIQ';

let smtpTransporter = null;
if (smtpHost && smtpUser && smtpPass) {
  smtpTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465, // true for 465, false for 587 or others
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
  console.log('[Email Service] SMTP transporter initialized successfully.');
}

// 2. Resend Client configuration (as fallback)
const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey && resendKey !== 're_placeholder' ? new Resend(resendKey) : null;

/**
 * Shared HTML email layout wrapper.
 */
const getHtmlWrapper = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #F8FAFC;
      color: #1E293B;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #E2E8F0;
    }
    .header {
      background-color: #1E293B;
      padding: 30px;
      text-align: center;
      border-bottom: 4px solid #6366F1;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
      line-height: 1.6;
    }
    .footer {
      background-color: #F1F5F9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #E2E8F0;
    }
    .btn {
      display: inline-block;
      background-color: #6366F1;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 20px;
    }
    .otp-box {
      background-color: #EEF2F6;
      border: 2px dashed #6366F1;
      color: #1E293B;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 6px;
      padding: 15px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #E2E8F0;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #F8FAFC;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ExpenseIQ</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ExpenseIQ Inc. All rights reserved.</p>
      <p>This is an automated security email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send an email via SMTP, Resend, or Console Fallback.
 */
const sendMail = async (to, subject, html) => {
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html
      });
      console.log(`[Email Service] SMTP: Email sent successfully to ${to}`);
      return;
    } catch (error) {
      console.error(`[Email Service] SMTP failed to send email to ${to}:`, error);
      // Fall through to Resend or console if SMTP failed
    }
  }

  if (resend) {
    try {
      await resend.emails.send({
        from: `ExpenseIQ <${fromEmail}>`,
        to,
        subject,
        html
      });
      console.log(`[Email Service] Resend: Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`[Email Service] Resend failed to send email to ${to}:`, error);
    }
  } else {
    console.log('\n=================== EMAIL FALLBACK ===================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:`);
    console.log(html);
    console.log('======================================================\n');
  }
};

const sendVerificationEmail = async (to, name, otp) => {
  const body = `
    <h2>Hello, ${name}!</h2>
    <p>Thank you for signing up with ExpenseIQ. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.</p>
    <div class="otp-box">${otp}</div>
    <p>If you did not request this verification, you can safely ignore this email.</p>
  `;
  await sendMail(to, 'Verify Your ExpenseIQ Email Address', getHtmlWrapper('Verify Email', body));
};

const sendPasswordResetEmail = async (to, name, otp) => {
  const body = `
    <h2>Hello, ${name},</h2>
    <p>We received a request to reset your ExpenseIQ password. Use the code below to complete the password reset. This code is valid for 10 minutes.</p>
    <div class="otp-box">${otp}</div>
    <p>If you did not request a password reset, please secure your account immediately.</p>
  `;
  await sendMail(to, 'Reset Your ExpenseIQ Password', getHtmlWrapper('Reset Password', body));
};

const sendMonthlyReportEmail = async (to, name, reportData) => {
  const formatVal = (val) => (val / 100).toFixed(2);
  const body = `
    <h2>Monthly Financial Summary</h2>
    <p>Hi ${name}, here is your monthly financial performance report for ${reportData.month}/${reportData.year}:</p>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Income</td>
          <td><strong>₹${formatVal(reportData.totalIncome)}</strong></td>
        </tr>
        <tr>
          <td>Total Expenses</td>
          <td><strong>₹${formatVal(reportData.totalExpenses)}</strong></td>
        </tr>
        <tr>
          <td>Savings Rate</td>
          <td><strong>${reportData.savingsRate.toFixed(1)}%</strong></td>
        </tr>
      </tbody>
    </table>
    <p>Log in to your dashboard to view the full PDF breakdown and analytics.</p>
  `;
  await sendMail(to, 'Your Monthly ExpenseIQ Report', getHtmlWrapper('Monthly Report', body));
};

const sendBudgetAlertEmail = async (to, name, category, percentage) => {
  const color = percentage >= 100 ? '#EF4444' : '#F59E0B';
  const body = `
    <h2>Budget Threshold Warning</h2>
    <p>Hi ${name},</p>
    <p>You have used <strong style="color: ${color};">${percentage}%</strong> of your monthly budget limit for the category <strong>${category}</strong>.</p>
    <p>Log in to your ExpenseIQ dashboard to review your budget planner and recent category transactions.</p>
    <a class="btn" href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}">Go to Dashboard</a>
  `;
  await sendMail(to, `Budget Warning: ${category} (${percentage}%)`, getHtmlWrapper('Budget Alert', body));
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMonthlyReportEmail,
  sendBudgetAlertEmail
};
