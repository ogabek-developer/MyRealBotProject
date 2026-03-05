import Client from "../../backend/models/Client.model.js";
import { sendMenu } from "./language.service.js";
import { handleRegistration } from "./register.service.js";

export async function handleSettings(bot, msg) {
  const chatId = msg.chat.id;
  const tgId = msg.from.id;

  const client = await Client.findOne({ where: { tg_id: tgId } });
  if (!client || !client.subscribed) return false;

  const lang = client.platform_language;
  const text = msg.text;

  if (text === "⚙️ Sozlamalar" || text === "⚙️ Настройки") {
    const buttons = lang === "uz"
      ? [
          [{ text: "🧾 Mening malumotlarim" }],
          [{ text: "🌐 Tilni o'zgartirish" }],
          [{ text: "↩️ Menuga qaytish" }],
        ]
      : [
          [{ text: "🧾 Мои данные" }],
          [{ text: "🌐 Изменить язык" }],
          [{ text: "↩️ В меню" }],
        ];

    await bot.sendMessage(
      chatId,
      lang === "uz" ? "⚙️ Sozlamalar :" : "⚙️ Настройки :",
      { reply_markup: { keyboard: buttons, resize_keyboard: true } }
    );
    return true;
  }

  if (text === "🧾 Mening malumotlarim" || text === "🧾 Мои данные") {
    await showClientInfo(bot, client, lang, chatId);
    return true;
  }

  if (text === "🌐 Tilni o'zgartirish" || text === "🌐 Изменить язык") {
    await promptLanguage(bot, client, chatId);
    return true;
  }

  if (text === "↩️ Menuga qaytish" || text === "↩️ В меню") {
    await sendMenu(bot, chatId, lang);
    return true;
  }

  return false;
}

export async function handleSettingsCallback(bot, query) {
  const chatId = query.message.chat.id;
  const tgId = query.from.id;

  const client = await Client.findOne({ where: { tg_id: tgId } });
  if (!client || !client.subscribed) return;

  const lang = client.platform_language;
  const data = query.data;

  if (data === "change_name") {
    await bot.sendMessage(
      chatId,
      lang === "uz"
        ? "✍️ To'liq ismingizni kiriting:"
        : "✍️ Введите ваше полное имя:",
      { reply_markup: { remove_keyboard: true } }
    );

    bot.once("message", async (msg) => {
      await handleNameChange(bot, msg, client, lang);
    });
  }

  if (data === "back_to_menu") {
    await sendMenu(bot, chatId, lang);
  }
}

async function handleNameChange(bot, msg, client, lang) {
  const chatId = msg.chat.id;
  const newName = msg.text;

  if (!newName || newName.length < 6) {
    await bot.sendMessage(
      chatId,
      lang === "uz"
        ? "❌ Ism kamida 6 ta harf bo'lishi kerak, qayta kiriting:"
        : "❌ Имя должно быть минимум 6 символов, попробуйте снова:"
    );

    bot.once("message", async (msg2) => {
      await handleNameChange(bot, msg2, client, lang);
    });
    return;
  }

  await client.update({ name: newName });

  await showClientInfo(bot, client, lang, chatId);
}

async function showClientInfo(bot, client, lang, chatId) {
  const infoMsg = formatClientInfo(client, lang);

  await bot.sendMessage(chatId, infoMsg, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        {
          text: lang === "uz" ? "✏️ Ismni o'zgartirish" : "✏️ Изменить имя",
          callback_data: "change_name"
        },
        {
          text: lang === "uz" ? "↩️ Menuga qaytish" : "↩️ В меню",
          callback_data: "back_to_menu"
        }
      ]]
    }
  });
}

async function promptLanguage(bot, client, chatId) {
  await bot.sendMessage(
    chatId,
    client.platform_language === "uz"
      ? "🆎 Iltimos tilni tanlang:"
      : "🆎 Пожалуйста выберите язык:",
    {
      reply_markup: {
        keyboard: [
          [{ text: "🇺🇿 O'zbekcha" }, { text: "🇷🇺 Русский" }]
        ],
        resize_keyboard: true
      }
    }
  );

  bot.once("message", async (msg) => {
    const text = msg.text;

    if (text.includes("O'zbek")) {
      await client.update({ platform_language: "uz" });
      client.platform_language = "uz";
    } else if (text.includes("Рус")) {
      await client.update({ platform_language: "ru" });
      client.platform_language = "ru";
    }

    await sendMenu(bot, msg.chat.id, client.platform_language);
  });
}

function formatClientInfo(client, lang) {
  const regTime = new Date(client.createdAt).toLocaleString();
  // const subStatus = client.subscribed ? "✅" : "❌";
  const advLimit = client.advertisement_limit || 5;

  const username = client.tg_username
    ? "@" + client.tg_username
    : "-";

  if (lang === "uz") {
    return `🧾 <b>Mening malumotlarim</b>

👤 Ism: ${client.name || "-"}
📞 Telefon: ${client.phone || "-"}
📆 Ro'yhatdan o'tgan vaqti: ${regTime}
🌐 Til: ${client.platform_language === "uz" ? "🇺🇿 O'zbekcha" : "🇷🇺 Русский"}
📄 E'lonlar limiti: ${advLimit}
💻 Telegram username: ${username}`;
  }

  return `🧾 <b>Мои данные</b>

👤 Имя: ${client.name || "-"}
📞 Телефон: ${client.phone || "-"}
📆 Дата регистрации: ${regTime}
🌐 Язык: ${client.platform_language === "uz" ? "🇺🇿 Узбекский" : "🇷🇺 Русский"}
📄 Лимит объявлений: ${advLimit}
💻 Telegram username: ${username}`;
}
