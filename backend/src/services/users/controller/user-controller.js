import bcrypt from 'bcrypt';
import prisma from '../../../utils/prisma.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addNewUser = async (req, res, next) => {
  const { fullname, email, password } = req.validated;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return next(new InvariantError('Email is already in use.'));

  const hashedPassword = await bcrypt.hash(password, 10);

  const staffRole = await prisma.role.findUnique({ where: { name: 'staff' } });

  const user = await prisma.user.create({
    data: {
      fullname,
      email,
      password: hashedPassword,
      ...(staffRole && {
        roles: { create: { roleId: staffRole.id } },
      }),
    },
    select: { id: true },
  });

  return response(res, 201, 'User successfully added', { id: user.id });
};

export const getUserById = async (req, res, next) => {
  const id = req.user?.id;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullname: true,
      email: true,
      provider: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
      roles: {
        select: { role: { select: { name: true } } },
      },
    },
  });

  if (!user) return next(new NotFoundError('User not found.'));

  return response(res, 200, 'User retrieved', {
    ...user,
    roles: user.roles.map((r) => r.role.name),
  });
};

export const updateUserById = async (req, res, next) => {
  const userId = req.user?.id;
  const { fullname } = req.validated;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { fullname },
    select: { id: true, fullname: true, email: true },
  });

  return response(res, 200, 'User updated', { user });
};
