import { asyncHandler } from '../utils/asyncHandler.js';
import { getProfile, searchUsers, updateProfile } from '../services/userService.js';

export const getMeController = asyncHandler(async (req, res) => {
  const user = await getProfile(req.auth.userId, req.app.locals.onlineUserIds);
  res.json(user);
});

export const updateProfileController = asyncHandler(async (req, res) => {
  const user = await updateProfile({
    userId: req.auth.userId,
    body: req.body,
    file: req.file,
    onlineUserIds: req.app.locals.onlineUserIds
  });

  req.app.locals.io?.emit('profile:update', user);
  res.json({ user });
});

export const searchUsersController = asyncHandler(async (req, res) => {
  const users = await searchUsers(req.query.query || req.query.q, req.auth.userId, req.app.locals.onlineUserIds);
  res.json(users);
});
