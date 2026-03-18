import { logger } from '../config/logger.js';

export const notFoundHandler = (_req, _res, next) => {
  next({ statusCode: 404, message: 'Route not found.' });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? 'Something went wrong. Please try again later.' : error.message;

  logger.error({
    statusCode,
    message: error.message,
    stack: error.stack,
    details: error.details || null
  });

  res.status(statusCode).json({
    message,
    details: statusCode < 500 ? error.details || null : null
  });
};
