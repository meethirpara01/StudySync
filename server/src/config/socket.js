const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const handleChatSocket = require('../sockets/chat.socket');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie || '';
      const token = cookies
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('token='))
        ?.slice('token='.length);

      if (!token) {
        return next(new Error('Not authorized'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Not authorized'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Not authorized'));
    }
  });

  handleChatSocket(io);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
