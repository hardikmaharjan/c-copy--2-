import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Resolve from this file so running the server from the project root still loads server/.env.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
export const env = {
  port: Number(process.env.PORT || 5001),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student-consultancy-safety',
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM || 'Dream Chaser <onboarding@resend.dev>'
};
