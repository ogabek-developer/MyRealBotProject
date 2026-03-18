// utils/ads.worker.js
import { Worker } from 'bullmq';
import Advertisement from '../backend/models/Ads.model.js';
import Client from '../backend/models/Client.model.js';
import bot from '../bot/bot.js';
import { config } from 'dotenv';
config();

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let adShareWorker = null;

if (REDIS_ENABLED) {
  const REDIS_URL = process.env.REDIS_URL;
  
  if (!REDIS_URL) {
    console.error('❌ REDIS_URL environment variable topilmadi!');
  } else {
    const goodsConditionLabels = {
      yangi: "✅ Yangi",
      ishlatilgan: "♻️ Ishlatilgan",
      "qisman tiklangan": "🔧 Qisman tiklangan",
      новый: "✅ Новый",
      использованный: "♻️ Использованный",
      отремонтированный: "🔧 Частично восстановленный",
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

    try {
      // Upstash uchun connection configuration
      const connection = {
        url: REDIS_URL,
      };
      
      if (REDIS_URL.startsWith('rediss://')) {
        connection.tls = {
          rejectUnauthorized: false,
        };
      }

      adShareWorker = new Worker(
        'ad-share-queue',
        async (job) => {
          const { adId, clientId } = job.data;

          console.log(`📤 E'lon yuborilmoqda: Ad ID: ${adId}, Client ID: ${clientId}`);

          try {
            const tg_username = process.env.CHANNEL_USERNAME;

            if (!tg_username?.startsWith("@")) {
              throw new Error("CHANNEL_USERNAME noto'g'ri — .env ni tekshiring");
            }

            const ad = await Advertisement.findOne({
              where: { id: adId, clientId },
              include: { model: Client, as: "client" },
            });

            if (!ad) {
              throw new Error("E'lon topilmadi");
            }

            const chat = await bot.getChat(tg_username);
            if (!chat?.id) {
              throw new Error("Kanal topilmadi");
            }
            const chatId = chat.id;

            const me = await bot.getMe();
            const botMember = await bot.getChatMember(chatId, me.id);
            if (!["administrator", "creator"].includes(botMember.status)) {
              throw new Error("Bot bu kanalda admin emas");
            }

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
            const messageIds = sentMessages.map((m) => m.message_id);

            await ad.update({
              telegramMessageIds: JSON.stringify(messageIds),
              telegramChatId: String(chatId),
              views: 0,
            });

            console.log(`✅ E'lon muvaffaqiyatli yuborildi: Ad ID: ${adId}`);

            return {
              success: true,
              telegramMessageIds: messageIds,
              views: 0,
            };

          } catch (error) {
            console.error(`❌ E'lon yuborishda xatolik (Ad ID: ${adId}):`, error.message);
            throw error; // BullMQ retry qilishi uchun
          }
        },
        {
          connection,
          concurrency: 5, // 5 ta parallel job
        }
      );

      // Worker events
      adShareWorker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} muvaffaqiyatli bajarildi`);
      });

      adShareWorker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} xato bilan to'xtadi:`, err.message);
      });

      adShareWorker.on('error', (err) => {
        console.error('❌ Worker xatosi:', err.message);
      });

      console.log('✅ Ad Share Worker ishga tushdi (Upstash)');
    } catch (error) {
      console.error('❌ Worker yaratishda xatolik:', error.message);
      adShareWorker = null;
    }
  }
} else {
  console.log('ℹ️ Worker o\'chirilgan (REDIS_ENABLED=false)');
}

export default adShareWorker;