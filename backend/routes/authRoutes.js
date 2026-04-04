import express from 'express';
import {
  changePasswordController,
  checkUsernameAvailabilityController,
  loginController,
  logoutController,
  meController,
  refreshController,
  signupController,
  verifyGoogleController
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';
import { ensureSafeImage, upload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  changePasswordValidation,
  loginValidation,
  signupValidation,
  usernameAvailabilityValidation,
  verifyGoogleValidation
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/google/verify', authLimiter, verifyGoogleValidation, validateRequest, verifyGoogleController);
router.get('/username-availability', usernameAvailabilityValidation, validateRequest, checkUsernameAvailabilityController);
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
router.post('/change-password', requireAuth, changePasswordValidation, validateRequest, changePasswordController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);

export default router;
