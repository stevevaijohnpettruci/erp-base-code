import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import authorize from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validator/schema.js';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controller/order-controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorize('read', 'orders'), getOrders);
router.get('/:id', authorize('read', 'orders'), getOrderById);
router.post('/', authorize('create', 'orders'), validate(createOrderSchema), createOrder);
router.put('/:id/status', authorize('update', 'orders'), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
