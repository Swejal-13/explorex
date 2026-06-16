require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { initSocket } = require('./sockets');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialise Socket.io
initSocket(server);

// Boot sequence
(async () => {
  await connectDB();
  await connectRedis();

  server.listen(PORT, () => {
    logger.info(`🚀 ExploreX server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
})();

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

process.on("unhandledRejection", (err) => {
 console.error("\n===== UNHANDLED REJECTION =====")
 console.error(err)
 console.error(err?.stack)
})
