// backend/controllers/ads.controller.js
import { globalError } from "shokhijakhon-error-handler";
import Advertisement from "../models/Ads.model.js";
import Client from "../models/Client.model.js";
import cloudinary from "../config/cloudinary.config.js";
import { config } from "dotenv";
config();

import {
  adsCreateSchema,
  adsUpdateSchema,
} from "../../utils/ads.validation.js";
import bot from "../../bot/bot.js";
import Admin from "../models/Admin.model.js";

const rams = ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"];
const roms = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];

const goodsConditionLabels = {
  yangi: "✅ Yangi",
  ishlatilgan: "♻️ Ishlatilgan",
  "qisman tiklangan": "🔧 Qisman tiklangan",
  новый: "✅ Новый",
  использованный: "♻️ Использованный",
  отремонтированный: "🔧 Частично восстановленный",
};

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

export default {
  async GET_ALL_ADS_BYCLIENT(req, res) {
    try {
      const clientId = req.query.clientId;
      if (!clientId)
        return res
          .status(400)
          .json({ message: "clientId query param kerak" });

      const ads = await Advertisement.findAll({
        where: { clientId },
        include: { model: Client, as: "client" },
        order: [["id", "DESC"]],
      });

      if (!ads.length)
        return res
          .status(404)
          .json({ message: "Clientga tegishli e'lon topilmadi" });

      res.json(ads);
    } catch (error) {
      return globalError(error, res);
    }
  },

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

  async GET_BY_REGION(req, res) {
    try {
      const { region } = req.params;
      if (!region || typeof region !== "string")
        return res
          .status(400)
          .json({ message: "Region kiritilishi shart" });

      const ads = await Advertisement.findAll({
        where: { region },
        include: { model: Client, as: "client" },
        order: [["id", "DESC"]],
      });

      if (!ads.length)
        return res
          .status(404)
          .json({ message: `${region} bo'yicha e'lon topilmadi` });

      res.json(ads);
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeDatabaseError"
      ) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: "Server xatosi", error: error.message });
    }
  },

  async GET_BY_ID(req, res) {
    try {
      const ad = await Advertisement.findByPk(req.params.id, {
        include: { model: Client, as: "client" },
      });
      if (!ad)
        return res.status(404).json({ message: "E'lon topilmadi" });
      res.json(ad);
    } catch (error) {
      return globalError(error, res);
    }
  },

  async UPLOAD_IMAGES(req, res) {
    try {
      if (!req.files || !req.files.length)
        return res
          .status(400)
          .json({ message: "Kamida bitta rasm yuklanishi shart" });
      if (req.files.length > 3)
        return res
          .status(400)
          .json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });
      const urls = await uploadImagesToCloudinary(req.files);
      res.json({ urls });
    } catch (error) {
      return globalError(error, res);
    }
  },

  async CREATE(req, res) {
    try {
      let pictureUrls = [];

      if (req.files && req.files.length) {
        if (req.files.length > 3)
          return res
            .status(400)
            .json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });
        pictureUrls = await uploadImagesToCloudinary(req.files);
      } else if (req.body.goods_picture) {
        pictureUrls = normalizePictures(req.body.goods_picture);
      }

      if (!pictureUrls.length)
        return res
          .status(400)
          .json({ message: "Kamida bitta rasm yuklanishi shart" });

      const { error, value } = adsCreateSchema.validate({
        ...req.body,
        goods_picture: pictureUrls,
      });
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const client = await Client.findByPk(value.clientId);
      if (!client)
        return res.status(404).json({ message: "Client topilmadi" });

      if (client.advertisement_limit <= 0)
        return res
          .status(400)
          .json({ message: "Sizni elon berish limitingiz tugadi" });

      if (!value.goods_condition) value.goods_condition = "yangi";

      const newAd = await Advertisement.create({
        ...value,
        goods_picture: pictureUrls,
      });
      await client.decrement("advertisement_limit");

      res.status(201).json(newAd);
    } catch (error) {
      return globalError(error, res);
    }
  },

  async CREATE_ADMIN_AD(req, res) {
    try {
      let pictureUrls = [];

      if (req.files && req.files.length) {
        if (req.files.length > 3)
          return res
            .status(400)
            .json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });
        pictureUrls = await uploadImagesToCloudinary(req.files);
      } else if (req.body.goods_picture) {
        pictureUrls = normalizePictures(req.body.goods_picture);
      }

      if (!pictureUrls.length)
        return res
          .status(400)
          .json({ message: "Kamida bitta rasm yuklanishi shart" });

      const { error, value } = adsCreateSchema.validate({
        ...req.body,
        goods_picture: pictureUrls,
      });
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const admin = await Admin.findByPk(value.clientId);
      if (!admin)
        return res.status(404).json({ message: "Admin topilmadi" });

      if (admin.advertisement_limit <= 0)
        return res
          .status(400)
          .json({ message: "Admin elon berish limitingiz tugadi" });

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

  async UPDATE(req, res) {
    try {
      const ad = await Advertisement.findByPk(req.params.id);
      if (!ad)
        return res.status(404).json({ message: "E'lon topilmadi" });

      const { error, value } = adsUpdateSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      if (value.ram && !rams.includes(value.ram))
        return res.status(400).json({
          message: `RAM quyidagilardan biri bo'lishi kerak: ${rams.join(", ")}`,
        });
      if (value.rom && !roms.includes(value.rom))
        return res.status(400).json({
          message: `ROM quyidagilardan biri bo'lishi kerak: ${roms.join(", ")}`,
        });

      if (value.region === undefined) value.region = ad.region;

      if (req.files && req.files.length) {
        if (req.files.length > 3)
          return res
            .status(400)
            .json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });
        value.goods_picture = await uploadImagesToCloudinary(req.files);
      } else if (req.body.goods_picture) {
        const urls = normalizePictures(req.body.goods_picture);
        if (urls.length === 0)
          return res
            .status(400)
            .json({ message: "Kamida bitta rasm bo'lishi shart" });
        if (urls.length > 3)
          return res
            .status(400)
            .json({ message: "Rasmlar soni 3 tadan oshmasligi kerak" });
        value.goods_picture = urls;
      } else {
        delete value.goods_picture;
      }

      await ad.update(value);
      res.json(ad);
    } catch (error) {
      return globalError(error, res);
    }
  },

  async DELETE(req, res) {
    try {
      const ad = await Advertisement.findByPk(req.params.id);
      if (!ad)
        return res.status(404).json({ message: "E'lon topilmadi" });

      const user = await Client.findByPk(ad.clientId);
      if (user && user.advertisement_limit < 5) {
        user.advertisement_limit += 1;
        await user.save();
      }

      await ad.destroy();
      res.json({ message: "E'lon o'chirildi" });
    } catch (error) {
      return globalError(error, res);
    }
  },

  // ── SHARE ADS ──────────────────────────────────────────────────────────────
  // E'lonni kanalga yuboradi va telegramMessageIds, telegramChatId ni saqlaydi.
  // Views 0 dan boshlanadi.
  // Webhook rejimida Telegram o'zi "edited_channel_post" eventini yuboradi →
  // views.polling.service.js → updateViewsFromPost() → DB yangilanadi.
  async SHARE_ADS(req, res) {
    try {
      const { clientId, adId } = req.body;

      const tg_username = process.env.CHANNEL_USERNAME;

      if (!tg_username?.startsWith("@"))
        return res.status(400).json({
          message: "CHANNEL_USERNAME noto'g'ri — .env ni tekshiring",
        });

      const ad = await Advertisement.findOne({
        where: { id: adId, clientId },
        include: { model: Client, as: "client" },
      });
      if (!ad)
        return res.status(404).json({ message: "E'lon topilmadi" });

      const chat = await bot.getChat(tg_username);
      if (!chat?.id)
        return res.status(400).json({ message: "Kanal topilmadi" });
      const chatId = chat.id;

      const me = await bot.getMe();
      const botMember = await bot.getChatMember(chatId, me.id);
      if (!["administrator", "creator"].includes(botMember.status))
        return res
          .status(400)
          .json({ message: "Bot bu kanalda admin emas" });

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

      // Message ID larni saqlaydi — webhook event bu ID orqali topadi
      const messageIds = sentMessages.map((m) => m.message_id);

      await ad.update({
        telegramMessageIds: JSON.stringify(messageIds),
        telegramChatId: String(chatId),
        views: 0, // Yangi yuborildi, views 0 dan boshlanadi
      });

      return res.json({
        message: "E'lon kanalga yuborildi ✅",
        telegramMessageIds: messageIds,
        views: 0,
        note: "Views Telegram webhook orqali avtomatik yangilanadi",
      });
    } catch (error) {
      console.error("SHARE_ADS ERROR 👉", error.message || error);
      return globalError(error, res);
    }
  },
};