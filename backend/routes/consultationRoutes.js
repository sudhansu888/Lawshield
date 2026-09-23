const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, consultationController.bookConsultation);
router.get('/my', authenticate, consultationController.getMyConsultations);
router.put('/:id/status', authenticate, consultationController.updateStatus);

module.exports = router;
