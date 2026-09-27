import nodemailer from 'nodemailer';

/**
 * Send Email helper using Nodemailer
 * Supports SMTP credentials in .env (Gmail / Outlook / SendGrid)
 * Falls back to auto-generated Ethereal test transport if SMTP credentials are omitted.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Production / Custom SMTP Transporter
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Ethereal Real Email Test Account Fallback
      console.log('No SMTP credentials in .env. Creating Ethereal Test Account for real OTP email rendering...');
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MindNest Security" <security@mindnest.com>',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email Sent Successfully to [${to}]. Message ID: ${info.messageId}`);

    // If Ethereal test transport was used, print the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📬 View Real Sent Email Preview: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`❌ Nodemailer Error: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Generate & Send 6-Digit OTP Email
 */
export const sendOtpEmail = async ({ email, name, otpCode }) => {
  const subject = `${otpCode} is your MindNest Email Verification OTP`;
  const text = `Hello ${name},\n\nYour 6-digit OTP code for MindNest email verification is: ${otpCode}\n\nThis code expires in 15 minutes.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0b0f19; color: #ffffff; padding: 2rem; border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.3);">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <h1 style="color: #818cf8; margin: 0; font-size: 1.8rem; font-weight: 800;">MindNest</h1>
        <p style="color: #9ca3af; font-size: 0.9rem; margin-top: 0.25rem;">Security & Email Authentication</p>
      </div>
      <div style="background: rgba(17, 24, 39, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <p style="color: #e5e7eb; font-size: 1rem; margin-top: 0;">Hi <strong>${name}</strong>,</p>
        <p style="color: #9ca3af; font-size: 0.95rem; line-height: 1.5;">
          Thank you for signing up on MindNest. Please use the following 6-digit OTP code to verify your email address:
        </p>
        <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%); border: 2px dashed #6366f1; border-radius: 12px; padding: 1.25rem; text-align: center; margin: 1.5rem 0;">
          <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 8px; color: #a855f7; font-family: monospace;">${otpCode}</span>
        </div>
        <p style="color: #6b7280; font-size: 0.82rem; text-align: center; margin-bottom: 0;">
          ⏱️ This OTP code is valid for <strong>15 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
      <div style="text-align: center; font-size: 0.78rem; color: #4b5563;">
        &copy; ${new Date().getFullYear()} MindNest Publishing Platform. All rights reserved.
      </div>
    </div>
  `;

  return await sendEmail({ to: email, subject, html, text });
};
