const { store } = require('../services/dataStore');

// Get laws with search and category filters
exports.getLaws = (req, res) => {
  try {
    const { q, category, severity } = req.query;
    let results = [...store.laws];

    if (category && category !== 'All') {
      results = results.filter(l => l.category.toLowerCase() === category.toLowerCase());
    }

    if (severity && severity !== 'All') {
      results = results.filter(l => l.severity.toUpperCase() === severity.toUpperCase());
    }

    if (q && q.trim()) {
      const term = q.toLowerCase();
      results = results.filter(l =>
        l.name.toLowerCase().includes(term) ||
        l.section.toLowerCase().includes(term) ||
        l.explanation.toLowerCase().includes(term) ||
        l.category.toLowerCase().includes(term) ||
        l.rights.some(r => r.toLowerCase().includes(term))
      );
    }

    return res.json({
      success: true,
      count: results.length,
      laws: results,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve laws', error: error.message });
  }
};

// Get single law by ID
exports.getLawById = (req, res) => {
  const law = store.laws.find(l => l._id === req.params.id);
  if (!law) {
    return res.status(404).json({ success: false, message: 'Law record not found' });
  }
  return res.json({ success: true, law });
};

// Get distinct categories
exports.getCategories = (req, res) => {
  const categories = Array.from(new Set(store.laws.map(l => l.category)));
  return res.json({
    success: true,
    categories: ['All', ...categories],
  });
};
