import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { env } from '../config/env.js';

export async function createOtp(email: string) {
  if (!env.resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const otp = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  const hash = await bcrypt.hash(otp, 10);
  const resend = new Resend(env.resendApiKey);

  const { error } = await resend.emails.send({
    from: env.resendFrom,
    to: [email],
    subject: 'Your Dream Chaser verification code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    html: `<p>Your Dream Chaser verification code is:</p><h1>${otp}</h1><p>It expires in 10 minutes. Do not share this code with anyone.</p>`,
  });

  if (error) {
    throw new Error(`Resend could not send the OTP: ${error.message}`);
  }

  return {
    hash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
}

export const matchesOtp = (otp: string, hash: string) =>
  bcrypt.compare(otp, hash);
