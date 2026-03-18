import express from 'express';
import { getMeController, searchUsersController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { searchValidation } from '../validators/chatValidators.js';

const router = express.Router();

router.get('/me', requireAuth, getMeController);
router.get('/search', requireAuth, searchValidation, validateRequest, searchUsersController);

export default router;
