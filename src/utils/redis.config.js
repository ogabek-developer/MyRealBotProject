// utils/redis.config.js
import { createClient } from 'redis';
import { config } from 'dotenv';
config();

let redisClient = null;
let redisAvailable = false;

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

if (REDIS_ENABLED) {
  const REDIS_URL = process.env.REDIS_URL;
  
  if (!REDIS_URL) {
    console.error('❌ REDIS_URL environment variable topilmadi!');
  } else {
    console.log(`🔗 Redis URL: ${REDIS_URL.replace(/:[^:@]+@/, ':****@')}`); // Password yashirish
    
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        tls: REDIS_URL.startsWith('rediss://'), // TLS auto-detect
        rejectUnauthorized: false, // Upstash uchun
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️ Redis: Maksimal ulanish urinishlari tugadi');
            redisAvailable = false;
            return false;
          }
          console.log(`🔄 Redis: Qayta ulanish (${retries}/3)...`);
          return retries * 1000;
        },
      }
    });

    redisClient.on('connect', () => {
      console.log('🔌 Redis: Ulanish boshlandi...');
    });
    
    redisClient.on('ready', () => {
      console.log('✅ Redis: Tayyor! (Upstash)');
      redisAvailable = true;
    });
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis xato:', err.message);
      redisAvailable = false;
    });
    
    redisClient.on('end', () => {
      console.warn('⚠️ Redis: Ulanish uzildi');
      redisAvailable = false;
    });
    
    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Qayta ulanmoqda...');
    });
  }
}

export const connectRedis = async () => {
  if (!REDIS_ENABLED) {
    console.log('ℹ️ Redis o\'chirilgan (REDIS_ENABLED=false)');
    return false;
  }

  if (!redisClient) {
    console.warn('⚠️ Redis client yaratilmagan - REDIS_URL tekshiring');
    return false;
  }

  try {
    console.log('🔗 Redis ga ulanmoqda...');
    await redisClient.connect();
    redisAvailable = true;
    console.log('✅ Redis muvaffaqiyatli ulandi (Upstash)');
    return true;
  } catch (error) {
    console.error('❌ Redis ulanishda xatolik:', error.message);
    console.log('ℹ️ Server Redis bo\'lmagan holda davom etadi (Direct mode)');
    redisAvailable = false;
    return false;
  }
};

export const isRedisAvailable = () => redisAvailable;

export default redisClient;