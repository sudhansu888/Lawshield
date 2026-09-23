const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', lawyerController.getLawyers);
router.get('/:id', lawyerController.getLawyerById);
router.put('/profile', authenticate, authorizeRoles('lawyer', 'admin'), lawyerController.updateProfile);

module.exports = router;
