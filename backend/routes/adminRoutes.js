const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate, authorizeRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.get('/lawyers', adminController.getLawyerVerifications);
router.put('/lawyers/:id/status', adminController.updateLawyerVerification);
router.get('/incidents', adminController.getAllEmergencyIncidents);
router.put('/incidents/:id/resolve', adminController.resolveIncident);

module.exports = router;
