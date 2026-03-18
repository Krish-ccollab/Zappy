import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

export const validateRequest = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return next(
    new ApiError(
      422,
      'Validation failed.',
      result.array().map(({ msg, path }) => ({ field: path, message: msg }))
    )
  );
};
