import Admin from "../../backend/models/Admin.model.js";

const DEFAULT_WEBAPP_URL_ADMIN =
  "https://real-bot-project-web-app-zhkx-1p4ixa6an-cyber-dev1s-projects.vercel.app/phoneAdsBot/index.html";

export async function handleAdminWeb(bot, msg) {
  try {
    const tg_id = msg.from.id;

    const admin = await Admin.findOne({ where: { tg_id } });

    if (!admin) return;

    const isUz = admin.platform_language === "uz";

    const text = isUz
      ? "🌐 Web panelga kirish uchun quyidagi tugmani bosing:"
      : "🌐 Нажмите кнопку ниже, чтобы войти в веб-панель:";

    const buttonText = isUz
      ? "🚀 Web appga kirish"
      : "🚀 Открыть веб-приложение";

    await bot.sendMessage(msg.chat.id, text, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: buttonText,
              web_app: {
                url: DEFAULT_WEBAPP_URL_ADMIN,
              },
            },
          ],
        ],
      },
    });

  } catch (err) {
    console.log("ADMIN WEB APP ERROR:", err);
  }
}