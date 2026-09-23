const { randomUUID: uuidv4 } = require('crypto');
const { store } = require('../services/dataStore');

// Legal Document Compilation Templates
const compileDocument = (docType, formData, user) => {
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const complainant = formData.complainantName || user.name || 'Complainant';
  const phone = formData.phone || user.phone || 'N/A';
  const address = formData.address || 'Resident of India';
  const accused = formData.accusedName || 'Person(s) Unknown / Named in Evidence';
  const incidentDate = formData.incidentDate || dateStr;
  const incidentPlace = formData.incidentPlace || 'Jurisdiction of Police Station';
  const incidentDetails = formData.incidentDetails || 'Details as stated in the evidence submitted.';
  const reliefs = formData.reliefs || 'Immediate legal intervention, investigation, and statutory protection.';

  switch (docType) {
    case 'Police Complaint (Zero FIR)':
    case 'Police Complaint (FIR)':
      return `TO,
THE STATION HOUSE OFFICER (SHO) / OFFICER-IN-CHARGE,
POLICE STATION: ${formData.policeStation || '[Local Police Station / Any Police Station under Zero FIR Mandate]'}
DISTRICT: ${formData.district || 'Jurisdiction Area'}

DATE: ${dateStr}

SUBJECT: FORMAL COMPLAINT UNDER SECTIONS 354, 354D, 506, 509 OF THE INDIAN PENAL CODE (IPC) / RESPECTIVE SECTIONS OF BHARATIYA NYAYA SANHITA (BNS) FOR IMMEDIATE REGISTRATION OF FIR.

Respected Sir/Madam,

I, ${complainant}, adult Indian inhabitant, residing at ${address}, Contact Number: ${phone}, do hereby respectfully submit this formal written complaint for prompt registration of an FIR against the accused person(s) detailed hereunder:

1. DETAILS OF THE ACCUSED:
   Name: ${accused}
   Address/Workplace/Digital Identifier: ${formData.accusedDetails || 'Details provided in annexed annexure'}
   Contact: ${formData.accusedPhone || 'Unknown / Withheld'}

2. PARTICULARS OF THE OFFENCE:
   Date & Time of Incident: ${incidentDate}
   Place of Occurrence: ${incidentPlace}

3. STATEMENT OF FACTS & CHRONOLOGY:
   ${incidentDetails}

4. DIGITAL / PHYSICAL EVIDENCE ANNEXED:
   The complainant has preserved contemporaneous digital evidence (including call records, messages, and screenshots) and submits the same along with this complaint.

5. PRAYER & STATUTORY MANDATE:
   In light of the mandatory provisions laid down by the Hon'ble Supreme Court of India in Lalita Kumari v. Govt. of U.P. [(2014) 2 SCC 1], where the disclosure of a cognizable offence mandates immediate registration of an FIR:
   a) Register an immediate First Information Report (FIR) / Zero FIR against the accused person(s);
   b) Initiate urgent investigation and secure any digital surveillance/CCTV footage of the place of occurrence;
   c) Provide immediate safety and police protection to the undersigned complainant from any threat, intimidation, or reprisal.

Yours faithfully,

_____________________________
(Signature / Digital Mark)
${complainant}
Contact: ${phone}
Address: ${address}
`;

    case 'POSH Workplace Harassment Complaint':
      return `CONFIDENTIAL - UNDER THE POSH ACT, 2013

TO,
THE PRESIDING OFFICER & MEMBERS,
INTERNAL COMPLAINTS COMMITTEE (ICC),
${formData.organizationName || '[Name of Employer / Organization]'},
${formData.orgAddress || '[Office Address]'}

DATE: ${dateStr}

SUBJECT: FORMAL COMPLAINT OF SEXUAL HARASSMENT AT THE WORKPLACE UNDER SECTION 9 OF THE SEXUAL HARASSMENT OF WOMEN AT WORKPLACE (PREVENTION, PROHIBITION AND REDRESSAL) ACT, 2013 (POSH ACT).

Respected Presiding Officer & Committee Members,

I, ${complainant}, holding Employee ID / Designation: ${formData.designation || 'Employee'}, currently working in the ${formData.department || 'Department'}, do hereby file this formal complaint against the respondent named below under Section 9 of the POSH Act, 2013.

1. PARTICULARS OF RESPONDENT:
   Name: ${accused}
   Designation/Department: ${formData.respondentDesignation || 'Colleague / Supervisor'}
   Workplace Location: ${incidentPlace}

2. DATES AND CHRONOLOGY OF UNWELCOME CONDUCT:
   Date(s) of Incident: ${incidentDate}
   Specific Place(s): ${incidentPlace}

3. NARRATIVE OF THE OFFENCE / HOSTILE WORK ENVIRONMENT:
   ${incidentDetails}

4. IMPACT ON WORK & WELL-BEING:
   The persistent unwelcome verbal/physical/digital conduct of the respondent has created a severely intimidating, offensive, and hostile working environment, directly impacting my mental well-being and professional functioning.

5. RELIEF & INTERIM MEASURES SOUGHT UNDER SECTION 12:
   Pursuant to the statutory mandate under Section 12 of the POSH Act 2013, I humbly request:
   a) Urgent convening of the Internal Committee to register and commence inquiry proceedings;
   b) Immediate interim protection against retaliatory actions, adverse appraisals, or workplace victimization;
   c) Transfer of the respondent / remote working accommodation during the pendency of this inquiry;
   d) Strict confidentiality to be maintained by all parties as mandated by Section 16 of the Act.

Yours sincerely,

_____________________________
${complainant}
Employee ID: ${formData.employeeId || 'N/A'}
Contact: ${phone}
`;

    case 'Cybercrime Grievance Report':
      return `NATIONAL CYBER CRIME REPORTING PORTAL / CYBER CRIME POLICE STATION

DATE: ${dateStr}

SUBJECT: FORMAL COMPLAINT UNDER SECTIONS 66, 66C, 66D, 66E, 67 & 67A OF THE INFORMATION TECHNOLOGY ACT, 2000 & APPLICABLE PROVISIONS OF THE INDIAN PENAL CODE.

COMPLAINANT PARTICULARS:
Full Name: ${complainant}
Email Address: ${formData.email || user.email || 'N/A'}
Phone Number: ${phone}
City / State: ${address}

INCIDENT PARTICULARS:
Category of Cyber Crime: ${formData.cyberCategory || 'Online Harassment / Cyber Stalking / Identity Theft / Financial Fraud'}
Date & Approximate Time: ${incidentDate}
Suspect Profile / Handle / Phone / URL: ${accused}
Platform Involved: ${formData.platform || 'WhatsApp / Instagram / Email / Banking portal'}

INCIDENT CHRONOLOGY & MODUS OPERANDI:
${incidentDetails}

EVIDENCE SUBMITTED / ATTACHMENTS:
1. Timestamped screenshots of abusive/threatening messages / links.
2. Full email headers / IP logs / Transaction UTR numbers (where applicable).
3. Hash / metadata of exported chat archives.

PRAYER / REQUEST:
1. Freeze/trace the IP address, device IMEI, and bank/social accounts utilized by the perpetrator.
2. Direct the platform intermediary under Section 79 to expeditiously take down defamatory/infringing content.
3. Register formal FIR and bring the culprit to justice.

Declared under solemn affirmation:

_____________________________
${complainant}
Digital Complainant Signature
`;

    case 'Legal Notice':
      return `LEGAL NOTICE / FORMAL DEMAND
(Issued Under Section 80 of CPC / Relevant Civil Jurisprudence)

DATE: ${dateStr}

BY REGISTERED POST WITH A.D. / SPEED POST / LEGAL EMAIL TRANSMISSION

TO,
${accused}
${formData.recipientAddress || 'Address of Respondent'}

FROM:
${complainant}
Through LawShield Empanelled Legal Advisory

SUBJECT: LEGAL NOTICE FOR ${formData.noticeSubject || 'UNLAWFUL WITHHOLDING OF SECURITY DEPOSIT / BREACH OF CONTRACT / HARASSMENT'}

Sir / Madam,

Under instructions and authority received from my client, ${complainant}, resident of ${address}, I hereby serve upon you this formal Legal Notice as follows:

1. That my client had entered into a valid binding agreement / tenancy / professional relationship with you on or about ${formData.startDate || 'the mutually agreed date'}.

2. That the material facts leading to this notice are as under:
   ${incidentDetails}

3. That your deliberate failure, refusal, and acts of omission constitute a severe actionable breach, civil wrong, and criminal breach of trust, causing severe mental agony and monetary loss to my client.

4. YOU ARE HEREBY CALLED UPON to comply with the following demands within 15 (FIFTEEN) DAYS of receipt of this notice:
   a) ${reliefs};
   b) Cease and desist from any further unlawful interference, intimidation, or harassment;
   c) Remit the quantified sum of Rs. ${formData.claimAmount || 'As agreed'} along with interest @ 18% p.a.

TAKE FURTHER NOTICE that if you fail to comply within the stipulated 15 days, my client has given me unconditional instructions to initiate appropriate civil proceedings and criminal action against you in a Court of Competent Jurisdiction entirely at your risk, cost, and consequence.

A copy of this notice is retained in our office for future judicial record.

_____________________________
Advocate on Record / Authorized Legal Representative
On behalf of: ${complainant}
`;

    default:
      return `FORMAL LEGAL GRIEVANCE & PETITION
Date: ${dateStr}

Complainant: ${complainant}
Address: ${address} | Phone: ${phone}
Respondent: ${accused}

Matter: ${docType}
Incident Date: ${incidentDate}
Location: ${incidentPlace}

Summary of Grievance:
${incidentDetails}

Reliefs Demanded:
${reliefs}

Submitted by:
${complainant}
`;
  }
};

