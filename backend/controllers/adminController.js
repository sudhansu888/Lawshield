const { store } = require('../services/dataStore');

// Admin Analytics & Metrics
exports.getStats = (req, res) => {
  try {
    const totalUsers = store.users.length;
    const totalLawyers = store.lawyers.length;
    const verifiedLawyers = store.lawyers.filter(l => l.verificationStatus === 'verified').length;
    const pendingLawyers = store.lawyers.filter(l => l.verificationStatus === 'pending').length;
    const totalConsultations = store.consultations.length;
    const activeConsultations = store.consultations.filter(c => c.status === 'accepted' || c.status === 'requested').length;
    const totalIncidents = store.emergencyIncidents.length;
    const activeIncidents = store.emergencyIncidents.filter(i => i.status === 'active').length;
    const totalEvidence = store.evidence.length;
    const totalDocuments = store.documents.length;

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalLawyers,
        verifiedLawyers,
        pendingLawyers,
        totalConsultations,
        activeConsultations,
        totalIncidents,
        activeIncidents,
        totalEvidence,
        totalDocuments,
      },
      recentIncidents: store.emergencyIncidents.slice(0, 5),
      recentConsultations: store.consultations.slice(0, 5),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};

// Get all users
exports.getAllUsers = (req, res) => {
  try {
    const safeUsers = store.users.map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    return res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// Update user role
exports.updateUserRole = (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'lawyer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = store.users.find(u => u._id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    return res.json({ success: true, message: `User role updated to ${role}`, user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

// Get all lawyer profiles for verification
exports.getLawyerVerifications = (req, res) => {
  try {
    return res.json({ success: true, lawyers: store.lawyers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch lawyer verifications', error: error.message });
  }
};

// Update lawyer verification status
exports.updateLawyerVerification = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['verified', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be verified, pending, or rejected' });
    }

    const lawyer = store.lawyers.find(l => l._id === id || l.userId === id);
    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
    }

    lawyer.verificationStatus = status;

    return res.json({
      success: true,
      message: `Lawyer profile status set to ${status}`,
      lawyer,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update verification', error: error.message });
  }
};

// Get all emergency incidents
exports.getAllEmergencyIncidents = (req, res) => {
  try {
    return res.json({ success: true, incidents: store.emergencyIncidents });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve incidents', error: error.message });
  }
};

// Resolve emergency incident
exports.resolveIncident = (req, res) => {
  try {
    const { id } = req.params;
    const incident = store.emergencyIncidents.find(i => i._id === id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    incident.status = 'resolved';
    return res.json({ success: true, message: 'Emergency incident marked as resolved', incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update incident', error: error.message });
  }
};
