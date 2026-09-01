import { Router } from 'express';
import { login, register, requestPasswordReset, resetPassword, verifyOtp } from '../controllers/authController.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

const router = Router();
router.post('/register', asyncRoute(register));
router.post('/verify-otp', asyncRoute(verifyOtp));
router.post('/login', asyncRoute(login));
router.post('/forgot-password', asyncRoute(requestPasswordReset));
router.post('/reset-password', asyncRoute(resetPassword));
export default router;
