const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const createStudentSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  rollNumber: Joi.string().required(),
  roomNumber: Joi.string().required(),
  active: Joi.boolean().default(true),
});

const menuSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  breakfast: Joi.string().allow("").required(),
  lunch: Joi.string().allow("").required(),
  dinner: Joi.string().allow("").required(),
});

const feedbackSchema = Joi.object({
  studentId: Joi.number().integer().required(),
  message: Joi.string().required(),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  createStudentSchema,
  menuSchema,
  feedbackSchema,
};
