const userRepository = require('../repositories/userRepository');
const UserSettings = require('../models/UserSettings');
const jwt = require('jsonwebtoken');
const ValidationError = require('../utils/errors/ValidationError');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  async register(username, email, password) {
    // Validate input
    if (!username || username.length < 3 || username.length > 30) {
      throw new ValidationError('Username must be 3-30 characters');
    }

    if (!email || !this.isValidEmail(email)) {
      throw new ValidationError('Invalid email address');
    }

    if (!password || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ValidationError('Username already exists');
    }

    // Create user
    const user = await userRepository.create({ username, email, password });

    // Create default settings
    await UserSettings.create({ userId: user._id });

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    };
  }

  generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new AuthService();
