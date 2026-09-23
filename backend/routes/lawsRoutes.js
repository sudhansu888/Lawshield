const express = require('express');
const router = express.Router();
const lawsController = require('../controllers/lawsController');

router.get('/', lawsController.getLaws);
router.get('/categories', lawsController.getCategories);
router.get('/:id', lawsController.getLawById);

module.exports = router;
