// utils/ads.queue.js
import { Queue } from 'bullmq';
import { isRedisAvailable } from './redis.config.js';

let adShareQueue = null;

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

if (REDIS_ENABLED) {
  const REDIS_URL = process.env.REDIS_URL;
  
  if (!REDIS_URL) {
    console.error('❌ REDIS_URL environment variable topilmadi!');
  } else {
    try {
      // Upstash uchun connection configuration
      const connection = {
        url: REDIS_URL,
      };
      
      // TLS bilan bo'lsa
      if (REDIS_URL.startsWith('rediss://')) {
        connection.tls = {
          rejectUnauthorized: false, // Upstash uchun
        };
      }

      adShareQueue = new Queue('ad-share-queue', {
        connection,
        defaultJobOptions: {
          attempts: 3, // 3 marta urinish
          backoff: {
            type: 'exponential',
            delay: 2000, // 2s, 4s, 8s
          },
          removeOnComplete: {
            age: 3600, // 1 soat
            count: 1000,
          },
          removeOnFail: {
            age: 86400, // 24 soat
          },
        },
      });

      console.log('✅ Ad Share Queue yaratildi (Upstash)');
    } catch (error) {
      console.error('❌ Queue yaratishda xatolik:', error.message);
      adShareQueue = null;
    }
  }
} else {
  console.log('ℹ️ Queue o\'chirilgan (REDIS_ENABLED=false)');
}

export const getQueue = () => adShareQueue;
export const isQueueAvailable = () => adShareQueue !== null && isRedisAvailable();

export default adShareQueue;