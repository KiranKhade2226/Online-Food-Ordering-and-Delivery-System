const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { isAllowedOrigin } = require('./origins');

let io;

const initializeSocket = (server, app) => {
  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      socket.user = decoded;
      return next();
    } catch (error) {
      return next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-order-room', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('join-user-room', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  app.set('io', io);
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }

  return io;
};

module.exports = { initializeSocket, getIO };
