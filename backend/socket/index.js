const http = require('http');
const socketIO = require('socket.io');

let io;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user's personal room
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join note room for real-time collaboration
    socket.on('join-note', ({ noteId, userId, username }) => {
      socket.join(`note:${noteId}`);
      
      // Notify others in the note room
      socket.to(`note:${noteId}`).emit('user-joined', {
        userId,
        username,
        socketId: socket.id
      });
      
      console.log(`User ${username} joined note ${noteId}`);
    });

    // Leave note room
    socket.on('leave-note', ({ noteId, userId, username }) => {
      socket.leave(`note:${noteId}`);
      
      // Notify others
      socket.to(`note:${noteId}`).emit('user-left', {
        userId,
        username
      });
      
      console.log(`User ${username} left note ${noteId}`);
    });

    // Broadcast note updates
    socket.on('note-update', ({ noteId, userId, updates }) => {
      socket.to(`note:${noteId}`).emit('note-updated', {
        noteId,
        userId,
        updates,
        timestamp: new Date()
      });
    });

    // Cursor position updates for collaboration
    socket.on('cursor-move', ({ noteId, userId, username, position }) => {
      socket.to(`note:${noteId}`).emit('cursor-update', {
        userId,
        username,
        position
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Emit to specific user
function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

// Emit to note room
function emitToNote(noteId, event, data) {
  if (io) {
    io.to(`note:${noteId}`).emit(event, data);
  }
}

module.exports = { initializeSocket, getIO, emitToUser, emitToNote };
