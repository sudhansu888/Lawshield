const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/conversations', authenticate, chatController.getConversations);
router.post('/conversations', authenticate, chatController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', authenticate, chatController.getMessages);
router.post('/messages', authenticate, chatController.sendMessage);
router.post('/upload', authenticate, upload.single('file'), chatController.uploadChatFile);
router.delete('/conversations/:conversationId', authenticate, chatController.deleteConversation);

module.exports = router;
