// bot/services/views.polling.service.js

import Advertisement from "../../backend/models/Ads.model.js";
import { Op } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_USER_ID = Number(process.env.ADMIN_USER_ID);

let viewsInterval = null;

// TELEGRAM API REQUEST
async function tgApi(method, params = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!data.ok) return null;
    return data.result;
  } catch (err) {
    return null;
  }
}

// POST VIEW OLISH
async function getPostViews(chatId, messageId) {
  try {
    const forwarded = await tgApi("forwardMessage", {
      chat_id: ADMIN_USER_ID,
      from_chat_id: chatId,
      message_id: messageId,
    });

    if (!forwarded) return null;

    const views = forwarded.views ?? forwarded.forward_origin?.views ?? null;

    if (forwarded.message_id) {
      await tgApi("deleteMessage", {
        chat_id: ADMIN_USER_ID,
        message_id: forwarded.message_id,
      });
    }

    return views;
  } catch {
    return null;
  }
}

// HAMMA E'LONLARNI TEKSHIRISH
async function updateAllViews(bot) {
  try {
    const ads = await Advertisement.findAll({
      where: {
        telegramChatId: { [Op.ne]: null },
        telegramMessageIds: { [Op.ne]: null },
      },
      limit: 50,
      order: [["createdAt", "DESC"]],
    });

    if (!ads.length) return;

    for (const ad of ads) {
      try {
        const ids = JSON.parse(ad.telegramMessageIds);
        if (!Array.isArray(ids) || !ids.length) continue;

        const messageId = ids[0];
        const chatId = ad.telegramChatId;

        const views = await getPostViews(chatId, messageId);

        if (views === null) continue;

        if (views > (ad.views || 0)) {
          await ad.update({ views });
        }

      } catch {
        continue;
      }

      await new Promise(r => setTimeout(r, 800)); // rate limit
    }
  } catch {
    return;
  }
}

// TRACKING START
export function startViewsTracking(bot) {
  if (viewsInterval) return;

  updateAllViews(bot);
  viewsInterval = setInterval(() => {
    updateAllViews(bot);
  }, 120000); // 2 minut
}

// TRACKING STOP
export function stopViewsTracking() {
  if (!viewsInterval) return;
  clearInterval(viewsInterval);
  viewsInterval = null;
}