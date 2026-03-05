import AdminModel from "../../backend/models/Admin.model.js";
import { handleStart } from "./language.service.js";

const adminState = new Map();

function formatAdminInfo(admin, lang) {
  if (lang === "ru") {
    return `
👤 <b>Информация администратора</b>

🧾 Имя: ${admin.name}
📞 Телефон: ${admin.phone}
🔗 Username: @${admin.tg_username}
🌐 Язык: ${admin.platform_language}
🕒 Регистрация: ${admin.registered_time}
`;
  }

  return `
👤 <b>Admin ma'lumotlari</b>

🧾 Ism: ${admin.name}
📞 Telefon: ${admin.phone}
🔗 Username: @${admin.tg_username}
🌐 Til: ${admin.platform_language}
🕒 Ro'yxatdan o'tgan: ${admin.registered_time}
`;
}

export async function adminSettings(bot, msg) {
  const tgId = msg.from.id;
  const admin = await AdminModel.findOne({ where: { tg_id: tgId } });

  if (!admin) {
    return bot.sendMessage(msg.chat.id, "❌ Siz admin emassiz.");
  }

  const t = admin.platform_language === "ru"
    ? {
        title: "🛠 Настройки администратора :",
        info: "👤 Информация администратора",
        changeLang: "🌐 Изменить язык",
        back: "🏠 Главное меню",
      }
    : {
        title: "🛠 Admin Sozlamalari :",
        info: "👤 Admin ma'lumotlari",
        changeLang: "🌐 Tilni yangilash",
        back: "🏠 Bosh menyu",
      };

  await bot.sendMessage(msg.chat.id, t.title, {
    reply_markup: {
      keyboard: [
        [{ text: t.info }],
        [{ text: t.changeLang }],
        [{ text: t.back }],
      ],
      resize_keyboard: true,
    },
  });

  return true;
}

export async function handleAdminText(bot, msg) {
  const tgId = msg.from.id;
  const admin = await AdminModel.findOne({ where: { tg_id: tgId } });
  if (!admin) return false;

  const lang = admin.platform_language;

  const t = lang === "ru"
    ? {
        info: "👤 Информация администратора",
        changeLang: "🌐 Изменить язык",
        back: "🏠 Главное меню",
        selectLang: "Выберите язык :",
        warnBtn: "❗ Пожалуйста, выберите через кнопку",
        askName: "✍️ Введите полное имя",
        warnName: "❗ Имя должно быть не менее 6 символов",
      }
    : {
        info: "👤 Admin ma'lumotlari",
        changeLang: "🌐 Tilni yangilash",
        back: "🏠 Bosh menyu",
        selectLang: "Tilni tanlang :",
        warnBtn: "❗ Iltimos tugma orqali tanlang",
        askName: "✍️ To‘liq ismni kiriting",
        warnName: "❗ Ism kamida 6 ta harfdan iborat bo‘lishi kerak",
      };

  // Info tugmasi
  if (msg.text === t.info) {
    const text = formatAdminInfo(admin, lang);
    await bot.sendMessage(msg.chat.id, text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          {
            text: lang === "ru" ? "✏️ Изменить имя" : "✏️ Ismni yangilash",
            callback_data: "change_name",
          }
        ]],
      },
    });
    return true;
  }

  // Tilni o'zgartirish
  if (msg.text === t.changeLang) {
    adminState.set(tgId, "waiting_lang");
    await bot.sendMessage(msg.chat.id, t.selectLang, {
      reply_markup: {
        keyboard: [[
          { text: "🇺🇿 Uz" },
          { text: "🇷🇺 Ru" }
        ]],
        resize_keyboard: true,
      },
    });
    return true;
  }

  // Til tanlash rejimi
  if (adminState.get(tgId) === "waiting_lang") {
    if (msg.text !== "🇺🇿 Uz" && msg.text !== "🇷🇺 Ru") {
      await bot.sendMessage(msg.chat.id, t.warnBtn);
      return true;
    }

    const newLang = msg.text.includes("Uz") ? "uz" : "ru";
    await AdminModel.update({ platform_language: newLang }, { where: { tg_id: tgId } });
    adminState.delete(tgId);
    await adminSettings(bot, msg);
    return true;
  }

  // Ism kiritish rejimi
  if (adminState.get(tgId) === "waiting_name") {
    if (msg.text.length < 6) {
      await bot.sendMessage(msg.chat.id, t.warnName);
      return true;
    }

    await AdminModel.update({ name: msg.text }, { where: { tg_id: tgId } });
    adminState.delete(tgId);

    const updatedAdmin = await AdminModel.findOne({ where: { tg_id: tgId } });
    const text = formatAdminInfo(updatedAdmin, lang);
    await bot.sendMessage(msg.chat.id, text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          {
            text: lang === "ru" ? "✏️ Изменить имя" : "✏️ Ismni yangilash",
            callback_data: "change_name",
          }
        ]],
      },
    });
    return true;
  }

  // Menyu
  if (msg.text === t.back) {
    adminState.delete(tgId);
    await handleStart(bot, msg);
    return true;
  }

  return false;
}

export async function handleAdminCallback(bot, query) {
  const tgId = query.from.id;
  const admin = await AdminModel.findOne({ where: { tg_id: tgId } });
  if (!admin) return false;

  const lang = admin.platform_language;

  if (query.data === "change_name") {
    adminState.set(tgId, "waiting_name");
    await bot.sendMessage(
      query.message.chat.id,
      lang === "ru" ? "✍️ Введите полное имя" : "✍️ To‘liq ismni kiriting"
    );
    await bot.answerCallbackQuery(query.id);
    return true;
  }

  if (query.data === "back_menu") {
    adminState.delete(tgId);
    await handleStart(bot, query.message);
    await bot.answerCallbackQuery(query.id);
    return true;
  }

  return false;
}

