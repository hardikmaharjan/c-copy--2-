import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Resolve from this file so running the server from the project root still loads server/.env.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
export const env = {
  port: Number(process.env.PORT || 5001),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student-consultancy-safety',
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  smtpHost: process.env.SMTP_HOST || '127.0.0.1',
  smtpPort: Number(process.env.SMTP_PORT || 1025),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpFrom: process.env.SMTP_FROM || 'Dream Chaser <no-reply@safestudy.local>',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS
};
