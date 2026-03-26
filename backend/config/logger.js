import winston from 'winston';

const transports =
  process.env.NODE_ENV === 'production'
    ? [new winston.transports.Console()]
    : [new winston.transports.Console({ format: winston.format.simple() })];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: 'zappy-backend' },
  transports
});
