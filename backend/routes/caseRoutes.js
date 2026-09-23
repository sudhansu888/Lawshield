const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

// Case workspace CRUD
router.get('/', caseController.getCases);
router.post('/', caseController.createCase);
router.get('/shared/lawyer', caseController.getSharedCasesForLawyer);
router.post('/shared/:shareId/notes', caseController.addLawyerNote);

router.get('/:id', caseController.getCaseById);
router.put('/:id', caseController.updateCase);
router.delete('/:id', caseController.deleteCase);

// Timeline events
router.post('/:id/events', caseController.addEvent);
router.put('/:id/events/:eventId', caseController.updateEvent);
router.delete('/:id/events/:eventId', caseController.deleteEvent);

// Evidence upload inside case
router.post('/:id/evidence', upload.single('file'), caseController.uploadEvidence);

// AI Case analysis
router.post('/:id/analyze', caseController.analyzeCase);

// Brief generation & editing
router.post('/:id/brief', caseController.generateBrief);
router.put('/:id/brief', caseController.updateBrief);

// Questions to discuss with lawyer
router.get('/:id/questions', caseController.getQuestions);
router.post('/:id/questions', caseController.addQuestion);
router.put('/:id/questions/:questionId', caseController.updateQuestionStatus);

// Sharing & Export
router.post('/:id/share', caseController.shareCaseWithLawyer);
router.get('/:id/package', caseController.getCasePackage);

module.exports = router;
