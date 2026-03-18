import express from 'express';
import {
  getChatsController,
  getReceivedRequestsController,
  handleRequestController,
  sendRequestController
} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { handleRequestValidation, sendRequestValidation } from '../validators/chatValidators.js';

const router = express.Router();

router.use(requireAuth);
router.post('/requests', sendRequestValidation, validateRequest, sendRequestController);
router.get('/requests/received', getReceivedRequestsController);
router.patch('/requests/:requestId', handleRequestValidation, validateRequest, handleRequestController);
router.get('/', getChatsController);

export default router;
