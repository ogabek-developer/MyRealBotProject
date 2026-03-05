import app from './app.js';
import sequelize from './config/db.js';
import bot from '../bot/bot.js';


(async () => {
  try {
    
    await sequelize.authenticate();
    console.log('Database connected!');
    
    await sequelize.sync({ alter: true });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });

    await bot.launch();   // 🔥 SHU YERDA
    console.log('Bot is running...');

  } catch (err) {
    console.error('Error starting server:', err.message);
  }
})();