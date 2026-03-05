
import Joi from "joi";

export const clientUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    "string.min": "Name must be at least 2 characters",
  }),

  tg_username: Joi.string().min(3).max(100),

  phone: Joi.string().min(7).max(20),

  platform_language: Joi.string().valid("uz", "ru").messages({
    "any.only": "Language must be 'uz' or 'ru'",
  }),

  client_address: Joi.string().max(255),

  advertisement_limit: Joi.number().integer().min(1).max(20),

  subscribed: Joi.boolean(),

  step: Joi.string(),
});
