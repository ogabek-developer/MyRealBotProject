import Joi from "joi";

// CREATE schema — hammasi required
export const adsCreateSchema = Joi.object({
  advertisement_name: Joi.string()
    .required()
    .messages({ "any.required": "E'lon nomi kiritilishi shart" }),
    
  price: Joi.number()
    .required()
    .messages({ "any.required": "Narx kiritilishi shart" }),
    
  price_currency: Joi.string()
    .valid("usd", "uzs")
    .required()
    .messages({
      "any.only": "Narx valyutasi faqat 'usd' yoki 'uzs' bo‘lishi kerak",
      "any.required": "Narx valyutasi kiritilishi shart",
    }),
    
  model: Joi.string()
    .required()
    .messages({ "any.required": "Model kiritilishi shart" }),
    
  ram: Joi.string()
    .required()
    .messages({ "any.required": "RAM kiritilishi shart" }),
    
  rom: Joi.string()
    .required()
    .messages({ "any.required": "ROM kiritilishi shart" }),
    
  goods_condition: Joi.string()
    .required()
    .messages({ "any.required": "Mahsulot holati kiritilishi shart" }),
    
  short_description: Joi.string()
    .required()
    .messages({ "any.required": "Qisqa tavsif kiritilishi shart" }),
    
  clientId: Joi.number()
    .required()
    .messages({ "any.required": "Client ID kiritilishi shart" }),
});

// UPDATE schema — hammasi optional
export const adsUpdateSchema = Joi.object({
  advertisement_name: Joi.string().messages({
    "string.base": "E'lon nomi matn bo‘lishi kerak",
  }),
  
  price: Joi.number().messages({
    "number.base": "Narx son bo‘lishi kerak",
  }),
  
  price_currency: Joi.string().valid("usd", "uzs").messages({
    "any.only": "Narx valyutasi faqat 'usd' yoki 'uzs' bo‘lishi mumkin",
  }),
  
  model: Joi.string().messages({
    "string.base": "Model matn bo‘lishi kerak",
  }),
  
  ram: Joi.string().messages({
    "string.base": "RAM matn bo‘lishi kerak",
  }),
  
  rom: Joi.string().messages({
    "string.base": "ROM matn bo‘lishi kerak",
  }),
  
  goods_condition: Joi.string().messages({
    "string.base": "Mahsulot holati matn bo‘lishi kerak",
  }),
  
  short_description: Joi.string().messages({
    "string.base": "Qisqa tavsif matn bo‘lishi kerak",
  }),
  
  clientId: Joi.number().messages({
    "number.base": "Client ID son bo‘lishi kerak",
  }),
});
