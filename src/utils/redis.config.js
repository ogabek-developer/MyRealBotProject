
// utils/redis.config.js
import { createClient } from 'redis';
import { config } from 'dotenv';
config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: Maksimal ulanish urinishlari oshdi');
        return new Error('Redis ulanish xatosi');
      }
      return retries * 500;
    }
  }
});

redisClient.on('connect', () => console.log('✅ Redis: Ulanish boshlandi...'));
redisClient.on('ready', () => console.log('✅ Redis: Tayyor!'));
redisClient.on('error', (err) => console.error('❌ Redis xato:', err));
redisClient.on('reconnecting', () => console.log('🔄 Redis: Qayta ulanmoqda...'));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis muvaffaqiyatli ulandi');
  } catch (error) {
    console.error('❌ Redis ulanishda xatolik:', error);
    process.exit(1);
  }
};

export default redisClient;