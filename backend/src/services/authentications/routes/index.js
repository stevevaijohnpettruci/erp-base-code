import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validate.js';
import {
  postAuthenticationPayloadSchema,
  postGoogleAuthPayloadSchema,
  putAuthenticationPayloadSchema,
} from '../validator/schema.js';
import { login, googleLogin, refreshToken, logout } from '../controller/authentication-controller.js';

const router = Router();

router.post('/', validate(postAuthenticationPayloadSchema), login);
router.post('/google', validate(postGoogleAuthPayloadSchema), googleLogin);
router.put('/', validate(putAuthenticationPayloadSchema), refreshToken);
router.delete('/logout', authenticateToken, logout);

export default router;
