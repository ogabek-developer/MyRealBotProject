import { globalError } from "shokhijakhon-error-handler";
import Advertisement from "../models/Ads.model.js";
import Client from "../models/Client.model.js";
import cloudinary from "../config/cloudinary.config.js";

import {
  adsCreateSchema,
  adsUpdateSchema,
} from "../../utils/ads.validation.js";
import bot from "../../bot/bot.js";
import Admin from "../models/Admin.model.js";

// ── Konstantalar ──────────────────────────────────────────────────────────────
const rams = ["2GB","3GB","4GB","6GB","8GB","12GB","16GB"];
const roms = ["16GB","32GB","64GB","128GB","256GB","512TB","1TB"];

const goodsConditionLabels = {
  yangi:                "✅ Yangi",
  ishlatilgan:          "♻️ Ishlatilgan",
  "qisman tiklangan":   "🔧 Qisman tiklangan",
  новый:                "✅ Новый",
  использованный:       "♻️ Использованный",
  отремонтированный:    "🔧 Частично восстановленный",
};

// ── Helper: Cloudinary ga ko'p fayl yuklash ───────────────────────────────────
// req.files  → multer in-memory buffer massivi
// qaytaradi  → Cloudinary secure_url massivi
const uploadImagesToCloudinary = async (files) => {
  const uploadedUrls = [];

  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(file.buffer);
    });
    uploadedUrls.push(result.secure_url);
  }

  return uploadedUrls;
};

