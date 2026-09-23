const { randomUUID: uuidv4 } = require('crypto');
const { store } = require('../services/dataStore');

// Book consultation
exports.bookConsultation = (req, res) => {
  try {
    const { lawyerId, date, timeSlot, type = 'video', notes = '' } = req.body;

    if (!lawyerId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Lawyer, date, and time slot are required' });
    }

    const lawyer = store.lawyers.find(l => l.userId === lawyerId || l._id === lawyerId);
    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Selected lawyer not found' });
    }

    const newConsultation = {
      _id: 'cons_' + uuidv4().slice(0, 8),
      userId: req.user._id,
      userName: req.user.name,
      lawyerId: lawyer.userId || lawyer._id,
      lawyerName: lawyer.name,
      specialization: lawyer.specialization,
      date,
      timeSlot,
      type,
      status: 'accepted', // Auto-accept in demo mode for instant testing!
      fee: lawyer.fee,
      notes,
      createdAt: new Date(),
    };

    store.consultations.unshift(newConsultation);

    // Also ensure conversation exists
    let conv = store.conversations.find(c =>
      c.participants.includes(req.user._id) && c.participants.includes(newConsultation.lawyerId)
    );
    if (!conv) {
      conv = {
        _id: 'conv_' + uuidv4().slice(0, 8),
        participants: [req.user._id, newConsultation.lawyerId],
        participantNames: [req.user.name, lawyer.name],
        lastMessage: `Consultation booked for ${date} at ${timeSlot}`,
        updatedAt: new Date(),
      };
      store.conversations.unshift(conv);
    }

    // Add notification
    store.notifications.unshift({
      _id: 'notif_' + uuidv4().slice(0, 8),
      userId: req.user._id,
      title: 'Consultation Scheduled',
      message: `Your ${type} consultation with ${lawyer.name} is confirmed for ${date} (${timeSlot}).`,
      type: 'consultation',
      read: false,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      consultation: newConsultation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to book consultation', error: error.message });
  }
};

// Get consultations for user or lawyer
exports.getMyConsultations = (req, res) => {
  try {
    const userId = req.user._id;
    const consultations = store.consultations.filter(c =>
      c.userId === userId || c.lawyerId === userId
    );

    return res.json({
      success: true,
      consultations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get consultations', error: error.message });
  }
};

// Update consultation status (accept, reject, completed)
exports.updateStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['requested', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const consultation = store.consultations.find(c => c._id === id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    consultation.status = status;

    return res.json({
      success: true,
      message: `Consultation marked as ${status}`,
      consultation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Status update failed', error: error.message });
  }
};
