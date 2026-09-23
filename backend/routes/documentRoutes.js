const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

router.post('/generate', authenticate, documentController.generateDocument);
router.get('/my', authenticate, documentController.getMyDocuments);
router.get('/:id', authenticate, documentController.getDocumentById);
router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;
