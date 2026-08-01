import Joi from 'joi';

export const createProductSchema = Joi.object({
  sku: Joi.string().max(50).required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().optional(),
  categoryId: Joi.string().required(),
  price: Joi.number().positive().required(),
  unit: Joi.string().max(20).required(),
  initialStock: Joi.number().integer().min(0).default(0),
  minStock: Joi.number().integer().min(0).default(0),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().max(200).optional(),
  description: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  unit: Joi.string().max(20).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DISCONTINUED').optional(),
});
