import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RESOURCES = ['users', 'employees', 'departments', 'products', 'inventory', 'orders'];
const ACTIONS = ['create', 'read', 'update', 'delete'];

const ROLES = [
  { name: 'superadmin', description: 'Full access to everything' },
  { name: 'admin', description: 'Administrative access' },
  { name: 'manager', description: 'Managerial access' },
  { name: 'staff', description: 'Basic staff access' },
];

async function main() {
  // Seed permissions
  const permissions = [];
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const perm = await prisma.permission.upsert({
        where: { action_resource: { action, resource } },
        update: {},
        create: { action, resource },
      });
      permissions.push(perm);
    }
  }

  // Seed roles
  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });

    // superadmin & admin get all permissions
    if (role.name === 'superadmin' || role.name === 'admin') {
      for (const perm of permissions) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }

    // manager gets read + create on all, no delete users
    if (role.name === 'manager') {
      const managerPerms = permissions.filter(
        (p) => ['read', 'create', 'update'].includes(p.action),
      );
      for (const perm of managerPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }

    // staff gets read only
    if (role.name === 'staff') {
      const staffPerms = permissions.filter((p) => p.action === 'read');
      for (const perm of staffPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
