import Joi from 'joi';

export const departmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(255).optional(),
});
