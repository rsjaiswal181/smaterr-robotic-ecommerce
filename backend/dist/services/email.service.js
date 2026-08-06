"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const transporter = env_1.env.useSmtp
    ? nodemailer_1.default.createTransport({
        host: env_1.env.smtp.host,
        port: env_1.env.smtp.port,
        secure: env_1.env.smtp.port === 465,
        auth: { user: env_1.env.smtp.user, pass: env_1.env.smtp.pass },
    })
    : null;
const sendEmail = async ({ to, subject, html }) => {
    if (!transporter) {
        // Dev fallback: just log the email instead of failing when SMTP isn't configured
        logger_1.logger.info(`[email:dev-mode] To: ${to} | Subject: ${subject}\n${html}`);
        return;
    }
    await transporter.sendMail({ from: env_1.env.smtp.from, to, subject, html });
};
exports.sendEmail = sendEmail;
exports.emailTemplates = {
    welcome: (name) => `<h2>Welcome, ${name}!</h2><p>Thanks for creating an account.</p>`,
    otp: (code) => `<h2>Your verification code</h2><p style="font-size:24px">${code}</p><p>Expires in 10 minutes.</p>`,
    forgotPassword: (link) => `<h2>Reset your password</h2><p><a href="${link}">Click here to reset</a> (valid 30 min)</p>`,
    orderConfirmation: (orderNumber, total) => `<h2>Order Confirmed</h2><p>Your order <b>${orderNumber}</b> for ₹${total} has been placed successfully.</p>`,
    orderStatus: (orderNumber, status) => `<h2>Order Update</h2><p>Your order <b>${orderNumber}</b> status is now: <b>${status}</b>.</p>`,
};
