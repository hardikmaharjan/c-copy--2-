import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { createOtp, matchesOtp } from '../services/OtpService.js';
import { env } from '../config/env.js';

const publicUser = (u: any) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role
});

const tokenFor = (u: any) =>
  jwt.sign(
    { id: u._id, role: u.role },
    env.jwtSecret,
    { expiresIn: '7d' }
  );

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || password.length < 8)
    return res.status(400).json({
      message: 'Name, email and an 8-character password are required'
    });

  const normalizedEmail = email.toLowerCase().trim();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail))
    return res.status(400).json({ message: 'Enter a valid email address' });
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser?.verifiedAt)
    return res.status(409).json({ message: 'An account with that email already exists' });

  // A previous delivery may have failed or the code may have expired. Let the user
  // retry registration without creating a duplicate account.
  if (existingUser) {
    const otp = await createOtp(normalizedEmail);
    existingUser.name = name.trim();
    existingUser.passwordHash = await bcrypt.hash(password, 12);
    existingUser.otpHash = otp.hash;
    existingUser.otpExpiresAt = otp.expiresAt;
    await existingUser.save();
    return res.status(200).json({ message: 'A new OTP has been sent to your email.', user: publicUser(existingUser) });
  }

  const otp = await createOtp(normalizedEmail);

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    otpHash: otp.hash,
    otpExpiresAt: otp.expiresAt
  });

  res.status(201).json({
    message: 'Registration created. Check your email for the OTP.',
    user: publicUser(user)
  });
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body;

  if (typeof email !== 'string' || !/^\d{6}$/.test(String(otp || '')))
    return res.status(400).json({ message: 'Email and a six-digit OTP are required' });

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  });

  if (
    !user ||
    !user.otpHash ||
    !user.otpExpiresAt ||
    user.otpExpiresAt < new Date() ||
    !(await matchesOtp(otp, user.otpHash))
  ) {
    return res.status(400).json({
      message: 'Invalid or expired OTP'
    });
  }

  user.verifiedAt = new Date();
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;

  await user.save();

  res.json({
    token: tokenFor(user),
    user: publicUser(user)
  });
}

export async function login(req: Request, res: Response) {
  if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string')
    return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({
    email: req.body.email.trim().toLowerCase()
  });

  if (
    !user ||
    !(await bcrypt.compare(
      req.body.password || '',
      user.passwordHash
    ))
  ) {
    return res.status(401).json({
      message: 'Invalid email or password'
    });
  }

  if (!user.verifiedAt) {
    return res.status(403).json({
      message: 'Verify your email OTP before logging in'
    });
  }

  res.json({
    token: tokenFor(user),
    user: publicUser(user)
  });
}

export async function requestPasswordReset(
  req: Request,
  res: Response
) {
  if (typeof req.body.email !== 'string')
    return res.status(400).json({ message: 'Email is required' });
  const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });

  if (!user) {
    return res.json({
      message: 'If this email exists, an OTP has been sent.'
    });
  }

  const otp = await createOtp(user.email);

  user.otpHash = otp.hash;
  user.otpExpiresAt = otp.expiresAt;

  await user.save();

  res.json({
    message: 'OTP sent to your email'
  });
}

export async function resetPassword(
  req: Request,
  res: Response
) {
  const { email, otp, password } = req.body;

  if (typeof email !== 'string' || !/^\d{6}$/.test(String(otp || '')) || typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ message: 'Email, a valid OTP, and an 8-character password are required' });

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  });

  if (
    !user ||
    !user.otpHash ||
    !user.otpExpiresAt ||
    !(await matchesOtp(otp, user.otpHash)) ||
    user.otpExpiresAt! < new Date()
  ) {
    return res.status(400).json({
      message: 'Invalid or expired OTP'
    });
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;

  await user.save();

  res.json({
    message: 'Password reset successfully'
  });
}
