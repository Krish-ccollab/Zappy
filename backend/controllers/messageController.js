import { asyncHandler } from '../utils/asyncHandler.js';
import { createMessage, getMessagesForChat } from '../services/messageService.js';

export const getMessagesController = asyncHandler(async (req, res) => {
  const messages = await getMessagesForChat(req.params.chatId, req.auth.userId);
  res.json(messages);
});

export const sendMessageController = asyncHandler(async (req, res) => {
  const imageData = req.file
    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    : req.body.imageData || '';

  const message = await createMessage({
    chatId: req.body.chatId,
    senderId: req.auth.userId,
    text: req.body.message || '',
    imageData,
    clientMessageId: req.body.clientMessageId || ''
  });

  res.status(201).json(message);
});
