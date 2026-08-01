import prisma from '../../../utils/prisma.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

const productSelect = {
  id: true, sku: true, name: true, description: true,
  price: true, unit: true, status: true,
  category: { select: { id: true, name: true } },
  inventory: { select: { stock: true, minStock: true } },
};

export const getProducts = async (req, res, next) => {
  const { categoryId, status } = req.query;
  const products = await prisma.product.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(status && { status }),
    },
    select: productSelect,
    orderBy: { name: 'asc' },
  });
  return response(res, 200, 'Products retrieved', { products });
};

export const getProductById = async (req, res, next) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: productSelect,
  });
  if (!product) return next(new NotFoundError('Product not found.'));
  return response(res, 200, 'Product retrieved', { product });
};

export const createProduct = async (req, res, next) => {
  const { sku, name, description, categoryId, price, unit, initialStock = 0, minStock = 0 } = req.validated;

  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) return next(new InvariantError('SKU already exists.'));

  const product = await prisma.product.create({
    data: {
      sku, name, description, categoryId, price, unit,
      inventory: { create: { stock: initialStock, minStock } },
    },
    select: productSelect,
  });
  return response(res, 201, 'Product created', { product });
};

export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, categoryId, price, unit, status } = req.validated;

  const product = await prisma.product.update({
    where: { id },
    data: { name, description, categoryId, price, unit, status },
    select: productSelect,
  }).catch(() => null);

  if (!product) return next(new NotFoundError('Product not found.'));
  return response(res, 200, 'Product updated', { product });
};

export const deleteProduct = async (req, res, next) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { status: 'DISCONTINUED' },
  }).catch(() => null);
  return response(res, 200, 'Product discontinued', null);
};
