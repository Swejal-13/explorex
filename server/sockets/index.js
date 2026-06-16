const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io;
const onlineUsers = new Map(); // userId → socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar role');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    logger.info(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // ── Support chat ────────────────────────────────────────────────
    socket.on('chat:join', (roomId) => {
      socket.join(`chat:${roomId}`);
    });

    socket.on('chat:message', (data) => {
      io.to(`chat:${data.roomId}`).emit('chat:message', {
        from: { id: userId, name: socket.user.name, avatar: socket.user.avatar },
        text: data.text,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('chat:typing', (data) => {
      socket.to(`chat:${data.roomId}`).emit('chat:typing', {
        userId,
        name: socket.user.name,
        isTyping: data.isTyping,
      });
    });

    // ── Disconnect ──────────────────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user:offline', { userId });
      logger.info(`Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

/**
 * Emit an event to a specific user by userId
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

/**
 * Broadcast to all connected clients
 */
const broadcast = (event, data) => {
  if (io) io.emit(event, data);
};

const getOnlineUsers = () => [...onlineUsers.keys()];

module.exports = { initSocket, emitToUser, broadcast, getOnlineUsers };
