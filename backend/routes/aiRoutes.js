const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze', aiController.analyzeLegalProblem);

module.exports = router;
