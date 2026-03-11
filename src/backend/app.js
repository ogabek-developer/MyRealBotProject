import path from "node:path"
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import { mainRouter } from './routers/main.routes.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["https://real-bot-project-web-app-zhkx.vercel.app", "http://localhost:5000", "https://unstraightened-drossiest-tomas.ngrok-free.dev", "https://real-bot-project-web-app.vercel.app"],
  credentials : true
}));

app.use(express.static(path.join(process.cwd(), "src/web"))); 
app.use('/api',mainRouter)
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "Rasm hajmi oshib ketdi !" });
  }

  if (err.message.includes("Faqat rasm")) {
    return res.status(400).json({ message: err.message });
  }

  next(err);
});
// Mock Route 

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

export default app;
