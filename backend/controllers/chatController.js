import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createChatRequest,
  getPendingRequests,
  getUserChats,
  respondToRequest
} from '../services/chatService.js';

export const sendRequestController = asyncHandler(async (req, res) => {
  const request = await createChatRequest(req.auth.userId, req.body.receiverId);
  res.status(201).json(request);
});

export const getReceivedRequestsController = asyncHandler(async (req, res) => {
  const requests = await getPendingRequests(req.auth.userId);
  res.json(requests);
});

export const handleRequestController = asyncHandler(async (req, res) => {
  const data = await respondToRequest(req.params.requestId, req.auth.userId, req.body.action);
  res.json(data);
});

export const getChatsController = asyncHandler(async (req, res) => {
  const chats = await getUserChats(req.auth.userId, req.app.locals.onlineUserIds);
  res.json(chats);
});
