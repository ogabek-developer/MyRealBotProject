// backend/app.js
import path from "node:path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { mainRouter } from "./routers/main.routes.js";
import "./models/associations.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5000",
      process.env.APP_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.static(path.join(process.cwd(), "src/web")));
app.use("/api", mainRouter);

// ── TELEGRAM WEBHOOK ENDPOINT ─────────────────────────────────────────────────
// Webhook rejimida Telegram shu endpoint ga POST yuboradi.
// Bot shu yerda xabarlarni qabul qiladi va channel_post eventlari ham keladi.
// MUHIM: Bu route bot import qilingandan KEYIN qo'shilishi kerak,
// shuning uchun server.js da qo'shiladi (pastga qarang).
// app.js da faqat placeholder — asosiy ulanish server.js da.

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Rasm hajmi oshib ketdi !" });
  }
  if (err.message.includes("Faqat rasm")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

export default app;