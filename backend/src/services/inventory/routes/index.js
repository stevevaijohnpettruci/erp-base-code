import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import authorize from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import Joi from 'joi';
import { getInventory, getLowStock, adjustStock } from '../controller/inventory-controller.js';

const adjustStockSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().positive().required(),
  type: Joi.string().valid('IN', 'OUT').required(),
});

const router = Router();

router.use(authenticateToken);

router.get('/', authorize('read', 'inventory'), getInventory);
router.get('/low-stock', authorize('read', 'inventory'), getLowStock);
router.post('/adjust', authorize('update', 'inventory'), validate(adjustStockSchema), adjustStock);

export default router;
