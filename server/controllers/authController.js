import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { DEFAULT_CATEGORIES } from '../config/constants.js';
import { getJwtSecret } from '../config/security.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const secureCookie = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: secureCookie ? 'none' : 'lax',
    secure: secureCookie,
    path: '/',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};

// Seed default categories for new users
export const seedDefaultCategories = async (userId) => {
  try {
    const existingCount = await Category.countDocuments({ userId });
    if (existingCount === 0) {
      const categoriesToInsert = DEFAULT_CATEGORIES.map((name) => ({
        userId,
        name,
        isDefault: true,
      }));
      await Category.insertMany(categoriesToInsert, { ordered: false });
    }
  } catch (err) {
    console.warn(`[Category Seed] Warning seeding categories for user ${userId}:`, err.message);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    // Verify database connectivity
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is temporarily unavailable. Please verify MongoDB service status.',
      });
    }

    const { name, email, password } = req.body || {};

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name.',
      });
    }

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
    });

    // Seed default categories (non-blocking for registration success)
    await seedDefaultCategories(user._id);

    return sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is temporarily unavailable. Please verify MongoDB service status.',
      });
    }

    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Ensure categories exist in case they were not seeded previously
    await seedDefaultCategories(user._id);

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};
