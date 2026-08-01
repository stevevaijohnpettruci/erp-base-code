import { Router } from 'express';
import authenticateToken from '../../../middleware/auth.js';
import authorize from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { departmentSchema } from '../validator/schema.js';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controller/department-controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorize('read', 'departments'), getDepartments);
router.get('/:id', authorize('read', 'departments'), getDepartmentById);
router.post('/', authorize('create', 'departments'), validate(departmentSchema), createDepartment);
router.put('/:id', authorize('update', 'departments'), validate(departmentSchema), updateDepartment);
router.delete('/:id', authorize('delete', 'departments'), deleteDepartment);

export default router;
