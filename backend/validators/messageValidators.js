import { body } from 'express-validator';

export const sendMessageValidation = [
  body('chatId').isMongoId().withMessage('Chat id is invalid.'),
  body('message').optional().isLength({ max: 5000 }).withMessage('Message is too long.')
];
