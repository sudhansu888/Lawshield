const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authenticate, upload.single('file'), evidenceController.uploadEvidence);
router.get('/my', authenticate, evidenceController.getMyEvidence);
router.delete('/:id', authenticate, evidenceController.deleteEvidence);

module.exports = router;
