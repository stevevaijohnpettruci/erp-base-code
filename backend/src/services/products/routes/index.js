import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import authorize from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validator/schema.js';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controller/product-controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorize('read', 'products'), getProducts);
router.get('/:id', authorize('read', 'products'), getProductById);
router.post('/', authorize('create', 'products'), validate(createProductSchema), createProduct);
router.put('/:id', authorize('update', 'products'), validate(updateProductSchema), updateProduct);
router.delete('/:id', authorize('delete', 'products'), deleteProduct);

export default router;
