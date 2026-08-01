import Joi from 'joi';

export const createOrderSchema = Joi.object({
  type: Joi.string().valid('PURCHASE', 'SALE').required(),
  notes: Joi.string().optional(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().positive().required(),
      unitPrice: Joi.number().positive().optional(),
    }),
  ).min(1).required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
    .required(),
});
