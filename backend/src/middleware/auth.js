import TokenManager from '../security/token-manager.js';
import response from '../utils/response.js';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response(res, 401, 'Unauthorized', null);
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const payload = TokenManager.verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return response(res, 401, err.message, null);
  }
}

export default authenticateToken;
