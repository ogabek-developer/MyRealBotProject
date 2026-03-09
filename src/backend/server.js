import app from './app.js';
import sequelize from './config/db.js';
import dotenv from "dotenv"
import bot from '../bot/bot.js';

dotenv.config() ;

(async () => {
  try {

    await sequelize.authenticate();
    console.log('Database connected!');

    await sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });

    console.log('Bot is running...');

  } catch (err) {
    console.error('Error starting server:', err.message);
  }
})();