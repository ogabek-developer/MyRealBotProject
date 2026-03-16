// bot/bot.js
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
import {
  handleSettings,
  handleSettingsCallback,
} from "./services/settings.service.js";
import {
  adminSettings,
  handleAdminText,
  handleAdminCallback,
} from "./services/admin.settings.service.js";
import { handleWeb } from "./services/web.service.js";
import { handleAdminWeb } from "./services/admin.web.service.js";
import { 
  startViewsTracking,
  stopViewsTracking 
} from "./services/views.polling.service.js";

dotenv.config();

const REQUIRED_CHANNEL = process.env.CHANNEL_USERNAME;
const APP_URL = process.env.APP_URL;

// ══════════════════════════════════════════════════════════════════════════════
// BOT INITIALIZATION - DOIM POLLING TRUE
// ══════════════════════════════════════════════════════════════════════════════

console.log("🤖 Bot ishga tushmoqda...");

// Bot har doim polling rejimida ishlaydi (user xabarlarini tinglash uchun)
const bot = new TelegramBot(process.env.BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

console.log("✅ Bot polling rejimida ishlamoqda");
console.log("👂 Foydalanuvchi xabarlari tinglanmoqda...");

// ══════════════════════════════════════════════════════════════════════════════
// VIEWS TRACKING SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

// Webhook bo'lsa - views Telegram eventlari orqali yangilanadi
// Webhook bo'lmasa - views manual polling orqali yangilanadi
if (APP_URL) {
  console.log("🔗 Webhook ham yoqilgan - views webhook orqali kuzatiladi");
  console.log("📊 Backup polling: har 5 daqiqada");
  startViewsTracking(bot, 300000); // 5 daqiqa
} else {
  console.log("📊 Views manual polling orqali kuzatiladi: har 2 daqiqada");
  startViewsTracking(bot, 120000); // 2 daqiqa
}

// ══════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ══════════════════════════════════════════════════════════════════════════════

process.on('SIGINT', () => {
  console.log('\n🛑 Bot to\'xtatilmoqda...');
  stopViewsTracking();
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Bot to\'xtatilmoqda...');
  stopViewsTracking();
  bot.stopPolling();
  process.exit(0);
});

// ══════════════════════════════════════════════════════════════════════════════
// SUBSCRIBE SERVICE
// ══════════════════════════════════════════════════════════════════════════════

registerSubscribeCallbacks(bot, REQUIRED_CHANNEL);

// ══════════════════════════════════════════════════════════════════════════════
// COMMANDS
// ══════════════════════════════════════════════════════════════════════════════

bot.onText(/\/start/, async (msg) => {
  const isSubscribed = await requireSubscription(bot, msg, REQUIRED_CHANNEL);
  if (!isSubscribed) return;
  await handleStart(bot, msg);
});

// ══════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════════════════════════════════════════════

bot.on("message", async (msg) => {
  if (msg.text) {
    // Admin sozlamalari
    if (
      msg.text === "⚙️ Admin Sozlamalari" ||
      msg.text === "⚙️ Настройки администратора"
    ) {
      return adminSettings(bot, msg);
    }

    // Admin web app
    if (
      msg.text === "🌐 Admin web app" ||
      msg.text === "🌐 Веб приложение администратора"
    ) {
      const usedAdminWeb = await handleAdminWeb(bot, msg);
      if (usedAdminWeb) return;
    }

    // Web handler
    const usedWeb = await handleWeb(bot, msg);
    if (usedWeb) return;

    // Admin text handler
    const usedAdmin = await handleAdminText(bot, msg);
    if (usedAdmin) return;

    // Language choice
    const usedLang = await handleLanguageChoice(bot, msg);
    if (usedLang) return;

    // Settings
    const usedSettings = await handleSettings(bot, msg);
    if (usedSettings) return;
  }

  // Registration
  await handleRegistration(bot, msg);
});

// ══════════════════════════════════════════════════════════════════════════════
// CALLBACK QUERIES
// ══════════════════════════════════════════════════════════════════════════════

bot.on("callback_query", async (query) => {
  const usedAdmin = await handleAdminCallback(bot, query);
  if (usedAdmin) return;

  await handleSettingsCallback(bot, query);
});

// ══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ══════════════════════════════════════════════════════════════════════════════

bot.on("polling_error", (error) => {
  console.error("❌ Polling xatosi:", error.message);
});

bot.on("error", (error) => {
  console.error("❌ Bot xatosi:", error.message);
});

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export default bot;