import Client from "../../backend/models/Client.model.js";
import { sendMenu } from "./language.service.js";

export async function handleRegistration(bot, msg) {
  const chatId = msg.chat.id;
  const tgId = msg.from.id;

  const client = await Client.findOne({ where: { tg_id: tgId } });
  if (!client || !client.subscribed) return;

  const lang = client.platform_language;

  if (client.step === "creating_name" && msg.text) {
    if (msg.text.length < 6) {
      return bot.sendMessage(
        chatId,
        lang === "uz"
          ? "❌ Ism kamida 6 ta harf bo'lishi kerak"
          : "❌ Имя должно быть минимум 6 символов"
      );
    }

    await client.update({ name: msg.text, step: "creating_phone" });

    return bot.sendMessage(
      chatId,
      lang === "uz"
        ? "📞 Iltimos kontaktingizni yuboring:"
        : "📞 Отправьте ваш контакт:",
      {
        reply_markup: {
          keyboard: [[{ text: lang === "uz" ? "📞 Kontakt yuborish" : "📞 Отправить контакт", request_contact: true }]],
          resize_keyboard: true,
        },
      }
    );
  }

  if (client.step === "creating_phone" && msg.contact) {
    await client.update({ phone: msg.contact.phone_number, step: "creating_location" });

    return bot.sendMessage(
      chatId,
      lang === "uz"
        ? "📍 Iltimos joylashuvingizni yuboring:"
        : "📍 Отправьте вашу локацию:",
      {
        reply_markup: {
          keyboard: [[{ text: lang === "uz" ? "📍 Joylashuv yuborish" : "📍 Отправить локацию", request_location: true }]],
          resize_keyboard: true,
        },
      }
    );
  }

  if (client.step === "creating_location" && msg.location) {
    await client.update({
      client_address: `${msg.location.latitude},${msg.location.longitude}`,
      step: "menu",
    });

    await bot.sendMessage(
      chatId,
      lang === "uz"
        ? "👋 Xush kelibsiz! ..."
        : "👋 Добро пожаловать! ..."
    );

    await sendMenu(bot, chatId, lang);
  }
}
