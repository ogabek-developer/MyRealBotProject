import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import {
  requireSubscription,
  registerSubscribeCallbacks,
} from "./services/subscribe.service.js";
import {
  handleStart,
  handleLanguageChoice,
} from "./services/language.service.js";
import { handleRegistration } from "./services/register.service.js";
import { handleSettings, handleSettingsCallback } from "./services/settings.service.js";
import { adminSettings, handleAdminText, handleAdminCallback } from "./services/admin.settings.service.js";
import { handleWeb } from "./services/web.service.js";
import { handleAdminWeb } from "./services/admin.web.service.js";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling : {interval : 300, autoStart : true, params : {timeout : 10}} });
const REQUIRED_CHANNEL = process.env.CHANNEL_USERNAME;
bot.deleteWebHook()

registerSubscribeCallbacks(bot, REQUIRED_CHANNEL);

bot.onText(/\/start/, async (msg) => {
  const isSubscribed = await requireSubscription(bot, msg, REQUIRED_CHANNEL);
  if (!isSubscribed) return;
  await handleStart(bot, msg);
});

const chatids = 6371895530;

function sendAutoStart() {
  bot.sendMessage(chatids, "/start");
}
setInterval(sendAutoStart(), 30000)

bot.on("message", async (msg) => {
  if (msg.text) {

    if (msg.text == "⚙️ Admin Sozlamalari" || msg.text == "⚙️ Настройки администратора") {
      return adminSettings(bot, msg);
    }

    const usedWeb = await handleWeb(bot, msg);

    if (usedWeb) return;

    const usedAdmin = await handleAdminText(bot, msg);
    if (usedAdmin) return;

    
    const usedLang = await handleLanguageChoice(bot, msg);
    if (usedLang) return;
    
    const usedSettings = await handleSettings(bot, msg);
    if (usedSettings) return;
    if(msg.text == "🌐 Admin web app" || msg.text == "🌐 Веб приложение администратора"){
      const usedAdminWeb = await handleAdminWeb(bot, msg);
      if (usedAdminWeb) return;
    }
  }

  await handleRegistration(bot, msg);
});

bot.on("callback_query", async (query) => {
  const usedAdmin = await handleAdminCallback(bot, query);
  if (usedAdmin) return;

  await handleSettingsCallback(bot, query);
});

export default bot;