// Generate and save legal document
exports.generateDocument = (req, res) => {
  try {
    const { docType, title, formData } = req.body;

    if (!docType || !formData) {
      return res.status(400).json({ success: false, message: 'Document type and form data are required' });
    }

    const compiledContent = compileDocument(docType, formData, req.user);

    const newDoc = {
      _id: 'doc_' + uuidv4().slice(0, 8),
      userId: req.user._id,
      docType,
      title: title || `${docType} - ${new Date().toISOString().split('T')[0]}`,
      formData,
      compiledContent,
      createdAt: new Date(),
    };

    store.documents.unshift(newDoc);

    return res.status(201).json({
      success: true,
      message: 'Legal document drafted and compiled successfully',
      document: newDoc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Document compilation failed', error: error.message });
  }
};

// Get user documents
exports.getMyDocuments = (req, res) => {
  try {
    const userDocs = store.documents.filter(d => d.userId === req.user._id);
    return res.json({
      success: true,
      documents: userDocs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve documents', error: error.message });
  }
};

// Get document by ID
exports.getDocumentById = (req, res) => {
  try {
    const doc = store.documents.find(d => d._id === req.params.id && d.userId === req.user._id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    return res.json({ success: true, document: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch document', error: error.message });
  }
};

// Delete document
exports.deleteDocument = (req, res) => {
  try {
    const index = store.documents.findIndex(d => d._id === req.params.id && d.userId === req.user._id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized' });
    }
    store.documents.splice(index, 1);
    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
};
