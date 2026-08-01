import jwt from 'jsonwebtoken';
import InvariantError from '../exceptions/invariant-error.js';
import redis from '../utils/redis.js';

const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

const TokenManager = {
  generateAccessToken: (payload) =>
    jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '15m' }),

  generateRefreshToken: (payload) =>
    jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' }),

  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch {
      throw new InvariantError('Access token tidak valid');
    }
  },

  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    } catch {
      throw new InvariantError('Refresh token tidak valid');
    }
  },

  // Redis operations
  saveRefreshToken: async (userId, token) => {
    await redis.set(`refresh:${userId}`, token, 'EX', REFRESH_TOKEN_TTL);
  },

  getRefreshToken: async (userId) => {
    return redis.get(`refresh:${userId}`);
  },

  deleteRefreshToken: async (userId) => {
    await redis.del(`refresh:${userId}`);
  },

  validateStoredRefreshToken: async (userId, token) => {
    const stored = await redis.get(`refresh:${userId}`);
    return stored === token;
  },
};

export default TokenManager;
