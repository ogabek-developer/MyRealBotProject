import Client from "../../backend/models/Client.model.js";
import Admin from "../../backend/models/Admin.model.js";
// import { sendMenu } from "./language.service.js"; // shu import olib tashlandi, chunki sendMenu shu faylda e’lon qilinadi

export async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const tgId = msg.from.id;
  const username = msg.from.username || "";

  // Admin tekshirish
  const admin = await Admin.findOne({ where: { tg_id: tgId } });
  if (admin) {
    const lang = admin.platform_language || "uz";
    const text = lang === "uz" ? "🔐 Admin Panel :" : "🔐 Панель админа :";

    await bot.sendMessage(chatId, text, {
      reply_markup: {
        keyboard: [
          [{ text: lang === "uz" ? "🌐 Admin web app" : "🌐 Веб приложение администратора" }],
          [{ text: lang === "uz" ? "⚙️ Admin Sozlamalari" : "⚙️ Настройки администратора" }],
        ],
        resize_keyboard: true,
      },
    });
    return;
  }

  // Client tekshirish
  const client = await Client.findOne({ where: { tg_id: tgId } });
  if (!client || !client.subscribed) return;

  if (client.step === "choosing_language") {
    await bot.sendMessage(chatId, "🆎 Iltimos tilni tugma orqali tanlang :", {
      reply_markup: {
        keyboard: [[{ text: "🇺🇿 O'zbekcha" }, { text: "🇷🇺 Русский" }]],
        resize_keyboard: true,
      },
    });
    return;
  }

  if (client.step === "menu") {
    await sendMenu(bot, chatId, client.platform_language);
  }
}

export async function handleLanguageChoice(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const tgId = msg.from.id;

  const client = await Client.findOne({ where: { tg_id: tgId } });
  if (!client || client.step !== "choosing_language" || !client.subscribed) return false;

  if (text.includes("O'zbek")) {
    await client.update({ platform_language: "uz", step: "creating_name" });
    await bot.sendMessage(chatId, "✍️ To'liq ismingizni kiriting:", { reply_markup: { remove_keyboard: true } });
    return true;
  }

  if (text.includes("Рус")) {
    await client.update({ platform_language: "ru", step: "creating_name" });
    await bot.sendMessage(chatId, "✍️ Введите ваше полное имя:", { reply_markup: { remove_keyboard: true } });
    return true;
  }

  return false;
}

// --- sendMenu faqat shu faylda bitta marta e’lon qilinadi ---
export async function sendMenu(bot, chatId, lang) {
  if (!chatId) return;
  if (lang === "uz") {
    await bot.sendMessage(chatId, "📝 Menu :", {
      reply_markup: {
        keyboard: [
          [{ text: "🌐 Web App"}],
          [{ text: "⚙️ Sozlamalar" }],
        ],
        resize_keyboard: true,
      },
    });
  } else {
    await bot.sendMessage(chatId, "📝 Меню", {
      reply_markup: {
        keyboard: [
          [{ text: "🌐 Веб приложение" }],
          [{ text: "⚙️ Настройки" }],
        ],
        resize_keyboard: true,
      },
    });
  }
}
