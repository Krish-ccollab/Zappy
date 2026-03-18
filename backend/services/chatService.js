import Chat from '../models/Chat.js';
import ChatRequest from '../models/ChatRequest.js';
import Message from '../models/Message.js';
import { ApiError } from '../utils/apiError.js';

const buildPeer = (chat, currentUserId, onlineUserIds) => {
  const peer = chat.participants.find((participant) => participant._id.toString() !== currentUserId.toString());

  return {
    ...chat,
    peer: peer
      ? {
          _id: peer._id,
          username: peer.username,
          fullName: peer.fullName,
          profilePic: peer.profilePic,
          lastSeen: peer.lastSeen,
          isOnline: onlineUserIds.has(peer._id.toString())
        }
      : null
  };
};

export const createChatRequest = async (senderId, receiverId) => {
  if (senderId.toString() === receiverId.toString()) {
    throw new ApiError(400, 'You cannot send a chat request to yourself.');
  }

  const [existingRequest, existingChat] = await Promise.all([
    ChatRequest.findOne({ sender: senderId, receiver: receiverId }),
    Chat.findOne({ participants: { $all: [senderId, receiverId], $size: 2 } })
  ]);

  if (existingRequest) {
    throw new ApiError(409, 'A chat request already exists for this user.');
  }

  if (existingChat) {
    throw new ApiError(409, 'Chat already exists with this user.');
  }

  return ChatRequest.create({ sender: senderId, receiver: receiverId });
};

export const getPendingRequests = async (userId) =>
  ChatRequest.find({ receiver: userId, status: 'pending' })
    .populate('sender', 'username fullName profilePic lastSeen')
    .sort({ createdAt: -1 });

export const respondToRequest = async (requestId, currentUserId, action) => {
  const request = await ChatRequest.findOne({ _id: requestId, receiver: currentUserId }).populate(
    'sender receiver',
    'username fullName profilePic lastSeen'
  );

  if (!request) {
    throw new ApiError(404, 'Chat request not found.');
  }

  request.status = action;
  await request.save();

  let chat = null;
  if (action === 'accepted') {
    chat = await Chat.findOneAndUpdate(
      { participants: { $all: [request.sender._id, request.receiver._id], $size: 2 } },
      { $setOnInsert: { participants: [request.sender._id, request.receiver._id] } },
      { upsert: true, new: true }
    ).populate('participants', 'username fullName profilePic lastSeen');
  }

  return { request, chat };
};

export const getUserChats = async (userId, onlineUserIds = new Set()) => {
  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'username fullName profilePic lastSeen')
    .sort({ lastMessageAt: -1 })
    .lean();

  return chats.map((chat) => buildPeer(chat, userId, onlineUserIds));
};

export const ensureChatParticipant = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);

  if (!chat || !chat.participants.some((participant) => participant.toString() === userId.toString())) {
    throw new ApiError(403, 'You do not have access to this chat.');
  }

  return chat;
};

export const getLastMessagePreview = async (chatId) => {
  const latest = await Message.findOne({ chatId }).sort({ timestamp: -1 }).lean();
  return latest ? latest.message || 'Image' : '';
};
