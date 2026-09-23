const { randomUUID: uuidv4 } = require('crypto');
const { store } = require('../services/dataStore');

// Helper to calculate Case Information Completeness (0-100)
// STRICT COMPLIANCE: Measures completeness of user-provided information, NOT winning probability
const calculateCompleteness = (c, eventsCount, evidenceCount) => {
  let score = 0;
  // 1. Incident Description completeness (up to 25 pts)
  if (c.description) {
    if (c.description.length > 200) score += 25;
    else if (c.description.length > 80) score += 18;
    else score += 10;
  }
  // 2. Incident Metadata (up to 20 pts)
  if (c.title && c.title.length > 5) score += 5;
  if (c.incidentType) score += 5;
  if (c.incidentDate) score += 5;
  if (c.location) score += 5;
  // 3. Parties Involved & Notes (up to 15 pts)
  if (c.peopleInvolved) score += 10;
  if (c.additionalNotes) score += 5;
  // 4. Timeline Events (up to 20 pts)
  if (eventsCount >= 5) score += 20;
  else if (eventsCount >= 3) score += 15;
  else if (eventsCount >= 1) score += 8;
  // 5. Evidence Attached (up to 20 pts)
  if (evidenceCount >= 5) score += 20;
  else if (evidenceCount >= 3) score += 15;
  else if (evidenceCount >= 1) score += 8;

  return Math.min(100, Math.max(20, score));
};

// Helper to calculate Evidence Coverage (0-100)
const calculateEvidenceCoverage = (evidenceItems, events) => {
  if (!evidenceItems || evidenceItems.length === 0) return 25;
  const hasImage = evidenceItems.some(e => e.fileType?.includes('image'));
  const hasDoc = evidenceItems.some(e => e.fileType?.includes('pdf') || e.fileType?.includes('doc') || e.incidentCategory?.includes('Notice'));
  const hasAudio = evidenceItems.some(e => e.fileType?.includes('audio'));
  const linkedToEvents = evidenceItems.filter(e => e.relatedEventId).length;

  let coverage = 35;
  if (hasImage) coverage += 15;
  if (hasDoc) coverage += 15;
  if (hasAudio) coverage += 10;
  if (linkedToEvents >= 3) coverage += 15;
  else if (linkedToEvents >= 1) coverage += 8;
  if (evidenceItems.length >= 4) coverage += 10;

  return Math.min(100, coverage);
};

// 1. Get all cases for user
exports.getCases = (req, res) => {
  try {
    const userId = req.user._id;
    const cases = store.cases.filter(c => c.userId === userId);
    return res.json({ success: true, cases });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cases', error: err.message });
  }
};

// 2. Get single case with full relational tree
exports.getCaseById = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if user owns case OR is lawyer with active share
    const caseObj = store.cases.find(c => c._id === id);
    if (!caseObj) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const isOwner = caseObj.userId === userId;
    const share = store.caseShares.find(s => s.caseId === id && s.lawyerId === userId && s.status === 'active');
    const isSharedLawyer = Boolean(share);

    if (!isOwner && !isSharedLawyer && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this case record' });
    }

    const events = store.caseEvents.filter(e => e.caseId === id).sort((a, b) => new Date(a.date) - new Date(b.date));
    const evidence = store.caseEvidence.filter(e => e.caseId === id).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    const legalTopics = store.caseLegalTopics.filter(t => t.caseId === id);
    const evidenceGaps = store.caseEvidenceGaps.filter(g => g.caseId === id);
    const questions = store.caseQuestions.filter(q => q.caseId === id);
    const brief = store.caseBriefs.find(b => b.caseId === id) || null;
    const shares = store.caseShares.filter(s => s.caseId === id && s.status === 'active');

    return res.json({
      success: true,
      case: caseObj,
      events,
      evidence,
      legalTopics,
      evidenceGaps,
      questions,
      brief,
      shares,
      isOwner,
      isSharedLawyer,
      disclaimer: 'LawShield provides AI-assisted legal information and case organization. It does not predict court outcomes or replace advice from a qualified lawyer.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading case details', error: err.message });
  }
};

