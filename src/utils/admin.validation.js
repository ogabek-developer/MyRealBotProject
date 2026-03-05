
import Joi from "joi";

export const adminCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),

  tg_username: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Telegram username is required",
    "any.required": "Telegram username is required",
  }),

  phone: Joi.string().min(7).max(20).required().messages({
    "string.empty": "Phone is required",
    "any.required": "Phone is required",
  }),

  platform_language: Joi.string().valid("uz", "ru").required().messages({
    "any.only": "Language must be 'uz' or 'ru'",
    "any.required": "Platform language is required",
  }),

  tg_id : Joi.number().required().messages({
    "number.empty" : "Tg id  required !",
    "any.required" : "Tg id required !"
  }),
  step: Joi.string().optional(),
  is_admin: Joi.boolean().optional(),
});

export const adminUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    "string.min": "Name must be at least 2 characters",
  }),

  tg_username: Joi.string().min(3).max(100),

  phone: Joi.string().min(7).max(20),

  platform_language: Joi.string().valid("uz", "ru").messages({
    "any.only": "Language must be 'uz' or 'ru'",
  }),

  step: Joi.string(),
  is_admin: Joi.boolean(),
});
