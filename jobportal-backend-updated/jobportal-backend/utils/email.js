import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  // ─── YEH BLOCK UPDATE KIYA HAI ─────────────────────────────────────────
  tls: {
    rejectUnauthorized: false, // Local machine par self-signed certificate check bypass karega
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Generic send ─────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"${process.env.APP_NAME || "CareerVidya"}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

// ─── OTP email ────────────────────────────────────────────────────────────────
export const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Verify Your Email — OTP",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p>
      <p>Valid for <strong>10 minutes</strong>. Do not share with anyone.</p>
    `,
  });
};

// ─── Admin creates account — send credentials ─────────────────────────────────
export const sendCredentialsEmail = async (email, { name, password, role }) => {
  await sendEmail({
    to: email,
    subject: "Your Account Has Been Created",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your account has been created as <strong>${role}</strong>.</p>
      <table>
        <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
        <tr><td><strong>Password:</strong></td><td>${password}</td></tr>
      </table>
      <p>Please login and change your password immediately.</p>
      <p><a href="${process.env.FRONTEND_URL}/login">Login Here</a></p>
    `,
  });
};

// ─── Forgot password — reset link ─────────────────────────────────────────────
export const sendPasswordResetEmail = async (email, { name, resetUrl }) => {
  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html: `
      <h2>Hello, ${name}!</h2>
      <p>You requested to reset your password. Click the button below:</p>
      <a href="${resetUrl}" 
         style="background:#4F46E5;color:white;padding:12px 24px;
                border-radius:6px;text-decoration:none;display:inline-block">
        Reset Password
      </a>
      <p>This link is valid for <strong>15 minutes</strong>.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};