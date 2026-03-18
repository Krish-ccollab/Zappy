import { ApiError } from '../utils/apiError.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const requireAuth = (req, _res, next) => {
  const token = req.cookies?.zappy_access;

  if (!token) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  try {
    req.auth = verifyAccessToken(token);
    return next();
  } catch {
    return next(new ApiError(401, 'Session expired. Please sign in again.'));
  }
};
