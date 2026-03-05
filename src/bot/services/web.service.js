import Client from "../../backend/models/Client.model.js";

const DEFAULT_WEBAPP_URL = "https://real-bot-project-web-8e8kjq3jl-cyber-dev1s-projects.vercel.app";

export async function handleWeb(bot, msg) {
    try {
        // Client modeldan platform_language olish
        const client = await Client.findOne({ where: { tg_id: msg.from.id } });
        const lang = client?.platform_language || "uz"; // default 'uz'

        const texts = {
            uz: { webApp: "🌐 Web App" },
            ru: { webApp: "🌐 Веб приложение" }
        };

        const t = texts[lang];

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: t.webApp, web_app: { url: DEFAULT_WEBAPP_URL } }]
                ]
            }
        };

        if(msg.text === t.webApp){
            await bot.sendMessage(
                msg.chat.id, 
                client.platform_language == "uz" ? "🔗 Web ilova ochish uchun pastdagi tugmani bosing:" : "🔗 Нажмите кнопку ниже, чтобы открыть веб-приложение:",
                keyboard
            );
        } else {
            console.log("Foydalanuvchi yozuvi:", msg.text);
        }

    } catch(err){
        console.error("handleWeb xatolik:", err);
    }
}