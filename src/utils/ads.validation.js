import Joi from "joi";

// ── Ro'yxatlar ───────────────────────────────────────────────────────────────
const regions = [
  "Toshkent","Andijon","Fargona","Namangan","Samarqand","Buxoro",
  "Xorazm","Qashqadaryo","Surxondaryo","Jizzax","Sirdaryo","Navoiy",
];
const rams = ["2GB","3GB","4GB","6GB","8GB","12GB","16GB"];
const roms = ["16GB","32GB","64GB","128GB","256GB","512GB","1TB"];
const goodsConditions = [
  "yangi","ishlatilgan","qisman tiklangan",
  "новый","использованный","отремонтированный",
];

// ── CREATE schema ─────────────────────────────────────────────────────────────
// goods_picture ikki shaklda kelishi mumkin:
//   1) multipart/form-data  → req.files (multer) → controller URLga o'tkazadi
//   2) application/json     → req.body.goods_picture = ["url1","url2"]
//      (frontend /upload endpoint ishlatgandan keyin JSON body yuboradi)
export const adsCreateSchema = Joi.object({
  advertisement_name: Joi.string().required()
    .messages({ "any.required": "E'lon nomi kiritilishi shart" }),

  price: Joi.number().required()
    .messages({ "any.required": "Narx kiritilishi shart" }),

  price_currency: Joi.string().valid("usd","uzs").required()
    .messages({
      "any.only": "Narx valyutasi faqat 'usd' yoki 'uzs' bo'lishi kerak",
      "any.required": "Narx valyutasi kiritilishi shart",
    }),

  model: Joi.string().required()
    .messages({ "any.required": "Model kiritilishi shart" }),

  ram: Joi.string().valid(...rams).required()
    .messages({
      "any.only": `RAM quyidagilardan biri bo'lishi kerak: ${rams.join(", ")}`,
      "any.required": "RAM kiritilishi shart",
    }),

  rom: Joi.string().valid(...roms).required()
    .messages({
      "any.only": `ROM quyidagilardan biri bo'lishi kerak: ${roms.join(", ")}`,
      "any.required": "ROM kiritilishi shart",
    }),

  goods_condition: Joi.string().valid(...goodsConditions).required()
    .messages({
      "any.only": `Mahsulot holati quyidagilardan biri bo'lishi kerak: ${goodsConditions.join(", ")}`,
      "any.required": "Mahsulot holati kiritilishi shart",
    }),

  short_description: Joi.string().required()
    .messages({ "any.required": "Qisqa tavsif kiritilishi shart" }),

  clientId: Joi.number().required()
    .messages({ "any.required": "Client ID kiritilishi shart" }),

  region: Joi.string().valid(...regions).default("Toshkent").required()
    .messages({
      "any.only": `Region quyidagilardan biri bo'lishi kerak: ${regions.join(", ")}`,
      "any.required": "Region kiritilishi shart",
    }),

  // JSON body orqali kelganda: URI array (1–3 ta)
  goods_picture: Joi.array()
    .items(Joi.string().uri())
    .min(1).max(3)
    .optional()
    .messages({
      "array.min": "Kamida 1 ta rasm URLi kiritilishi shart",
      "array.max": "Rasmlar soni 3 tadan oshmasligi kerak",
    }),
});

// ── UPDATE schema ─────────────────────────────────────────────────────────────
export const adsUpdateSchema = Joi.object({
  advertisement_name: Joi.string()
    .messages({ "string.base": "E'lon nomi matn bo'lishi kerak" }),

  price: Joi.number()
    .messages({ "number.base": "Narx son bo'lishi kerak" }),

  price_currency: Joi.string().valid("usd","uzs")
    .messages({ "any.only": "Narx valyutasi faqat 'usd' yoki 'uzs' bo'lishi mumkin" }),

  model: Joi.string()
    .messages({ "string.base": "Model matn bo'lishi kerak" }),

  ram: Joi.string().valid(...rams)
    .messages({ "any.only": `RAM quyidagilardan biri bo'lishi kerak: ${rams.join(", ")}` }),

  rom: Joi.string().valid(...roms)
    .messages({ "any.only": `ROM quyidagilardan biri bo'lishi kerak: ${roms.join(", ")}` }),

  goods_condition: Joi.string().valid(...goodsConditions)
    .messages({ "any.only": `Mahsulot holati quyidagilardan biri bo'lishi kerak: ${goodsConditions.join(", ")}` }),

  short_description: Joi.string()
    .messages({ "string.base": "Qisqa tavsif matn bo'lishi kerak" }),

  clientId: Joi.number()
    .messages({ "number.base": "Client ID son bo'lishi kerak" }),

  region: Joi.string().valid(...regions)
    .messages({ "any.only": `Region quyidagilardan biri bo'lishi kerak: ${regions.join(", ")}` }),

  // JSON body orqali kelganda: URI array (1–3 ta)
  goods_picture: Joi.array()
    .items(Joi.string().uri())
    .min(1).max(3)
    .optional()
    .messages({
      "array.min": "Kamida 1 ta rasm URLi kiritilishi shart",
      "array.max": "Rasmlar soni 3 tadan oshmasligi kerak",
    }),
});