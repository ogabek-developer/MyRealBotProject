
// utils/ads.queue.js
import { Queue } from 'bullmq';
import redisClient from './redis.config.js';

// BullMQ uchun Redis connection konfiguratsiyasi
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

// Ads yuborish uchun queue
export const adShareQueue = new Queue('ad-share-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3, // 3 marta urinish
    backoff: {
      type: 'exponential',
      delay: 2000, // 2 soniya kutish
    },
    removeOnComplete: {
      age: 3600, // 1 soatdan keyin o'chirish
      count: 1000, // maksimal 1000 ta saqlash
    },
    removeOnFail: {
      age: 86400, // 24 soatdan keyin o'chirish
    },
  },
});

console.log('✅ Ad Share Queue yaratildi');

export default adShareQueue;