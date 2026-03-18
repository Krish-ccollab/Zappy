import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getSessionUser,
  login,
  logout,
  refreshSession,
  sendOtp,
  signup,
  verifyOtp
} from '../services/authService.js';

export const sendOtpController = asyncHandler(async (req, res) => {
  await sendOtp(req.body);
  res.json({ message: 'OTP sent successfully.' });
});

export const verifyOtpController = asyncHandler(async (req, res) => {
  await verifyOtp(req.body);
  res.json({ message: 'OTP verified successfully.' });
});

export const signupController = asyncHandler(async (req, res) => {
  const session = await signup({ body: req.body, file: req.file, req, res });
  res.status(201).json(session);
});

export const loginController = asyncHandler(async (req, res) => {
  const session = await login({ ...req.body, req, res });
  res.json(session);
});

export const refreshController = asyncHandler(async (req, res) => {
  const session = await refreshSession({ req, res });
  res.json(session);
});

export const logoutController = asyncHandler(async (req, res) => {
  await logout(req, res);
  res.status(204).send();
});

export const meController = asyncHandler(async (req, res) => {
  const session = await getSessionUser(req.auth.userId);
  res.json(session);
});
