import Client from "../../backend/models/Client.model.js";
import {config} from "dotenv"
config() ;

export async function checkSubscription(bot, userId, channel) {
  try {
    const member = await bot.getChatMember(channel, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch {
    return false;
  }
}

export async function sendSubscribeMessage(bot, chatId, channel) {
  let chat_2 = process.env.CHANNEL_USERNAME_2
  await bot.sendMessage(
    chatId,
    "🤖 Botdan foydalanish uchun quyidagi kanalga obuna bo'lishingiz kerak:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 kanalga o'ting", url: `https://t.me/${channel.replace("@", "")}` }],
          [{ text: "📢 kanalga o'ting", url: `https://t.me/${chat_2.replace("@", "")}` }],
          [{ text: "✅ obunani tekshirish", callback_data: "check_subscription" }],
        ],
      },
    }
  );
}

export async function requireSubscription(bot, msg, channel) {
  const chatId = msg.chat.id;
  const tgId = msg.from.id;
  const username = msg.from.username || "";

  let client = await Client.findOne({ where: { tg_id: tgId } });
  const isSubscribed = await checkSubscription(bot, tgId, channel);

  if (client) {
    await client.update({ subscribed: isSubscribed, tg_username: username });
  } else if (isSubscribed) {
    client = await Client.create({
      tg_id: tgId,
      tg_username: username,
      step: "choosing_language",
      subscribed: true,
    });
  }

  if (!isSubscribed) {
    if (client) await client.update({ subscribed: false, tg_username: username });
    await sendSubscribeMessage(bot, chatId, channel);
    return false;
  }

  return true;
}

export function registerSubscribeCallbacks(bot, channel) {
  bot.on("callback_query", async (query) => {
    if (query.data !== "check_subscription") return;

    const chatId = query.message.chat.id;
    const tgId = query.from.id;
    const username = query.from.username || "";

    const client = await Client.findOne({ where: { tg_id: tgId } });
    const isSubscribed = await checkSubscription(bot, tgId, channel);

    if (client) await client.update({ subscribed: isSubscribed, tg_username: username });

    if (isSubscribed) {
      await bot.sendMessage(
        chatId,
        "✅ Siz kanalga obuna bo'ldingiz. Botdan foydalanishni davom ettirish uchun /start tugmasini bosing"
      );
    } else {
      await sendSubscribeMessage(bot, chatId, channel);
    }

    await bot.answerCallbackQuery(query.id);
  });
}
