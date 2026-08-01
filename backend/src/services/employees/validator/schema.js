import Joi from 'joi';

export const createEmployeeSchema = Joi.object({
  userId: Joi.string().required(),
  employeeCode: Joi.string().max(20).required(),
  departmentId: Joi.string().required(),
  position: Joi.string().max(100).required(),
  joinDate: Joi.date().iso().required(),
});

export const updateEmployeeSchema = Joi.object({
  departmentId: Joi.string().optional(),
  position: Joi.string().max(100).optional(),
  status: Joi.string().valid('ACTIVE', 'RESIGNED', 'TERMINATED').optional(),
});
