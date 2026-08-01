import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { UserPayloadSchema, updateUserPayloadSchema } from '../validator/schema.js';
import authenticateToken from '../../../middleware/auth.js';
import authorize from '../../../middleware/authorize.js';
import { addNewUser, getUserById, updateUserById } from '../controller/user-controller.js';

const router = Router();

router.post('/', validate(UserPayloadSchema), addNewUser);
router.get('/', authenticateToken, getUserById);
router.put('/', authenticateToken, validate(updateUserPayloadSchema), updateUserById);

export default router;
