import axios from 'axios';
import bcrypt from 'bcrypt';
import prisma from '../../../utils/prisma.js';
import TokenManager from '../../../security/token-manager.js';
import AuthenticationError from '../../../exceptions/authentication-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

export const login = async (req, res, next) => {
  const { email, password } = req.validated;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.provider !== 'LOCAL' || !user.password) {
    return next(new AuthenticationError('Invalid credentials.'));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AuthenticationError('Invalid credentials.'));

  if (user.status !== 'ACTIVE') {
    return next(new AuthenticationError('Account is not active.'));
  }

  const accessToken = TokenManager.generateAccessToken({ id: user.id });
  const refreshToken = TokenManager.generateRefreshToken({ id: user.id });
  await TokenManager.saveRefreshToken(user.id, refreshToken);

  return response(res, 200, 'Authentication successful', { accessToken, refreshToken });
};

export const googleLogin = async (req, res, next) => {
  const { idToken } = req.validated;

  // Verify Google ID Token manually
  let googlePayload;
  try {
    const { data } = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );

    if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
      return next(new AuthenticationError('Invalid Google token audience.'));
    }

    googlePayload = data;
  } catch {
    return next(new AuthenticationError('Failed to verify Google token.'));
  }

  const { sub: googleId, email, name, picture } = googlePayload;

  // Upsert user
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (!user) {
    // Assign default 'staff' role on first Google login
    const staffRole = await prisma.role.findUnique({ where: { name: 'staff' } });

    user = await prisma.user.create({
      data: {
        fullname: name,
        email,
        googleId,
        avatarUrl: picture,
        provider: 'GOOGLE',
        ...(staffRole && {
          roles: { create: { roleId: staffRole.id } },
        }),
      },
    });
  } else if (!user.googleId) {
    // Link Google to existing LOCAL account
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatarUrl: picture, provider: 'GOOGLE' },
    });
  }

  if (user.status !== 'ACTIVE') {
    return next(new AuthenticationError('Account is not active.'));
  }

  const accessToken = TokenManager.generateAccessToken({ id: user.id });
  const refreshToken = TokenManager.generateRefreshToken({ id: user.id });
  await TokenManager.saveRefreshToken(user.id, refreshToken);

  return response(res, 200, 'Google authentication successful', { accessToken, refreshToken });
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken: token } = req.validated;

  let payload;
  try {
    payload = TokenManager.verifyRefreshToken(token);
  } catch {
    return next(new InvariantError('Invalid refresh token.'));
  }

  const isValid = await TokenManager.validateStoredRefreshToken(payload.id, token);
  if (!isValid) return next(new InvariantError('Refresh token not recognized.'));

  const accessToken = TokenManager.generateAccessToken({ id: payload.id });

  return response(res, 200, 'Access token refreshed', { accessToken });
};

export const logout = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return next(new InvariantError('User not found.'));

  await TokenManager.deleteRefreshToken(userId);

  return response(res, 200, 'Logout successful', null);
};
