const { store } = require('../services/dataStore');

// Get all lawyers with filtering
exports.getLawyers = (req, res) => {
  try {
    const { specialization, location, minExp, maxFee, rating, search, status } = req.query;
    let lawyers = [...store.lawyers];

    if (status) {
      lawyers = lawyers.filter(l => l.verificationStatus === status);
    } else {
      // By default in public directory show verified (and allow pending if testing)
      // We will return all for easy demo testing
    }

    if (specialization && specialization !== 'All') {
      lawyers = lawyers.filter(l => l.specialization.toLowerCase().includes(specialization.toLowerCase()));
    }

    if (location && location !== 'All') {
      lawyers = lawyers.filter(l => l.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (minExp) {
      lawyers = lawyers.filter(l => l.experience >= Number(minExp));
    }

    if (maxFee) {
      lawyers = lawyers.filter(l => l.fee <= Number(maxFee));
    }

    if (rating) {
      lawyers = lawyers.filter(l => l.rating >= Number(rating));
    }

    if (search && search.trim()) {
      const term = search.toLowerCase();
      lawyers = lawyers.filter(l =>
        l.name.toLowerCase().includes(term) ||
        l.specialization.toLowerCase().includes(term) ||
        l.bio.toLowerCase().includes(term) ||
        l.location.toLowerCase().includes(term)
      );
    }

    return res.json({
      success: true,
      count: lawyers.length,
      lawyers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch lawyers', error: error.message });
  }
};

// Get single lawyer details
exports.getLawyerById = (req, res) => {
  const lawyer = store.lawyers.find(l => l._id === req.params.id || l.userId === req.params.id);
  if (!lawyer) {
    return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
  }
  return res.json({ success: true, lawyer });
};

// Update lawyer profile
exports.updateProfile = (req, res) => {
  const lawyer = store.lawyers.find(l => l.userId === req.user._id || l.email === req.user.email);
  if (!lawyer) {
    return res.status(404).json({ success: false, message: 'Lawyer profile not found for this user' });
  }

  const { specialization, experience, fee, bio, location, availability, languages } = req.body;
  if (specialization) lawyer.specialization = specialization;
  if (experience) lawyer.experience = Number(experience);
  if (fee) lawyer.fee = Number(fee);
  if (bio !== undefined) lawyer.bio = bio;
  if (location) lawyer.location = location;
  if (availability) lawyer.availability = availability;
  if (languages && Array.isArray(languages)) lawyer.languages = languages;

  return res.json({
    success: true,
    message: 'Lawyer profile updated successfully',
    lawyer,
  });
};
