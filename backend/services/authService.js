import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import {
  accessCookieOptions,
  hashToken,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  signSocketToken,
  verifyRefreshToken
} from '../utils/tokens.js';

const refreshDuration = Number(process.env.REFRESH_TOKEN_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000);

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  username: user.username,
  profilePic: user.profilePic,
  phone: user.phone,
  gender: user.gender,
  dob: user.dob,
  lastSeen: user.lastSeen,
  createdAt: user.createdAt
});

const hashPassword = (password) => bcrypt.hash(password, Math.max(10, Number(process.env.BCRYPT_SALT_ROUNDS || 12)));

const issueSession = async (res, user, req) => {
  const accessToken = signAccessToken({ userId: user._id, username: user.username });
  const refreshToken = signRefreshToken({ userId: user._id });

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshDuration),
    userAgent: req.get('user-agent') || '',
    ipAddress: req.ip
  });

  res.cookie('zappy_access', accessToken, accessCookieOptions);
  res.cookie('zappy_refresh', refreshToken, refreshCookieOptions);

  return {
    user: sanitizeUser(user),
    socketToken: signSocketToken({ userId: user._id, username: user.username })
  };
};

const verifyGoogleToken = async (googleToken) => {
  if (!googleToken) {
    throw new ApiError(400, 'Google token is required.');
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new ApiError(500, 'Google authentication is not configured on the server.');
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(googleToken)}`);
  if (!response.ok) {
    throw new ApiError(401, 'Google token is invalid or expired.');
  }

  const data = await response.json();
  if (data.aud !== googleClientId) {
    throw new ApiError(401, 'Google token audience is invalid.');
  }

  if (data.email_verified !== 'true') {
    throw new ApiError(401, 'Google email is not verified.');
  }

  return {
    email: data.email,
    fullName: data.name || '',
    profilePic: data.picture || ''
  };
};

export const verifyGoogleIdentity = async ({ googleToken }) => verifyGoogleToken(googleToken);

export const checkUsernameAvailability = async (username) => {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) {
    throw new ApiError(400, 'Username is required.');
  }

  const existing = await User.findOne({ username: normalizedUsername }).select('_id');
  return { available: !existing };
};

export const signup = async ({ body, file, req, res }) => {
  const { fullName, email, username, password, phone, gender, dob, googleToken } = body;
  const normalizedUsername = username.trim().toLowerCase();

  const googleProfile = await verifyGoogleToken(googleToken);
  if (googleProfile.email !== email) {
    throw new ApiError(400, 'Signup email must match verified Google email.');
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username: normalizedUsername }] });
  if (existingUser) {
    throw new ApiError(409, 'A user with that email or username already exists.');
  }

  let profilePic = googleProfile.profilePic;

  if (file) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: 'zappy/profile-pictures',
      resource_type: 'image'
    });
    profilePic = uploadResult.secure_url;
  }

  const user = await User.create({
    fullName,
    email,
    username: normalizedUsername,
    password: await hashPassword(password),
    profilePic,
    phone,
    gender,
    dob
  });

  return issueSession(res, user, req);
};

export const login = async ({ username, password, req, res }) => {
  const user = await User.findOne({ username: username.trim().toLowerCase() });

  if (!user) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  return issueSession(res, user, req);
};

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Old password is incorrect.');
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return { message: 'Password updated successfully.' };
};

export const refreshSession = async ({ req, res }) => {
  const refreshToken = req.cookies?.zappy_refresh;
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is missing.');
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Refresh token is invalid.');
  }

  const storedToken = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken) }).populate('user');
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token has expired.');
  }

  const user = storedToken.user;
  if (!user) {
    throw new ApiError(401, 'User session is invalid.');
  }

  await storedToken.deleteOne();
  return issueSession(res, user, req);
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.zappy_refresh;

  if (refreshToken) {
    await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
  }

  res.clearCookie('zappy_access', accessCookieOptions);
  res.clearCookie('zappy_refresh', refreshCookieOptions);
};

export const getSessionUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return {
    user: sanitizeUser(user),
    socketToken: signSocketToken({ userId: user._id, username: user.username })
  };
};