// ── Helper: goods_picture ni arrayga normallashtirish ─────────────────────────
const normalizePictures = (raw) => {
  if (Array.isArray(raw) && raw.length) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [raw];
  }
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
export default {

  // ── GET ALL ADS BY CLIENT ─────────────────────────────────────────────────
  async GET_ALL_ADS_BYCLIENT(req, res) {
    try {
      const clientId = req.query.clientId;
      if (!clientId)
        return res.status(400).json({ message: "clientId query param kerak" });

      const ads = await Advertisement.findAll({
        where: { clientId },
        include: { model: Client, as: "client" },
        order: [["id", "DESC"]],
      });

      if (!ads.length)
        return res.status(404).json({ message: "Clientga tegishli e'lon topilmadi" });

      res.json(ads);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── GET ALL ───────────────────────────────────────────────────────────────
  async GET_ALL(req, res) {
    try {
      const ads = await Advertisement.findAll({
        include: { model: Client, as: "client" },
        order: [["id", "DESC"]],
      });
      res.json(ads);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── GET BY REGION ─────────────────────────────────────────────────────────
  async GET_BY_REGION(req, res) {
    try {
      const { region } = req.params;
      if (!region || typeof region !== "string")
        return res.status(400).json({ message: "Region kiritilishi shart" });

      const ads = await Advertisement.findAll({
        where: { region },
        include: { model: Client, as: "client" },
        order: [["id", "DESC"]],
      });

      if (!ads.length)
        return res.status(404).json({ message: `${region} bo'yicha e'lon topilmadi` });

      res.json(ads);
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeDatabaseError"
      ) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server xatosi", error: error.message });
    }
  },

  // ── GET BY ID ─────────────────────────────────────────────────────────────
  async GET_BY_ID(req, res) {
    try {
      const ad = await Advertisement.findByPk(req.params.id, {
        include: { model: Client, as: "client" },
      });
      if (!ad) return res.status(404).json({ message: "E'lon topilmadi" });

      res.json(ad);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── UPLOAD IMAGES (pre-upload endpoint) ───────────────────────────────────
  // POST /api/ads/upload
  // multipart: goods_picture (1–3 ta fayl)
  // qaytaradi: { urls: ["https://res.cloudinary.com/...", ...] }
  async UPLOAD_IMAGES(req, res) {
    try {
      if (!req.files || !req.files.length)
        return res.status(400).json({ message: "Kamida bitta rasm yuklanishi shart" });

      if (req.files.length > 3)
        return res.status(400).json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });

      const urls = await uploadImagesToCloudinary(req.files);
      res.json({ urls });
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── CREATE ────────────────────────────────────────────────────────────────
  // Ikki xil so'rov qabul qiladi:
  //   A) multipart/form-data  → req.files mavjud → Cloudinary ga yuklab URL oladi
  //   B) application/json    → req.body.goods_picture = ["url1","url2"] (frontend flow)
  async CREATE(req, res) {
    try {
      let pictureUrls = [];

      // A) Fayl bilan keldi
      if (req.files && req.files.length) {
        if (req.files.length > 3)
          return res.status(400).json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });

        pictureUrls = await uploadImagesToCloudinary(req.files);
      }
      // B) JSON body orqali URL massivi keldi
      else if (req.body.goods_picture) {
        pictureUrls = normalizePictures(req.body.goods_picture);
      }

      if (!pictureUrls.length)
        return res.status(400).json({ message: "Kamida bitta rasm yuklanishi shart" });

      const { error, value } = adsCreateSchema.validate({
        ...req.body,
        goods_picture: pictureUrls,
      });
      if (error) return res.status(400).json({ message: error.details[0].message });

      const client = await Client.findByPk(value.clientId);
      if (!client) return res.status(404).json({ message: "Client topilmadi" });

      if (client.advertisement_limit <= 0)
        return res.status(400).json({ message: "Sizni elon berish limitingiz tugadi" });

      if (!value.goods_condition) value.goods_condition = "yangi";

      const newAd = await Advertisement.create({
        ...value,
        goods_picture: pictureUrls,   // array → Sequelize TEXT ga JSON.stringify
      });

      await client.decrement("advertisement_limit");

      res.status(201).json(newAd);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── CREATE ADMIN AD ───────────────────────────────────────────────────────
  async CREATE_ADMIN_AD(req, res) {
    try {
      let pictureUrls = [];

      if (req.files && req.files.length) {
        if (req.files.length > 3)
          return res.status(400).json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });

        pictureUrls = await uploadImagesToCloudinary(req.files);
      } else if (req.body.goods_picture) {
        pictureUrls = normalizePictures(req.body.goods_picture);
      }

      if (!pictureUrls.length)
        return res.status(400).json({ message: "Kamida bitta rasm yuklanishi shart" });

      const { error, value } = adsCreateSchema.validate({
        ...req.body,
        goods_picture: pictureUrls,
      });
      if (error) return res.status(400).json({ message: error.details[0].message });

      const admin = await Admin.findByPk(value.clientId);
      if (!admin) return res.status(404).json({ message: "Admin topilmadi" });

      if (admin.advertisement_limit <= 0)
        return res.status(400).json({ message: "Admin elon berish limitingiz tugadi" });

      if (!value.goods_condition) value.goods_condition = "yangi";

      const newAd = await Advertisement.create({
        ...value,
        goods_picture: pictureUrls,
      });

      await admin.decrement("advertisement_limit");

      res.status(201).json(newAd);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── UPDATE ────────────────────────────────────────────────────────────────
  // goods_picture yangilash tartibi:
  //   • Yangi fayllar kelsa    → Cloudinary ga yuklab URL oladi (eskisini almashtiradi)
  //   • JSON body.goods_picture → existing + yangi URL massivi (frontend flow)
  //   • Ikkalasi ham yo'q      → rasmlar o'zgarmaydi
  async UPDATE(req, res) {
    try {
      const ad = await Advertisement.findByPk(req.params.id);
      if (!ad) return res.status(404).json({ message: "E'lon topilmadi" });

      const { error, value } = adsUpdateSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      if (value.ram && !rams.includes(value.ram))
        return res.status(400).json({ message: `RAM quyidagilardan biri bo'lishi kerak: ${rams.join(", ")}` });
      if (value.rom && !roms.includes(value.rom))
        return res.status(400).json({ message: `ROM quyidagilardan biri bo'lishi kerak: ${roms.join(", ")}` });

      if (value.region === undefined) value.region = ad.region;

      // A) Yangi fayllar keldi
      if (req.files && req.files.length) {
        if (req.files.length > 3)
          return res.status(400).json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });

        value.goods_picture = await uploadImagesToCloudinary(req.files);
      }
      // B) JSON body orqali URL massivi keldi (existing + yangi URLlar birga)
      else if (req.body.goods_picture) {
        const urls = normalizePictures(req.body.goods_picture);

        if (urls.length === 0)
          return res.status(400).json({ message: "Kamida bitta rasm bo'lishi shart" });
        if (urls.length > 3)
          return res.status(400).json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });

        value.goods_picture = urls;
      }
      // C) Rasm yuborilmadi → o'zgarmaydi
      else {
        delete value.goods_picture;
      }

      await ad.update(value);
      res.json(ad);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── DELETE ────────────────────────────────────────────────────────────────
  async DELETE(req, res) {
    try {
      const ad = await Advertisement.findByPk(req.params.id);
      if (!ad) return res.status(404).json({ message: "E'lon topilmadi" });

      await ad.destroy();
      res.json({ message: "E'lon o'chirildi" });
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── SHARE ADS ─────────────────────────────────────────────────────────────
  async SHARE_ADS(req, res) {
    try {
      const { clientId, adId, tg_username } = req.body;

      if (!tg_username?.startsWith("@"))
        return res.status(400).json({ message: "Username noto'g'ri" });

      const ad = await Advertisement.findOne({
        where: { id: adId, clientId },
        include: { model: Client, as: "client" },
      });
      if (!ad) return res.status(404).json({ message: "E'lon topilmadi" });

      const chat = await bot.getChat(tg_username);
      if (!chat?.id) return res.status(400).json({ message: "Guruh topilmadi" });
      const chatId = chat.id;

      const me = await bot.getMe();
      const botMember = await bot.getChatMember(chatId, me.id);
      if (!["administrator","creator"].includes(botMember.status))
        return res.status(400).json({ message: "Bot bu guruhda admin emas" });

      const caption = `
📱 <b>${ad.advertisement_name}</b>

💰 <b>Narxi:</b> ${ad.price} ${ad.price_currency.toUpperCase()}

📦 <b>Model:</b> ${ad.model.toUpperCase()}
💾 <b>RAM:</b> ${ad.ram}
🗄️ <b>ROM:</b> ${ad.rom}
${goodsConditionLabels[ad.goods_condition] || ad.goods_condition}

🆔 <b>Username:</b> @${ad.client.tg_username}
📞 <b>Tel:</b> ${ad.client.phone}
📍 <b>Region:</b> ${ad.region}

📝 <b>Tavsif:</b>
${ad.short_description}
`.trim();

      const pictures = normalizePictures(ad.goods_picture);

      const mediaGroup = pictures.map((url, idx) => ({
        type: "photo",
        media: url,
        ...(idx === 0 ? { caption, parse_mode: "HTML" } : {}),
      }));

      const sentMessages = await bot.sendMediaGroup(chatId, mediaGroup);

      await ad.increment("views");

      res.json({
        message: "E'lon guruhga yuborildi ✅",
        telegramMessageIds: sentMessages.map((m) => m.message_id),
        views: ad.views + 1,
      });
    } catch (error) {
      console.error("TELEGRAM ERROR 👉", error.message || error);
      return globalError(error, res);
    }
  },
};