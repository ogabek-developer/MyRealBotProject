// backend/server.js
import app from "./app.js";
import sequelize from "./config/db.js";
import dotenv from "dotenv";
import bot from "../bot/bot.js";
// import { updateViewsFromPost } from "../bot/services/views.polling.service.js";

dotenv.config();

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced!");

    const PORT = process.env.PORT || 5000;
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const APP_URL = process.env.APP_URL;

    // ══════════════════════════════════════════════════════════════════════════
    // WEBHOOK ENDPOINT (ixtiyoriy)
    // ══════════════════════════════════════════════════════════════════════════
    // 
    // Agar APP_URL .env da bo'lsa, webhook endpoint yaratiladi.
    // Bu orqali channel_post va edited_channel_post eventlari keladi va
    // views real-time yangilanadi.
    // 
    // Agar APP_URL bo'lmasa, views faqat polling orqali yangilanadi.
    // 
    // ══════════════════════════════════════════════════════════════════════════

    if (APP_URL && BOT_TOKEN) {
      console.log("\n🔗 Webhook rejimi faol");
      
      // Webhook endpoint
      app.post(`/bot${BOT_TOKEN}`, (req, res) => {
        try {
          const update = req.body;
          
          // Channel post eventlarini alohida qayta ishlash
          if (update.channel_post || update.edited_channel_post) {
            const post = update.channel_post || update.edited_channel_post;
            console.log(`📬 Webhook event: ${update.channel_post ? 'channel_post' : 'edited_channel_post'}`);
            updateViewsFromPost(post);
          }
          
          // Botga boshqa updatelarni yuborish
          bot.processUpdate(update);
          
          res.sendStatus(200);
        } catch (error) {
          console.error("❌ Webhook qayta ishlashda xato:", error.message);
          res.sendStatus(500);
        }
      });
      
      console.log(`✅ Webhook endpoint: POST /bot${BOT_TOKEN}`);
      console.log(`📡 Webhook URL: ${APP_URL}/bot${BOT_TOKEN}`);
      console.log("ℹ️  Telegram webhook ini .env dagi APP_URL ga sozlang");
    } else {
      console.log("\n📊 Webhook yo'q - views faqat polling orqali yangilanadi");
      console.log("ℹ️  Webhook yoqish uchun .env ga APP_URL qo'shing");
    }

    // Server ni ishga tushirish
    app.listen(PORT, () => {
      console.log(`\n🚀 Server ishlamoqda: http://localhost:${PORT}`);
      
      if (APP_URL) {
        console.log(`🌐 Public URL: ${APP_URL}`);
      }
      
      console.log("\n" + "=".repeat(50));
      console.log("Bot tayyor! ✅");
      console.log("=".repeat(50) + "\n");
    });

  } catch (err) {
    console.error("❌ Server xatosi:", err.message);
    process.exit(1);
  }
})();