import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: env.smtpUser && env.smtpPass ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
});

export async function createOtp(email: string) {
  const otp = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  const hash = await bcrypt.hash(otp, 10);

  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: 'Your Dream Chaser verification code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    html: `<p>Your Dream Chaser verification code is:</p><h1>${otp}</h1><p>It expires in 10 minutes. Do not share this code with anyone.</p>`,
  });

  return {
    hash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
}

export const matchesOtp = (otp: string, hash: string) =>
  bcrypt.compare(otp, hash);
