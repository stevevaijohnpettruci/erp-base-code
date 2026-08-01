import prisma from '../../../utils/prisma.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

export const getDepartments = async (req, res, next) => {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  return response(res, 200, 'Departments retrieved', { departments });
};

export const getDepartmentById = async (req, res, next) => {
  const { id } = req.params;
  const department = await prisma.department.findUnique({
    where: { id },
    include: { employees: { include: { user: { select: { fullname: true, email: true } } } } },
  });
  if (!department) return next(new NotFoundError('Department not found.'));
  return response(res, 200, 'Department retrieved', { department });
};

export const createDepartment = async (req, res, next) => {
  const { name, description } = req.validated;
  const existing = await prisma.department.findUnique({ where: { name } });
  if (existing) return next(new InvariantError('Department name already exists.'));

  const department = await prisma.department.create({ data: { name, description } });
  return response(res, 201, 'Department created', { department });
};

export const updateDepartment = async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.validated;

  const department = await prisma.department.update({
    where: { id },
    data: { name, description },
  }).catch(() => null);

  if (!department) return next(new NotFoundError('Department not found.'));
  return response(res, 200, 'Department updated', { department });
};

export const deleteDepartment = async (req, res, next) => {
  const { id } = req.params;
  await prisma.department.delete({ where: { id } }).catch(() => null);
  return response(res, 200, 'Department deleted', null);
};
