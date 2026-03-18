import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export const getProfile = async (userId, onlineUserIds = new Set()) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return {
    ...user.toObject(),
    isOnline: onlineUserIds.has(userId.toString())
  };
};

export const searchUsers = async (query, currentUserId, onlineUserIds = new Set()) => {
  if (!query) {
    return [];
  }

  const users = await User.find({
    username: { $regex: query, $options: 'i' },
    _id: { $ne: currentUserId }
  })
    .select('fullName username profilePic lastSeen')
    .limit(15)
    .lean();

  return users.map((user) => ({
    ...user,
    isOnline: onlineUserIds.has(user._id.toString())
  }));
};
