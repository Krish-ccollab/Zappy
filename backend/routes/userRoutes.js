import express from 'express';
import { getMeController, searchUsersController, updateProfileController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { ensureSafeImage, upload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { searchValidation } from '../validators/chatValidators.js';
import { updateProfileValidation } from '../validators/userValidators.js';

const router = express.Router();

router.get('/me', requireAuth, getMeController);
router.get('/search', requireAuth, searchValidation, validateRequest, searchUsersController);
router.put(
  '/update-profile',
  requireAuth,
  upload.single('profilePic'),
  ensureSafeImage,
  updateProfileValidation,
  validateRequest,
  updateProfileController
);

export default router;
