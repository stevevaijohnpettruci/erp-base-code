import prisma from '../../../utils/prisma.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

const orderSelect = {
  id: true, orderNumber: true, type: true, status: true,
  totalAmount: true, notes: true, createdAt: true,
  items: {
    select: {
      id: true, quantity: true, unitPrice: true, subtotal: true,
      product: { select: { id: true, sku: true, name: true, unit: true } },
    },
  },
};

const generateOrderNumber = (type) => {
  const prefix = type === 'PURCHASE' ? 'PO' : 'SO';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${date}-${rand}`;
};

export const getOrders = async (req, res, next) => {
  const { type, status } = req.query;
  const orders = await prisma.order.findMany({
    where: {
      ...(type && { type }),
      ...(status && { status }),
    },
    select: { id: true, orderNumber: true, type: true, status: true, totalAmount: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return response(res, 200, 'Orders retrieved', { orders });
};

export const getOrderById = async (req, res, next) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, select: orderSelect });
  if (!order) return next(new NotFoundError('Order not found.'));
  return response(res, 200, 'Order retrieved', { order });
};

export const createOrder = async (req, res, next) => {
  const { type, items, notes } = req.validated;
  const createdBy = req.user.id;

  // Validate products and calculate totals
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: 'ACTIVE' },
    include: { inventory: true },
  });

  if (products.length !== productIds.length) {
    return next(new InvariantError('One or more products not found or inactive.'));
  }

  // For SALE orders, check stock
  if (type === 'SALE') {
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product.inventory.stock < item.quantity) {
        return next(new InvariantError(`Insufficient stock for product: ${product.name}`));
      }
    }
  }

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const unitPrice = item.unitPrice ?? Number(product.price);
    return { productId: item.productId, quantity: item.quantity, unitPrice, subtotal: unitPrice * item.quantity };
  });

  const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const orderNumber = generateOrderNumber(type);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber, type, notes, createdBy, totalAmount,
        items: { create: orderItems },
      },
      select: orderSelect,
    });

    // Update inventory
    for (const item of orderItems) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { stock: { [type === 'SALE' ? 'decrement' : 'increment']: item.quantity } },
      });
    }

    return newOrder;
  });

  return response(res, 201, 'Order created', { order });
};

export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.validated;

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    select: { id: true, orderNumber: true, status: true },
  }).catch(() => null);

  if (!order) return next(new NotFoundError('Order not found.'));
  return response(res, 200, 'Order status updated', { order });
};
