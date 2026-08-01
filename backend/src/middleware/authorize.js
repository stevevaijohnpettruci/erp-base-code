import prisma from '../utils/prisma.js';
import response from '../utils/response.js';

const authorize = (action, resource) => async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return response(res, 401, 'Unauthorized', null);

  const userWithRoles = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  const hasPermission = userWithRoles?.roles.some((ur) =>
    ur.role.permissions.some(
      (rp) => rp.permission.action === action && rp.permission.resource === resource,
    ),
  );

  if (!hasPermission) {
    return response(res, 403, 'Forbidden: insufficient permissions', null);
  }

  return next();
};

export default authorize;
