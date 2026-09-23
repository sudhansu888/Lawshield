# LawShield — Institutional Legal Guidance & Citizen Protection Infrastructure

An institutional digital legal platform built for Bar Council compliant advocate consultations, AI-powered statutory guidance, attorney-ready case briefing dossiers, tamper-proof Section 65B evidence vaults, and 24/7 emergency citizen protection.

---

## 🌟 Key Features

### 1. ⚖️ Dedicated Advocate Chamber & Video Consultations
- **Advocate Workspace**: Case assignment queue, scheduled appointments, and client case review.
- **WebRTC Video Hearings**: Encrypted advocate-client consultations with calendar scheduling and slot management.
- **Bar Council Verification**: Empanelled profile badges, experience records, practice jurisdiction, and consultation fees.

### 2. 🧠 AI Statutory Guidance & Case Intelligence
- **Statutory Legal Breakdown**: Instant analysis of disputes under the Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), POSH Act 2013, Consumer Protection Act, and Tenancy Laws.
- **Case Dossier Preparation**: Structured evidence mapping, chronological incident timelines, and attorney briefing sheets.

### 3. 📑 Automated Legal Drafts & FIR Generator
- **Court-Ready Documents**: Generate formal Legal Notices, First Information Reports (FIRs), Cease & Desist letters, and Tenancy Dispute Petitions with download and print support.

### 4. 🔒 Section 65B Evidence Locker
- **Tamper-Evident Storage**: Cryptographic SHA-256 hash preservation, metadata verification, and Indian Evidence Act Section 65B compliance certificates.

### 5. 🚨 Emergency Radar & Hotlines
- **Geospatial Proximity Radar**: Live interactive OpenStreetMap locating nearby 24/7 Police Stations, Women Safety Desks, and Trauma Centers.
- **1-Tap Emergency SOS**: Instant emergency broadcast and direct access to national hotlines (112, 1091, 7827170170, 1930).

### 6. 🌐 Multilingual & Voice Intake Studio
- **Language Switcher**: Native support for English, Hindi (हिन्दी), Bengali (বাংলা), Marathi (मराठी), Tamil (தமிழ்), and Spanish (Español).
- **Voice-to-Text Studio**: Dictate legal statements in regional languages with auto-transcription and statutory categorization.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet Maps
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io, JWT Authentication
- **Security & Architecture**: Role-Based Access Control (Citizen, Lawyer, Chamber Admin), Section 65B Evidence Hashing, REST API

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas connection string)
- [Git](https://git-scm.com/)

### 2. Clone and Configure
```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
cd <YOUR_REPOSITORY>
```

Copy the example environment configuration:
```bash
cp .env.example .env
```

### 3. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

### 4. Run Locally

#### Start the Backend Server (Port 5000):
```bash
cd backend
node server.js
# Or with nodemon: npm run dev
```

#### Start the Frontend Server (Port 5173):
```bash
cd ../frontend
npm run dev
```

Open your browser at **http://localhost:5173**.

---

## 👥 Demo Personas & Pre-configured Accounts

Use the **Persona Switcher** in the header or the **Sign In** page to log in as:

| Role | Name | Email | Password | Access |
|---|---|---|---|---|
| **Citizen Client** | Ananya Sharma | `ananya@lawshield.org` | `demo123` | Case intake, Legal drafts, Evidence vault, Consultations |
| **Advocate Counsel** | Adv. Rajesh Verma | `rajesh@lawshield.org` | `demo123` | Advocate Chamber, client cases, Video hearing room |
| **Chamber Admin** | Meera Sen | `meera@lawshield.org` | `demo123` | System telemetry, audit logs, advocate verification |

---

## 📜 Compliance & Legal Disclaimer

*LawShield is designed to comply with the Bar Council of India information architecture standards and Article 39A of the Constitution of India (Equal Justice and Free Legal Aid). Automated AI statutory guidance is intended for informational and case preparation assistance and does not replace formal legal representation by an advocate.*
