import prisma from '../../../utils/prisma.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

export const getInventory = async (req, res, next) => {
  const inventory = await prisma.inventory.findMany({
    include: { product: { select: { id: true, sku: true, name: true, unit: true } } },
    orderBy: { product: { name: 'asc' } },
  });
  return response(res, 200, 'Inventory retrieved', { inventory });
};

export const getLowStock = async (req, res, next) => {
  const items = await prisma.inventory.findMany({
    where: { stock: { lte: prisma.inventory.fields.minStock } },
    include: { product: { select: { id: true, sku: true, name: true, unit: true } } },
  });
  // Prisma doesn't support column comparison in where directly, use raw filter
  const lowStock = await prisma.$queryRaw`
    SELECT i.*, p.sku, p.name, p.unit
    FROM inventories i
    JOIN products p ON i.product_id = p.id
    WHERE i.stock <= i.min_stock
  `;
  return response(res, 200, 'Low stock items retrieved', { items: lowStock });
};

export const adjustStock = async (req, res, next) => {
  const { productId, quantity, type } = req.validated; // type: 'IN' | 'OUT'

  const inventory = await prisma.inventory.findUnique({ where: { productId } });
  if (!inventory) return next(new NotFoundError('Inventory record not found.'));

  const newStock = type === 'IN' ? inventory.stock + quantity : inventory.stock - quantity;
  if (newStock < 0) return next(new InvariantError('Insufficient stock.'));

  const updated = await prisma.inventory.update({
    where: { productId },
    data: { stock: newStock },
    include: { product: { select: { sku: true, name: true, unit: true } } },
  });

  return response(res, 200, 'Stock adjusted', { inventory: updated });
};
