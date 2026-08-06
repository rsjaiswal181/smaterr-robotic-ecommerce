import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const transporter = env.useSmtp
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  if (!transporter) {
    // Dev fallback: just log the email instead of failing when SMTP isn't configured
    logger.info(`[email:dev-mode] To: ${to} | Subject: ${subject}\n${html}`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
};

export const emailTemplates = {
  welcome: (name: string) => `<h2>Welcome, ${name}!</h2><p>Thanks for creating an account.</p>`,
  otp: (code: string) => `<h2>Your verification code</h2><p style="font-size:24px">${code}</p><p>Expires in 10 minutes.</p>`,
  forgotPassword: (link: string) => `<h2>Reset your password</h2><p><a href="${link}">Click here to reset</a> (valid 30 min)</p>`,
  orderConfirmation: (orderNumber: string, total: number) =>
    `<h2>Order Confirmed</h2><p>Your order <b>${orderNumber}</b> for ₹${total} has been placed successfully.</p>`,
  orderStatus: (orderNumber: string, status: string) =>
    `<h2>Order Update</h2><p>Your order <b>${orderNumber}</b> status is now: <b>${status}</b>.</p>`,
};