// 3. Create Case
exports.createCase = (req, res) => {
  try {
    const { title, incidentType, incidentDate, location, description, peopleInvolved, additionalNotes } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Case title and incident description are required' });
    }

    const newCaseId = 'case_' + uuidv4().slice(0, 8);
    const completeness = calculateCompleteness(
      { title, incidentType, incidentDate, location, description, peopleInvolved, additionalNotes },
      0,
      0
    );

    const newCase = {
      _id: newCaseId,
      userId: req.user._id,
      title: title.trim(),
      incidentType: incidentType || 'General Legal Dispute',
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      location: location || '',
      description: description.trim(),
      peopleInvolved: peopleInvolved || '',
      additionalNotes: additionalNotes || '',
      status: 'active',
      informationCompleteness: completeness,
      evidenceCoverage: 30,
      completenessBreakdown: {
        incidentDescription: description.length > 150 ? 85 : 55,
        timelineCompleteness: 20,
        evidenceAttached: 20,
        evidenceMetadata: 30,
        importantDates: incidentDate ? 75 : 30,
        supportingDocs: 25,
      },
      evidenceFactors: {
        relevance: 70,
        documentation: 45,
        consistency: 60,
        corroboration: 40,
        completeness: 50,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.cases.unshift(newCase);

    // Automatically map potential legal topics based on keyword matches with verified statutory database
    const textLower = `${title} ${description} ${incidentType}`.toLowerCase();
    const matchedTopics = [];

    if (textLower.includes('harass') || textLower.includes('threat') || textLower.includes('stalk') || textLower.includes('photo') || textLower.includes('cyber') || textLower.includes('online')) {
      matchedTopics.push({
        _id: 'clt_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        name: 'Cyber Stalking & Electronic Harassment',
        statute: 'Information Technology Act 2000 (Sec 66E, 67) & IPC Sec 354D',
        relevanceExplanation: 'Applies to capturing, transmitting non-consensual images, digital surveillance, or repeated unwanted messaging.',
        severity: 'HIGH',
        matchedLawId: 'law_003',
      });
      matchedTopics.push({
        _id: 'clt_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        name: 'Criminal Intimidation & Extortion',
        statute: 'IPC Section 506 & Section 384',
        relevanceExplanation: 'Threats causing reputational injury or demands of financial extraction constitute cognizable offences under penal law.',
        severity: 'HIGH',
        matchedLawId: 'law_001',
      });
    } else if (textLower.includes('work') || textLower.includes('office') || textLower.includes('boss') || textLower.includes('colleague') || textLower.includes('posh')) {
      matchedTopics.push({
        _id: 'clt_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        name: 'Workplace Sexual Harassment (POSH)',
        statute: 'Sexual Harassment of Women at Workplace Act 2013',
        relevanceExplanation: 'Mandates internal committee inquiry, interim relief, and confidential redressal for hostile working environment.',
        severity: 'HIGH',
        matchedLawId: 'law_002',
      });
    } else {
      matchedTopics.push({
        _id: 'clt_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        name: 'General Civil Rights & Dispute Redressal',
        statute: 'Statutory Grievance Redressal & Legal Notice Mandate',
        relevanceExplanation: 'Procedural steps to formalize legal claims and seek advocate counsel prior to litigation.',
        severity: 'MEDIUM',
        matchedLawId: 'law_008',
      });
    }

    matchedTopics.forEach(t => store.caseLegalTopics.push(t));

    // Seed default evidence gaps to guide user
    const defaultGaps = [
      {
        _id: 'gap_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        missingItem: 'Original timestamps and direct communication export',
        reason: 'Raw messages with exact timestamps establish incontrovertible chronological sequence.',
        suggestedPreservation: 'Export original chat, email, or message logs directly from the platform without editing.',
        status: 'missing',
      },
      {
        _id: 'gap_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        missingItem: 'Corroborating witness details or third-party confirmation',
        reason: 'Independent verification supports complainant credibility during advocate review.',
        suggestedPreservation: 'Document names and contact information of any individual aware of the incident.',
        status: 'missing',
      }
    ];
    defaultGaps.forEach(g => store.caseEvidenceGaps.push(g));

    // Seed initial recommended questions
    const initialQuestions = [
      {
        _id: 'cq_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        userId: req.user._id,
        question: 'Which specific statutory provisions are most applicable to initiate action in my jurisdiction?',
        category: 'Legal Scope',
        status: 'pending',
        lawyerAnswer: '',
        notes: '',
        createdAt: new Date(),
      },
      {
        _id: 'cq_' + uuidv4().slice(0, 8),
        caseId: newCaseId,
        userId: req.user._id,
        question: 'What additional electronic or documentary records should I preserve before filing a formal notice?',
        category: 'Evidence Preservation',
        status: 'pending',
        lawyerAnswer: '',
        notes: '',
        createdAt: new Date(),
      }
    ];
    initialQuestions.forEach(q => store.caseQuestions.push(q));

    return res.status(201).json({
      success: true,
      message: 'Case Intelligence workspace initialized successfully',
      case: newCase,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Case creation failed', error: err.message });
  }
};

// 4. Update Case
exports.updateCase = (req, res) => {
  try {
    const { id } = req.params;
    const caseObj = store.cases.find(c => c._id === id && c.userId === req.user._id);
    if (!caseObj) {
      return res.status(404).json({ success: false, message: 'Case not found or unauthorized' });
    }

    const { title, incidentType, incidentDate, location, description, peopleInvolved, additionalNotes, status } = req.body;
    if (title) caseObj.title = title.trim();
    if (incidentType) caseObj.incidentType = incidentType;
    if (incidentDate) caseObj.incidentDate = incidentDate;
    if (location !== undefined) caseObj.location = location;
    if (description) caseObj.description = description.trim();
    if (peopleInvolved !== undefined) caseObj.peopleInvolved = peopleInvolved;
    if (additionalNotes !== undefined) caseObj.additionalNotes = additionalNotes;
    if (status) caseObj.status = status;
    caseObj.updatedAt = new Date();

    const eventsCount = store.caseEvents.filter(e => e.caseId === id).length;
    const evidenceCount = store.caseEvidence.filter(e => e.caseId === id).length;
    caseObj.informationCompleteness = calculateCompleteness(caseObj, eventsCount, evidenceCount);

    return res.json({ success: true, message: 'Case updated', case: caseObj });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Update failed', error: err.message });
  }
};

// 5. Delete Case
exports.deleteCase = (req, res) => {
  try {
    const { id } = req.params;
    const index = store.cases.findIndex(c => c._id === id && c.userId === req.user._id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Case not found or unauthorized' });
    }

    store.cases.splice(index, 1);
    // Cascade delete related records
    store.caseEvents = store.caseEvents.filter(e => e.caseId !== id);
    store.caseEvidence = store.caseEvidence.filter(e => e.caseId !== id);
    store.caseLegalTopics = store.caseLegalTopics.filter(t => t.caseId !== id);
    store.caseEvidenceGaps = store.caseEvidenceGaps.filter(g => g.caseId !== id);
    store.caseBriefs = store.caseBriefs.filter(b => b.caseId !== id);
    store.caseQuestions = store.caseQuestions.filter(q => q.caseId !== id);
    store.caseShares = store.caseShares.filter(s => s.caseId !== id);

    return res.json({ success: true, message: 'Case workspace deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
  }
};

// 6. Timeline Events CRUD
exports.addEvent = (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, category = 'Incident Event', description = '', attachedEvidenceIds = [], notes = '' } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Event title and date are required' });
    }

    const newEvent = {
      _id: 'ev_timeline_' + uuidv4().slice(0, 8),
      caseId: id,
      userId: req.user._id,
      title: title.trim(),
      date,
      category,
      description: description.trim(),
      attachedEvidenceIds: Array.isArray(attachedEvidenceIds) ? attachedEvidenceIds : [],
      notes: notes.trim(),
      createdAt: new Date(),
    };

    store.caseEvents.push(newEvent);

    // Update case completeness
    const caseObj = store.cases.find(c => c._id === id);
    if (caseObj) {
      const eventsCount = store.caseEvents.filter(e => e.caseId === id).length;
      const evidenceCount = store.caseEvidence.filter(e => e.caseId === id).length;
      caseObj.informationCompleteness = calculateCompleteness(caseObj, eventsCount, evidenceCount);
    }

    return res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add timeline event', error: err.message });
  }
};

exports.updateEvent = (req, res) => {
  try {
    const { eventId } = req.params;
    const event = store.caseEvents.find(e => e._id === eventId && e.userId === req.user._id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Timeline event not found' });
    }

    const { title, date, category, description, attachedEvidenceIds, notes } = req.body;
    if (title) event.title = title.trim();
    if (date) event.date = date;
    if (category) event.category = category;
    if (description !== undefined) event.description = description.trim();
    if (attachedEvidenceIds !== undefined) event.attachedEvidenceIds = attachedEvidenceIds;
    if (notes !== undefined) event.notes = notes.trim();

    return res.json({ success: true, event });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update timeline event', error: err.message });
  }
};

exports.deleteEvent = (req, res) => {
  try {
    const { eventId } = req.params;
    const idx = store.caseEvents.findIndex(e => e._id === eventId && e.userId === req.user._id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
    }

    store.caseEvents.splice(idx, 1);
    return res.json({ success: true, message: 'Timeline event deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete event', error: err.message });
  }
};

// 7. Case Evidence Upload & AI Extraction
exports.uploadEvidence = (req, res) => {
  try {
    const { id } = req.params;
    const { title, userDescription = '', incidentCategory = 'Digital Evidence', relatedEventId = '' } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Evidence file is required' });
    }

    const caseObj = store.cases.find(c => c._id === id);
    if (!caseObj) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const currentCount = store.caseEvidence.filter(e => e.caseId === id).length;
    const evidenceCode = `E-${String(currentCount + 1).padStart(3, '0')}`;

    // Find related event title if provided
    let relatedEventTitle = '';
    if (relatedEventId) {
      const ev = store.caseEvents.find(e => e._id === relatedEventId);
      if (ev) relatedEventTitle = ev.title;
    }

    // Intelligent automated extraction simulation based on file metadata & description
    const isImg = req.file.mimetype.startsWith('image');
    const isAudio = req.file.mimetype.startsWith('audio');
    const isPdf = req.file.mimetype.includes('pdf');

    const simulatedExtractedText = isAudio
      ? `[Audio Transcript]: "Caller states notice of deadline with explicit warning regarding family disclosure."`
      : isPdf
      ? `[Document OCR Extract]: "Formal notice / official communication referencing complaint particulars and timestamped transmission."`
      : `[Image OCR Extract]: "${userDescription || 'Digital communication screenshot displaying message timestamps and user identity.'}"`;

    const newEvidence = {
      _id: 'ev_c_' + uuidv4().slice(0, 8),
      caseId: id,
      userId: req.user._id,
      evidenceCode,
      title: (title || req.file.originalname).trim(),
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadDate: new Date(),
      userDescription: userDescription.trim(),
      incidentCategory,
      relatedEventId,
      relatedEventTitle,
      status: 'Available',
      extractedInfo: {
        text: simulatedExtractedText,
        dates: [new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
        names: [req.user.name, 'Sender / Other Party'],
        organizations: [isAudio ? 'Telecom Gateway' : isPdf ? 'Regulatory / Institutional' : 'Messaging Application'],
        keywords: [incidentCategory, 'timestamp', 'digital record', 'relevance'],
        statements: ['Electronic record securely archived for advocate review.'],
        relevanceNote: 'Substantiates direct communication history and timeline consistency. Certified Section 65B affidavit recommended for court admissibility.',
      },
      isAiAnalyzed: true,
    };

    store.caseEvidence.unshift(newEvidence);

    // If relatedEventId, automatically link to event's attachedEvidenceIds
    if (relatedEventId) {
      const targetEvent = store.caseEvents.find(e => e._id === relatedEventId);
      if (targetEvent && !targetEvent.attachedEvidenceIds.includes(newEvidence._id)) {
        targetEvent.attachedEvidenceIds.push(newEvidence._id);
      }
    }

    // Recalculate case completeness and evidence coverage
    const allEvents = store.caseEvents.filter(e => e.caseId === id);
    const allEvidence = store.caseEvidence.filter(e => e.caseId === id);
    caseObj.informationCompleteness = calculateCompleteness(caseObj, allEvents.length, allEvidence.length);
    caseObj.evidenceCoverage = calculateEvidenceCoverage(allEvidence, allEvents);

    return res.status(201).json({
      success: true,
      message: `Evidence #${evidenceCode} uploaded and analyzed`,
      evidence: newEvidence,
      disclaimer: 'AI extraction is for organization and review only. Original files should be preserved.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

// 8. Trigger AI Case Analysis
exports.analyzeCase = (req, res) => {
  try {
    const { id } = req.params;
    const caseObj = store.cases.find(c => c._id === id);
    if (!caseObj) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const desc = caseObj.description;
    const textLower = `${caseObj.title} ${desc} ${caseObj.incidentType}`.toLowerCase();

    // 1. Incident Summary
    const incidentSummary = `Complainant reports an incident regarding "${caseObj.title}" on ${caseObj.incidentDate || 'recent dates'} at ${caseObj.location || 'unspecified location'}. The narrative documents: ${desc.slice(0, 280)}...`;

    // 2. Potential Legal Topics
    const topics = [];
    if (textLower.includes('cyber') || textLower.includes('harass') || textLower.includes('photo') || textLower.includes('online')) {
      topics.push({
        topic: 'Cyber Stalking & Electronic Obscenity',
        statutes: 'Information Technology Act (Sec 66E, 67, 67A) & IPC Sec 354D',
        description: 'Covers non-consensual image distribution and digital stalking.',
      });
    }
    if (textLower.includes('money') || textLower.includes('threat') || textLower.includes('extort') || textLower.includes('pay') || textLower.includes('₹')) {
      topics.push({
        topic: 'Extortion & Criminal Intimidation',
        statutes: 'IPC Section 384 & Section 506',
        description: 'Covers unlawful financial demands under threats of reputational damage.',
      });
    }
    if (textLower.includes('domestic') || textLower.includes('in-law') || textLower.includes('husband') || textLower.includes('home')) {
      topics.push({
        topic: 'Protection of Women from Domestic Violence',
        statutes: 'DV Act 2005 (Sec 12, 18, 19)',
        description: 'Provides for residence orders, protection orders, and monetary relief.',
      });
    }
    if (topics.length === 0) {
      topics.push({
        topic: 'Civil Grievance & General Legal Relief',
        statutes: 'Civil Remedies & Statutory Notice Procedures',
        description: 'Formal pre-litigation notice and dispute resolution avenues.',
      });
    }

    // 3. Important Facts
    const keyFacts = [
      `Initial dispute arose on or around: ${caseObj.incidentDate || 'documented dates'}.`,
      `Parties and entities involved: ${caseObj.peopleInvolved || 'Direct parties reported'}.`,
      `Core grievance: ${caseObj.description.slice(0, 120)}.`,
      `Location / jurisdiction indicator: ${caseObj.location || 'National jurisdiction'}.`,
    ];

    // 4. Important Dates
    const importantDates = [
      caseObj.incidentDate ? `${caseObj.incidentDate}: Date of reported incident` : 'Recent: Date of incident onset',
      `${new Date().toISOString().split('T')[0]}: Case organized in LawShield Vault`,
    ];

    // 5. People/Entities
    const peopleEntities = [
      `Complainant: ${req.user.name}`,
      `Subject/Counterparty: ${caseObj.peopleInvolved || 'Reported individuals / unknown entities'}`,
      `Jurisdictional Location: ${caseObj.location || 'Local Police / District Court'}`,
    ];

    // 6. Recommended Information to Discuss with Lawyer
    const recommendedInfo = [
      'Original, unedited digital backups with cryptographic timestamps (Section 65B certification).',
      'Proof of identity and residential jurisdiction for complaint filing.',
      'Record of any prior formal or informal complaints made to platform administrators or police.',
      'Exact names or phone numbers of any persons who witnessed the threat or were contacted.',
    ];

    return res.json({
      success: true,
      analysis: {
        incidentSummary,
        topics,
        keyFacts,
        importantDates,
        peopleEntities,
        recommendedInfo,
        disclaimer: 'LawShield provides AI-assisted legal information and case organization. It does not predict court outcomes or replace advice from a qualified lawyer.',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'AI Analysis failed', error: err.message });
  }
};

// 9. Case Brief Generation & Edits
exports.generateBrief = (req, res) => {
  try {
    const { id } = req.params;
    const caseObj = store.cases.find(c => c._id === id);
    if (!caseObj) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const events = store.caseEvents.filter(e => e.caseId === id).sort((a, b) => new Date(a.date) - new Date(b.date));
    const evidence = store.caseEvidence.filter(e => e.caseId === id);
    const gaps = store.caseEvidenceGaps.filter(g => g.caseId === id);
    const topics = store.caseLegalTopics.filter(t => t.caseId === id);
    const questions = store.caseQuestions.filter(q => q.caseId === id);

    let brief = store.caseBriefs.find(b => b.caseId === id);

    const generatedBrief = {
      _id: brief ? brief._id : 'brief_' + uuidv4().slice(0, 8),
      caseId: id,
      userId: req.user._id,
      caseTitle: caseObj.title,
      incidentSummary: `Complainant ${req.user.name} reported: ${caseObj.description}`,
      keyFacts: [
        `Incident reported date: ${caseObj.incidentDate || 'Recent'}`,
        `Location of dispute: ${caseObj.location || 'Jurisdiction to be confirmed'}`,
        `Entities / individuals noted: ${caseObj.peopleInvolved || 'None explicitly listed'}`,
        `Preserved evidence count: ${evidence.length} items catalogued.`,
      ],
      importantDates: events.map(e => `${e.date}: ${e.title}`),
      peopleEntities: [
        `Complainant: ${req.user.name}`,
        `Reported Counterparty: ${caseObj.peopleInvolved || 'Unidentified / Disputed'}`,
      ],
      potentialLegalTopics: topics.map(t => `${t.name} (${t.statute})`),
      evidenceAvailable: evidence.map(e => `${e.evidenceCode}: ${e.title} [${e.incidentCategory}]`),
      evidenceGaps: gaps.map(g => `${g.missingItem} - ${g.reason}`),
      timelineHighlights: events.slice(0, 5).map(e => `${e.date} - ${e.title}`),
      questionsForLawyer: questions.map(q => q.question),
      suggestedNextSteps: [
        '1. Schedule consultation with verified legal counsel to review case brief.',
        '2. Obtain Section 65B certification for electronic evidence before formal presentation.',
        '3. Determine whether to issue formal legal notice or register Zero FIR.',
      ],
      userEditedContent: brief?.userEditedContent || '',
      generatedAt: new Date(),
      lastEditedAt: new Date(),
    };

    if (brief) {
      Object.assign(brief, generatedBrief);
    } else {
      store.caseBriefs.push(generatedBrief);
    }

    return res.json({
      success: true,
      message: 'AI Case Brief generated successfully',
      brief: generatedBrief,
      disclaimer: 'LawShield provides AI-assisted legal information and case organization. It does not predict court outcomes or replace advice from a qualified lawyer.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate brief', error: err.message });
  }
};

exports.updateBrief = (req, res) => {
  try {
    const { id } = req.params;
    const { userEditedContent } = req.body;
    const brief = store.caseBriefs.find(b => b.caseId === id && b.userId === req.user._id);
    if (!brief) {
      return res.status(404).json({ success: false, message: 'Case brief not found' });
    }

    brief.userEditedContent = userEditedContent;
    brief.lastEditedAt = new Date();
    return res.json({ success: true, message: 'Case brief saved', brief });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save brief', error: err.message });
  }
};

// 10. Questions for Lawyer
exports.getQuestions = (req, res) => {
  try {
    const { id } = req.params;
    const questions = store.caseQuestions.filter(q => q.caseId === id);
    return res.json({ success: true, questions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch questions', error: err.message });
  }
};

exports.addQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const { question, category = 'General' } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question text is required' });
    }

    const newQ = {
      _id: 'cq_' + uuidv4().slice(0, 8),
      caseId: id,
      userId: req.user._id,
      question: question.trim(),
      category,
      status: 'pending',
      lawyerAnswer: '',
      notes: '',
      createdAt: new Date(),
    };

    store.caseQuestions.push(newQ);
    return res.status(201).json({ success: true, question: newQ });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add question', error: err.message });
  }
};

exports.updateQuestionStatus = (req, res) => {
  try {
    const { questionId } = req.params;
    const { status, lawyerAnswer, notes } = req.body;

    const q = store.caseQuestions.find(item => item._id === questionId);
    if (!q) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (status && ['pending', 'discussed', 'resolved'].includes(status)) {
      q.status = status;
    }
    if (lawyerAnswer !== undefined) q.lawyerAnswer = lawyerAnswer;
    if (notes !== undefined) q.notes = notes;

    return res.json({ success: true, question: q });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update question', error: err.message });
  }
};

// 11. Share Case with Lawyer
exports.shareCaseWithLawyer = (req, res) => {
  try {
    const { id } = req.params;
    const { lawyerId, sharedSections = { summary: true, timeline: true, evidence: true, questions: true, privateNotes: false } } = req.body;

    if (!lawyerId) {
      return res.status(400).json({ success: false, message: 'Target lawyer is required' });
    }

    const caseObj = store.cases.find(c => c._id === id && c.userId === req.user._id);
    if (!caseObj) {
      return res.status(404).json({ success: false, message: 'Case not found or unauthorized' });
    }

    const lawyer = store.lawyers.find(l => l.userId === lawyerId || l._id === lawyerId);
    const lawyerName = lawyer ? lawyer.name : 'Advocate Counsel';

    // Check if existing active share exists
    let share = store.caseShares.find(s => s.caseId === id && (s.lawyerId === lawyerId || s.lawyerId === lawyer?.userId));

    if (share) {
      share.sharedSections = sharedSections;
      share.status = 'active';
      share.sharedAt = new Date();
    } else {
      share = {
        _id: 'c_share_' + uuidv4().slice(0, 8),
        caseId: id,
        userId: req.user._id,
        userName: req.user.name,
        lawyerId: lawyer?.userId || lawyerId,
        lawyerName,
        sharedSections,
        lawyerNotes: [],
        sharedAt: new Date(),
        status: 'active',
      };
      store.caseShares.unshift(share);
    }

    // Add notification for lawyer
    store.notifications.unshift({
      _id: 'notif_' + uuidv4().slice(0, 8),
      userId: share.lawyerId,
      title: 'New Case Brief Shared',
      message: `${req.user.name} shared a Case Intelligence dossier for "${caseObj.title}".`,
      type: 'case_share',
      read: false,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      message: `Case Intelligence dossier shared with ${lawyerName}`,
      share,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to share case', error: err.message });
  }
};

// 12. Lawyer View: Get all shared cases
exports.getSharedCasesForLawyer = (req, res) => {
  try {
    const lawyerId = req.user._id;
    const shares = store.caseShares.filter(s => s.lawyerId === lawyerId && s.status === 'active');

    const result = shares.map(share => {
      const c = store.cases.find(item => item._id === share.caseId);
      if (!c) return null;
      const evidenceCount = store.caseEvidence.filter(e => e.caseId === c._id).length;
      const eventsCount = store.caseEvents.filter(e => e.caseId === c._id).length;
      const questionsCount = store.caseQuestions.filter(q => q.caseId === c._id).length;
      return {
        share,
        case: c,
        evidenceCount,
        eventsCount,
        questionsCount,
      };
    }).filter(Boolean);

    return res.json({ success: true, sharedCases: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch shared cases', error: err.message });
  }
};

// 13. Lawyer adds consultation note
exports.addLawyerNote = (req, res) => {
  try {
    const { shareId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const share = store.caseShares.find(s => s._id === shareId && s.lawyerId === req.user._id);
    if (!share) {
      return res.status(404).json({ success: false, message: 'Shared case not found or unauthorized' });
    }

    const note = {
      text: text.trim(),
      createdAt: new Date(),
    };

    share.lawyerNotes.unshift(note);
    return res.json({ success: true, message: 'Consultation note recorded', notes: share.lawyerNotes });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add note', error: err.message });
  }
};

// 14. Full Case Package Dataset for PDF compilation
exports.getCasePackage = (req, res) => {
  try {
    const { id } = req.params;
    const caseObj = store.cases.find(c => c._id === id);
    if (!caseObj) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const events = store.caseEvents.filter(e => e.caseId === id).sort((a, b) => new Date(a.date) - new Date(b.date));
    const evidence = store.caseEvidence.filter(e => e.caseId === id);
    const legalTopics = store.caseLegalTopics.filter(t => t.caseId === id);
    const gaps = store.caseEvidenceGaps.filter(g => g.caseId === id);
    const questions = store.caseQuestions.filter(q => q.caseId === id);
    const brief = store.caseBriefs.find(b => b.caseId === id) || null;

    const packageData = {
      dossierId: `LAWSHIELD-DOSSIER-${caseObj._id.toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      clientName: req.user.name,
      clientEmail: req.user.email,
      caseTitle: caseObj.title,
      incidentType: caseObj.incidentType,
      incidentDate: caseObj.incidentDate,
      location: caseObj.location,
      description: caseObj.description,
      peopleInvolved: caseObj.peopleInvolved,
      completenessScore: caseObj.informationCompleteness,
      evidenceCoverageScore: caseObj.evidenceCoverage,
      timeline: events,
      evidenceIndex: evidence.map(e => ({
        code: e.evidenceCode,
        title: e.title,
        fileName: e.fileName,
        type: e.fileType,
        category: e.incidentCategory,
        uploadDate: e.uploadDate,
        description: e.userDescription,
        extractedSummary: e.extractedInfo?.text || '',
        relevanceNote: e.extractedInfo?.relevanceNote || '',
      })),
      evidenceGaps: gaps,
      legalTopics,
      questionsForLawyer: questions,
      caseBrief: brief?.userEditedContent || brief?.incidentSummary || caseObj.description,
      disclaimer: 'LawShield provides AI-assisted legal information and case organization. It does not predict court outcomes or replace advice from a qualified lawyer.'
    };

    return res.json({ success: true, packageData });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to compile package', error: err.message });
  }
};
