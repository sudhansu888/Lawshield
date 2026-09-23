const { randomUUID: uuidv4 } = require('crypto');
const { store } = require('../services/dataStore');

// Upload evidence item
exports.uploadEvidence = (req, res) => {
  try {
    const { title, category = 'Digital Evidence', description = '' } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Evidence title is required' });
    }

    const newEvidence = {
      _id: 'ev_' + uuidv4().slice(0, 8),
      userId: req.user._id,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadDate: new Date(),
    };

    store.evidence.unshift(newEvidence);

    return res.status(201).json({
      success: true,
      message: 'Evidence securely stored in locker',
      evidence: newEvidence,
      disclaimer: 'LEGAL NOTICE: Storing files in the LawShield Evidence Locker creates a personal timestamped archive. Official admissibility in court requires chain-of-custody and Section 65B (Indian Evidence Act / BSA) certification from a forensic laboratory.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to upload evidence', error: error.message });
  }
};

// Get current user's evidence
exports.getMyEvidence = (req, res) => {
  try {
    const { category, search } = req.query;
    let items = store.evidence.filter(e => e.userId === req.user._id);

    if (category && category !== 'All') {
      items = items.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const term = search.toLowerCase();
      items = items.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.fileName.toLowerCase().includes(term)
      );
    }

    return res.json({
      success: true,
      evidence: items,
      categories: ['All', 'Digital Evidence', 'Audio Recording', 'Medical Certificate', 'Photographic', 'Chat Screenshot', 'Official Notice', 'Other'],
      disclaimer: 'NOTICE: Digital records stored here are encrypted for your privacy. Uploaded files are not automatically guaranteed legal admissibility without verified Section 65B certification.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve evidence', error: error.message });
  }
};

// Delete evidence item
exports.deleteEvidence = (req, res) => {
  try {
    const { id } = req.params;
    const index = store.evidence.findIndex(e => e._id === id && e.userId === req.user._id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Evidence item not found or unauthorized' });
    }

    store.evidence.splice(index, 1);
    return res.json({ success: true, message: 'Evidence record removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete evidence', error: error.message });
  }
};
