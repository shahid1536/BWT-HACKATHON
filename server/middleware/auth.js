import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/security.js';

const authenticationError = (message) =>
  Object.assign(new Error(message), { status: 401 });

export const getAuthenticatedUser = async (req) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : req.cookies?.token || req.query?.token;

  if (!token) {
    throw authenticationError('Authentication required. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw authenticationError('Invalid or expired session. Please log in again.');
    }
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw authenticationError('The user belonging to this token no longer exists.');
  }
  return user;
};

export const protect = async (req, res, next) => {
  try {
    req.user = await getAuthenticatedUser(req);
    next();
  } catch (err) {
    if (err.status === 401) {
      return res.status(401).json({ success: false, message: err.message });
    }
    next(err);
  }
};
