import express from 'express';
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  sendOtpController,
  signupController,
  verifyOtpController
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';
import { ensureSafeImage, upload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  loginValidation,
  sendOtpValidation,
  signupValidation,
  verifyOtpValidation
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/send-otp', authLimiter, sendOtpValidation, validateRequest, sendOtpController);
router.post('/verify-otp', authLimiter, verifyOtpValidation, validateRequest, verifyOtpController);
router.post(
  '/signup',
  authLimiter,
  upload.single('profilePic'),
  ensureSafeImage,
  signupValidation,
  validateRequest,
  signupController
);
router.post('/login', authLimiter, loginValidation, validateRequest, loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);

export default router;
