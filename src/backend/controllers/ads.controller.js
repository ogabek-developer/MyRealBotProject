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

// RAM va ROM enumlari
const rams = ['2GB','3GB','4GB','6GB','8GB','12GB','16GB'];
const roms = ['16GB','32GB','64GB','128GB','256GB','512GB','1TB'];

// Goods condition label mapping
const goodsConditionLabels = {
  // Uzbek
  'yangi': '✅ Yangi',
  'ishlatilgan': '♻️ Ishlatilgan',
  'qisman tiklangan': '🔧 Qisman tiklangan',
  // Rus
  'новый': '✅ Новый',
  'использованный': '♻️ Использованный',
  'отремонтированный': '🔧 Частично восстановленный'
};

export default {

  // GET ALL ADS BY CLIENT
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

      if (!ads.length) {
        return res.status(404).json({ message: "Clientga tegishli e'lon topilmadi" });
      }

      res.json(ads);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // GET ALL
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

  // GET BY REGION
  async GET_BY_REGION(req, res) {
    try {
      const { region } = req.params;

      if (!region || typeof region !== "string") {
        return res.status(400).json({ message: "Region kiritilishi shart va matn bo‘lishi kerak" });
      }

      const ads = await Advertisement.findAll({
        where: { region },
        include: { model: Client, as: "client" },
        order: [["id", "DESC"]],
      });

      if (!ads.length) {
        return res.status(404).json({ message: `${region} bo‘yicha e’lon topilmadi` });
      }

      res.json(ads);
    } catch (error) {
      if (error.name === "SequelizeValidationError" || error.name === "SequelizeDatabaseError") {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server xatosi", error: error.message });
    }
  },

  // GET BY ID
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

  // CREATE
  async CREATE(req, res) {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Rasm yuklanishi shart" });

      const { error, value } = adsCreateSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      // Default region
      if (!value.region) value.region = "Toshkent";

      // RAM va ROM tekshirish
      if (!rams.includes(value.ram)) return res.status(400).json({ message: `RAM quyidagilardan biri bo‘lishi kerak: ${rams.join(", ")}` });
      if (!roms.includes(value.rom)) return res.status(400).json({ message: `ROM quyidagilardan biri bo‘lishi kerak: ${roms.join(", ")}` });

      const client = await Client.findByPk(value.clientId);
      if (!client) return res.status(404).json({ message: "Client topilmadi" });

      if (client.advertisement_limit <= 0)
        return res.status(400).json({ message: "Sizni elon berish limitingiz tugadi" });

      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(req.file.buffer);
        });

      const uploaded = await streamUpload();

      // Default goods_condition
      if (!value.goods_condition) value.goods_condition = 'yangi';

      const newAd = await Advertisement.create({
        ...value,
        goods_picture: uploaded.secure_url,
      });

      await client.decrement("advertisement_limit");

      res.status(201).json(newAd);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // CREATE ADMIN AD
  async CREATE_ADMIN_AD(req, res) {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Rasm yuklanishi shart" });

      const { error, value } = adsCreateSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      if (!value.region) value.region = "Toshkent";

      if (!rams.includes(value.ram)) return res.status(400).json({ message: `RAM quyidagilardan biri bo‘lishi kerak: ${rams.join(", ")}` });
      if (!roms.includes(value.rom)) return res.status(400).json({ message: `ROM quyidagilardan biri bo‘lishi kerak: ${roms.join(", ")}` });

      const admin = await Admin.findOne({ where: { id: value.clientId } });
      if (!admin) return res.status(404).json({ message: "Admin topilmadi" });

      if (admin.advertisement_limit <= 0) return res.status(400).json({ message: "Admin elon berish limitingiz tugadi" });

      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(req.file.buffer);
        });

      const uploaded = await streamUpload();

      if (!value.goods_condition) value.goods_condition = 'yangi';

      const newAd = await Advertisement.create({
        ...value,
        goods_picture: uploaded.secure_url,
      });

      await admin.decrement("advertisement_limit");

      res.status(201).json(newAd);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // UPDATE
  async UPDATE(req, res) {
    try {
      const ad = await Advertisement.findByPk(req.params.id);
      if (!ad) return res.status(404).json({ message: "E'lon topilmadi" });

      const { error, value } = adsUpdateSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      // RAM va ROM tekshirish
      if (value.ram && !rams.includes(value.ram)) return res.status(400).json({ message: `RAM quyidagilardan biri bo‘lishi kerak: ${rams.join(", ")}` });
      if (value.rom && !roms.includes(value.rom)) return res.status(400).json({ message: `ROM quyidagilardan biri bo‘lishi kerak: ${roms.join(", ")}` });

      // Default region
      if (value.region === undefined) value.region = ad.region;

      if (req.file) {
        const streamUpload = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image" },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            stream.end(req.file.buffer);
          });

        const uploaded = await streamUpload();
        value.goods_picture = uploaded.secure_url;
      }

      await ad.update(value);

      res.json(ad);
    } catch (error) {
      return globalError(error, res);
    }
  },

  // DELETE
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

  // SHARE_ADS
  async SHARE_ADS(req, res) {
    try {
      const { clientId, adId, tg_username } = req.body;
      if (!tg_username?.startsWith("@")) return res.status(400).json({ message: "Username noto‘g‘ri" });

      const ad = await Advertisement.findOne({
        where: { id: adId, clientId },
        include: { model: Client, as: "client" },
      });

      if (!ad) return res.status(404).json({ message: "E'lon topilmadi" });

      const chat = await bot.getChat(tg_username);
      if (!chat?.id) return res.status(400).json({ message: "Guruh topilmadi" });
      const chatId = chat.id;

      const me = await bot.getMe();
      const botId = me.id;

      const botMember = await bot.getChatMember(chatId, botId);
      if (!["administrator", "creator"].includes(botMember.status)) return res.status(400).json({ message: "Bot bu guruhda admin emas" });

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
`;

      const sentMessage = await bot.sendPhoto(chatId, ad.goods_picture, {
        caption: caption,
        parse_mode: "HTML",
      });

      await ad.increment('views');

      res.json({
        message: "E'lon guruhga yuborildi ✅",
        telegramMessageId: sentMessage.message_id,
        views: ad.views + 1,
      });

    } catch (error) {
      console.log("TELEGRAM ERROR 👉", error.message || error);
      return globalError(error, res);
    }
  }

};