const { randomUUID: uuidv4 } = require('crypto');
const { store } = require('../services/dataStore');

// Get conversations for user
exports.getConversations = (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = store.conversations.filter(c => c.participants.includes(userId));

    // Enhance with other participant details
    const enhanced = conversations.map(c => {
      const otherId = c.participants.find(p => p !== userId) || userId;
      const otherUser = store.users.find(u => u._id === otherId) || { name: 'User', role: 'user' };
      const lawyerInfo = store.lawyers.find(l => l.userId === otherId);
      return {
        ...c,
        recipient: {
          _id: otherId,
          name: otherUser.name,
          role: otherUser.role,
          avatar: lawyerInfo ? lawyerInfo.avatar : '',
          specialization: lawyerInfo ? lawyerInfo.specialization : '',
        }
      };
    });

    return res.json({ success: true, conversations: enhanced });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve conversations', error: error.message });
  }
};

// Get or create conversation with a user/lawyer
exports.getOrCreateConversation = (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID required' });
    }

    let conv = store.conversations.find(c =>
      c.participants.includes(userId) && c.participants.includes(recipientId)
    );

    if (!conv) {
      const recipient = store.users.find(u => u._id === recipientId);
      conv = {
        _id: 'conv_' + uuidv4().slice(0, 8),
        participants: [userId, recipientId],
        participantNames: [req.user.name, recipient ? recipient.name : 'Recipient'],
        lastMessage: 'Conversation started',
        updatedAt: new Date(),
      };
      store.conversations.unshift(conv);
    }

    return res.json({ success: true, conversation: conv });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to start conversation', error: error.message });
  }
};

// Get messages in a conversation
exports.getMessages = (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = store.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get messages', error: error.message });
  }
};

// Send message
exports.sendMessage = (req, res) => {
  try {
    const { conversationId, text = '', fileUrl = '', fileName = '', fileType = '', isAudio = false } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID required' });
    }

    const conversation = store.conversations.find(c => c._id === conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const newMsg = {
      _id: 'msg_' + uuidv4().slice(0, 8),
      conversationId,
      senderId: req.user._id,
      senderName: req.user.name,
      text: text.trim(),
      fileUrl,
      fileName,
      fileType,
      isAudio: Boolean(isAudio),
      createdAt: new Date(),
    };

    store.messages.push(newMsg);
    conversation.lastMessage = text.trim() || (isAudio ? '🎙️ Voice Message' : '📎 Attachment');
    conversation.updatedAt = new Date();

    return res.status(201).json({ success: true, message: newMsg });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Upload attachment for chat
exports.uploadChatFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
  });
};

// Delete conversation
exports.deleteConversation = (req, res) => {
  const { conversationId } = req.params;
  const idx = store.conversations.findIndex(c => c._id === conversationId);
  if (idx !== -1) {
    store.conversations.splice(idx, 1);
    store.messages = store.messages.filter(m => m.conversationId !== conversationId);
  }
  return res.json({ success: true, message: 'Conversation deleted' });
};
