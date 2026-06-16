const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
      {
        lazyConnect: true,

        // Disable endless reconnect attempts
        retryStrategy: () => null,

        // Prevent queued commands
        maxRetriesPerRequest: 0,

        enableOfflineQueue: false,
      }
    );

    // Attach handlers BEFORE connect
    redisClient.on("error", (err) => {
      logger.warn(`Redis unavailable: ${err.message}`)
    })

    redisClient.on("close", () => {
      logger.warn("Redis connection closed")
    })

    await redisClient.connect();
    logger.info('✅ Redis connected');

    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    redisClient.on('close', () => logger.warn('Redis connection closed'));
  } catch (err) {
    // Redis is optional — app continues without it
    logger.warn(`⚠️  Redis unavailable (${err.message}) — caching disabled`);
    redisClient = null;
  }
};

const getRedis = () => redisClient;

/**
 * Cache-aside helper.
 * @param {string} key
 * @param {Function} fetchFn  - async function that fetches fresh data
 * @param {number} ttl        - seconds
 */
const cacheAside = async (key, fetchFn, ttl = 300) => {
  if (!redisClient) return fetchFn();

  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await redisClient.setex(key, ttl, JSON.stringify(data));
  return data;
};

const invalidate = async (pattern) => {
  if (!redisClient) return;
  const keys = await redisClient.keys(pattern);
  if (keys.length) await redisClient.del(...keys);
};

module.exports = { connectRedis, getRedis, cacheAside, invalidate };
