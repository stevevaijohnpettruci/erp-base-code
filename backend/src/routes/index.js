import { Router } from 'express';
import users from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';
import departments from '../services/departments/routes/index.js';
import employees from '../services/employees/routes/index.js';
import products from '../services/products/routes/index.js';
import inventory from '../services/inventory/routes/index.js';
import orders from '../services/orders/routes/index.js';

const router = Router();

router.use('/api/v1/auth', authentications);
router.use('/api/v1/users', users);
router.use('/api/v1/departments', departments);
router.use('/api/v1/employees', employees);
router.use('/api/v1/products', products);
router.use('/api/v1/inventory', inventory);
router.use('/api/v1/orders', orders);

export default router;
