import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import authorize from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validator/schema.js';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee } from '../controller/employee-controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorize('read', 'employees'), getEmployees);
router.get('/:id', authorize('read', 'employees'), getEmployeeById);
router.post('/', authorize('create', 'employees'), validate(createEmployeeSchema), createEmployee);
router.put('/:id', authorize('update', 'employees'), validate(updateEmployeeSchema), updateEmployee);

export default router;
