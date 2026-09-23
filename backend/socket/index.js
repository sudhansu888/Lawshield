const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[LawShield Socket] New client connected: ${socket.id}`);

    // Register user presence
    socket.on('register-user', ({ userId, userName, role }) => {
      if (!userId) return;
      socket.userId = userId;
      socket.userName = userName;
      onlineUsers.set(userId, socket.id);
      console.log(`[LawShield Socket] User online: ${userName} (${userId})`);

      // Broadcast updated online list
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    // Join room for a conversation
    socket.on('join-conversation', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`[LawShield Socket] Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave room
    socket.on('leave-conversation', ({ conversationId }) => {
      socket.leave(conversationId);
    });

    // Typing indicators
    socket.on('typing-start', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('user-typing', { conversationId, userName, isTyping: true });
    });

    socket.on('typing-stop', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('user-typing', { conversationId, userName, isTyping: false });
    });

    // Real-time message dispatch
    socket.on('send-message', (data) => {
      // data: { conversationId, message }
      if (data.conversationId) {
        socket.to(data.conversationId).emit('new-message', data.message);
      }
    });

    // ==========================================
    // WebRTC Video Consultation Signaling
    // ==========================================

    // Caller rings a user / lawyer
    socket.on('call-user', ({ userToCall, from, callerName, callerRole, callerAvatar, signalData, callType = 'video' }) => {
      const recipientSocketId = onlineUsers.get(userToCall);
      console.log(`[LawShield WebRTC] Call from ${callerName} (${from}) to ${userToCall}. Found socket: ${recipientSocketId}`);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('incoming-call', {
          signal: signalData,
          from,
          callerName,
          callerRole,
          callerAvatar,
          callType,
        });
      } else {
        // Recipient is offline or in another room
        socket.emit('call-error', { message: 'User is currently offline or unavailable for instant call' });
      }
    });

    // Callee accepts the incoming call
    socket.on('answer-call', ({ to, signal }) => {
      const callerSocketId = onlineUsers.get(to);
      console.log(`[LawShield WebRTC] Call accepted by ${socket.userId}, notifying caller: ${to}`);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', { signal });
      }
    });

    // Callee declines the call
    socket.on('reject-call', ({ to, reason = 'Call declined' }) => {
      const callerSocketId = onlineUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-rejected', { reason });
      }
    });

    // ICE candidate exchange
    socket.on('ice-candidate', ({ to, candidate }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', { candidate });
      }
    });

    // End call
    socket.on('end-call', ({ to }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended');
      }
    });

    // Media status toggle notification (cam off / mic off / screen share)
    socket.on('media-status-change', ({ to, type, status }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('peer-media-status', { type, status });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online-users', Array.from(onlineUsers.keys()));
        console.log(`[LawShield Socket] User disconnected: ${socket.userName} (${socket.userId})`);
      }
    });
  });
};
