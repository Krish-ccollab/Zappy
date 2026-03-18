import { body } from 'express-validator';

const emailRule = body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail();

export const sendOtpValidation = [emailRule];

export const verifyOtpValidation = [
  emailRule,
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.').isNumeric()
];

export const signupValidation = [
  body('fullName').trim().isLength({ min: 2, max: 80 }).withMessage('Full name must be 2-80 characters.'),
  emailRule,
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters.')
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and periods.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .withMessage('Password must include uppercase, lowercase, and a number.'),
  body('phone').trim().isLength({ min: 7, max: 20 }).withMessage('Phone number is invalid.'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender is invalid.'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.')
];

export const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];
