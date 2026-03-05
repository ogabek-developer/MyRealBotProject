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

export default {

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

    // --- Clientni topamiz ---
    const client = await Client.findByPk(value.clientId);
    if (!client) return res.status(404).json({ message: "Client topilmadi" });

    if (client.advertisement_limit <= 0)
      return res.status(400).json({
        message: "Sizni elon berish limitingiz tugadi",
      });

    // --- Rasm yuklash ---
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

    // --- Elonni yaratish ---
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
  

async CREATE_ADMIN_AD(req, res) {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Rasm yuklanishi shart" });

    const { error, value } = adsCreateSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // --- Adminni topamiz ---
    const admin = await Admin.findOne({where : {id : value.clientId}}); // clientId faqat admin id
    if (!admin) {
      return res.status(404).json({ message: "Admin topilmadi" });
    }

    // --- Limitni tekshirish ---
    if (admin.advertisement_limit <= 0) {
      return res.status(400).json({ message: "Admin elon berish limitingiz tugadi" });
    }

    // --- Rasm yuklash ---
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

    // --- Elonni yaratish ---
    const newAd = await Advertisement.create({
      ...value,
      goods_picture: uploaded.secure_url,
    });

    // --- Limitni kamaytirish ---
    await admin.decrement("advertisement_limit");

    res.status(201).json(newAd);
  } catch (error) {
    return globalError(error, res);
  }
},

  // GET ALL BY CLIENT
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

      res.json(ads);
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

      if (error)
        return res.status(400).json({ message: error.details[0].message });

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



  async SHARE_ADS(req, res) {
    try {
      const { clientId, adId, tg_username } = req.body;

      if (!tg_username?.startsWith("@")) {
        return res.status(400).json({ message: "Username noto‘g‘ri" });
      }

      // E'lonni olish
      const ad = await Advertisement.findOne({
        where: { id: adId, clientId },
        include: { model: Client, as: "client" },
      });

      if (!ad) return res.status(404).json({ message: "E'lon topilmadi" });

      // CHAT ID olish
      const chat = await bot.getChat(tg_username);
      if (!chat?.id) return res.status(400).json({ message: "Guruh topilmadi" });
      const chatId = chat.id;

      // BOT ID olish
      const me = await bot.getMe();
      const botId = me.id;

      // ADMIN CHECK
      const botMember = await bot.getChatMember(chatId, botId);
      if (!["administrator", "creator"].includes(botMember.status)) {
        return res.status(400).json({ message: "Bot bu guruhda admin emas" });
      }

      // Caption tayyorlash
      const caption = `
📱 <b>${ad.advertisement_name}</b>

💰 <b>Narxi:</b> ${ad.price} ${ad.price_currency.toUpperCase()}

📦 <b>Model:</b> ${ad.model.toUpperCase()}
💾 <b>RAM:</b> ${ad.ram}
🗄️ <b>ROM:</b> ${ad.rom}
${ad.goods_condition === "new" ? "✅ Yangi" : "♻️ Ishlatilgan"}

🆔 <b>Username:</b> @${ad.client.tg_username}
📞 <b>Tel:</b> ${ad.client.phone}

📝 <b>Tavsif:</b>
${ad.short_description}
`;

      // Rasmni yuborish
      const sentMessage = await bot.sendPhoto(chatId, ad.goods_picture, {
        caption: caption,
        parse_mode: "HTML",
      });

      // DB views ni +1 qilish
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