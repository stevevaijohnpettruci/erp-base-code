import prisma from '../../../utils/prisma.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

const employeeSelect = {
  id: true,
  employeeCode: true,
  position: true,
  joinDate: true,
  status: true,
  user: { select: { id: true, fullname: true, email: true, avatarUrl: true } },
  department: { select: { id: true, name: true } },
};

export const getEmployees = async (req, res, next) => {
  const { status, departmentId } = req.query;
  const employees = await prisma.employee.findMany({
    where: {
      ...(status && { status }),
      ...(departmentId && { departmentId }),
    },
    select: employeeSelect,
    orderBy: { user: { fullname: 'asc' } },
  });
  return response(res, 200, 'Employees retrieved', { employees });
};

export const getEmployeeById = async (req, res, next) => {
  const { id } = req.params;
  const employee = await prisma.employee.findUnique({ where: { id }, select: employeeSelect });
  if (!employee) return next(new NotFoundError('Employee not found.'));
  return response(res, 200, 'Employee retrieved', { employee });
};

export const createEmployee = async (req, res, next) => {
  const { userId, employeeCode, departmentId, position, joinDate } = req.validated;

  const existing = await prisma.employee.findFirst({
    where: { OR: [{ userId }, { employeeCode }] },
  });
  if (existing) return next(new InvariantError('User already has an employee record or code is taken.'));

  const employee = await prisma.employee.create({
    data: { userId, employeeCode, departmentId, position, joinDate: new Date(joinDate) },
    select: employeeSelect,
  });
  return response(res, 201, 'Employee created', { employee });
};

export const updateEmployee = async (req, res, next) => {
  const { id } = req.params;
  const { departmentId, position, status } = req.validated;

  const employee = await prisma.employee.update({
    where: { id },
    data: { ...(departmentId && { departmentId }), ...(position && { position }), ...(status && { status }) },
    select: employeeSelect,
  }).catch(() => null);

  if (!employee) return next(new NotFoundError('Employee not found.'));
  return response(res, 200, 'Employee updated', { employee });
};
