import { asyncHandler } from '../utils/asyncHandler.js';
import {
  changePassword,
  checkUsernameAvailability,
  getSessionUser,
  login,
  logout,
  refreshSession,
  signup,
  verifyGoogleIdentity
} from '../services/authService.js';

export const verifyGoogleController = asyncHandler(async (req, res) => {
  const profile = await verifyGoogleIdentity({ googleToken: req.body.googleToken });
  res.json(profile);
});

export const checkUsernameAvailabilityController = asyncHandler(async (req, res) => {
  const result = await checkUsernameAvailability(req.query.username || '');
  res.json(result);
});

export const signupController = asyncHandler(async (req, res) => {
  const session = await signup({ body: req.body, file: req.file, req, res });
  res.status(201).json(session);
});

export const loginController = asyncHandler(async (req, res) => {
  const session = await login({ ...req.body, req, res });
  res.json(session);
});

export const changePasswordController = asyncHandler(async (req, res) => {
  const result = await changePassword({ userId: req.auth.userId, ...req.body });
  res.json(result);
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
