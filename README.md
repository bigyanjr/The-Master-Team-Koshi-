# WardWatch Itahari

**Tagline:** Public Money, Public Visibility

A civic-tech hackathon MVP that makes Itahari ward-level public spending transparent — budget, tenders, contractor payments, site proofs, citizen complaints, AI explanations, and on-site QR scans in one citizen-friendly portal.

**Demo municipality:** Itahari Sub-Metropolitan City Demo (Koshi Province, Nepal) · FY 2081/82 · 5 wards · 10 public projects

**Pitch deck (for judges):** [http://localhost:5173/pitch](http://localhost:5173/pitch)

---

## Problem Statement

Local government spending is often opaque. Citizens in Itahari — and across Nepal — struggle to answer basic accountability questions:

- Where did the ward budget go?
- Who won the tender and for how much?
- Was payment released with proof of work?
- Is the project on track or delayed?

Information lives in PDFs, notice boards, or office files — not in a searchable, verifiable form that ordinary citizens can use without visiting a ward office.

---

## Proposed Solution

**WardWatch Itahari** connects the full accountability chain in one public portal:

**Budget → Tender → Contractor → Payment → Proof → Citizen Feedback**

Ward officials publish official updates through an admin portal. Citizens track spending on a simplified dashboard, project pages, QR site scans, and an AI query bot — backed by transparency trust scores and governance risk flags.

### How it works

1. **Ward publishes** — budget, tender, payment, and proof records go live  
2. **Citizens track** — dashboard, QR scan, or project pages (no login required)  
3. **AI flags risks** — plain-language alerts when something needs a closer look  

---

## Key Features

| Area | Capability |
|------|------------|
| **Public dashboard** | 4 KPI cards, ward overview, top risk alerts, latest updates, citizen action shortcuts |
| **Project registry** | Search, filter, sort by ward/status/risk; trust score on every card |
| **Project detail** | Budget, payments, proofs, timeline, contractor, QR code, AI summary, risk panel |
| **Governance risk detector** | 0–100 trust score + red-flag explanations (payment-without-proof, delays, etc.) |
| **Citizen feedback** | Wada 1–5 selector, complaint form with file upload, public feedback board |
| **Live QR scan** | Mobile-friendly project view at `/scan/:id` |
| **Admin portal** | Add projects, payments, proofs, updates; review complaints (ward admin role) |
| **Auth & roles** | Citizen and ward admin demo accounts; Firebase Auth or local fallback |
| **Firebase-ready** | Optional Firestore sync; **local seed data fallback** when env vars are missing |

---

## AI Features

| Feature | Description |
|---------|-------------|
| **Citizen Query Bot** (`/ask`) | Natural-language Q&A in English and Roman Nepali over public ward data |
| **AI Project Summary** | Plain-language transparency brief on each project detail page |
| **Governance Risk Engine** | Rule-based detection: budget-progress mismatch, payment without proof, delays, tender overrun |
| **Trust Score (0–100)** | Single citizen-friendly metric derived from payments, proofs, complaints, and flags |
| **Gemini integration (optional)** | Set `VITE_AI_API_KEY` for live AI summaries; local fallback works without it |

**Try asking:** *"Where did Ward 3 budget go?"* or *"Ward 2 ko budget kaha kharcha bhayo?"*

---

## QR Wow Demo

Construction sites can display a QR code that opens live project data on any phone — no app install.

| Step | Action |
|------|--------|
| 1 | Open `/qr-demo/proj-ith-01` on laptop (shows QR + instructions) |
| 2 | Scan with phone camera |
| 3 | Mobile view opens at `/scan/proj-ith-01` with budget, payments, proof & trust score |

**Phone testing:** Set `VITE_PUBLIC_URL=http://YOUR_LAN_IP:5173` in `.env` — localhost URLs do not work on phones.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 7 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | lucide-react |
| QR codes | qrcode.react |
| Data | Local seed JSON + React Context; optional Firebase Firestore |
| Auth | Firebase Auth or localStorage fallback |
| File upload | Firebase Storage or base64 local fallback |
| AI (optional) | Google Gemini via `VITE_AI_API_KEY` |

---

## Project Structure

```
janata-ledger/
├── src/
│   ├── App.jsx                 # Routes
│   ├── config/branding.js      # Product name, tagline, demo IDs
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state & roles
│   │   └── DataContext.jsx     # Wards, projects, mutations
│   ├── data/seedData.js        # Itahari demo data (5 wards, 10 projects)
│   ├── pages/
│   │   ├── Landing.jsx         # Marketing home
│   │   ├── Pitch.jsx           # Hackathon pitch deck (/pitch)
│   │   ├── PublicDashboard.jsx # Citizen dashboard
│   │   ├── Projects.jsx        # Project listing
│   │   ├── ProjectDetail.jsx   # Full project view
│   │   ├── CitizenQueryBot.jsx # AI Q&A (/ask)
│   │   ├── Complaints.jsx      # Citizen feedback
│   │   ├── QrDemo.jsx          # QR presentation page
│   │   ├── ProjectMobileScan.jsx # Post-scan mobile view
│   │   └── admin/…             # Ward admin portal pages
│   ├── components/
│   │   ├── dashboard/          # KPI cards, ward cards, risk alerts
│   │   ├── project/            # Budget, payments, proofs, AI panel
│   │   ├── layout/             # Header, footer, nav
│   │   └── ui/                 # Button, badge, file upload, etc.
│   ├── services/               # Auth, complaints, uploads, Firebase
│   └── utils/
│       ├── riskEngine.js       # Trust score, ward stats, activity
│       ├── corruptionRiskDetector.js
│       ├── citizenQueryEngine.js
│       └── aiSummary.js
├── .env.example
├── package.json
└── README.md
```

---

## How to Run Locally

### Prerequisites

- **Node.js** 18+
- **npm**

### Install & start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Production build

```bash
npm install
npm run dev      # development
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

### Lint

```bash
npm run lint
```

### Phone QR testing (LAN)

```bash
npm run dev
# Note your PC's Wi‑Fi IPv4 (ipconfig on Windows)
# Add to .env:
# VITE_PUBLIC_URL=http://192.168.x.x:5173
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
# Optional — AI summaries (Gemini)
VITE_AI_API_KEY=

# Optional — mobile QR base URL (required for phone scanning on local network)
VITE_PUBLIC_URL=http://192.168.x.x:5173

# Optional — Firebase (app uses seed data if any value is missing)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Note:** The app runs fully offline with seed data when Firebase and AI keys are not set.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Citizen** | `citizen@itahari.demo` | `demo123` |
| **Ward Admin** | `admin@itahari.demo` | `demo123` |

- Citizens can browse, ask AI, and submit complaints.  
- Ward admins access `/admin` to add projects, post updates, and review complaints.

**Hackathon demo:** Ward IT/Admin accounts can self-register and are **auto-approved** immediately. In production, municipality approval should be required before admin access is granted.

You can also register new accounts at `/register` — choose **Citizen** or **Ward IT/Admin**.

---

## Demo Flow (Hackathon / Judges)

Recommended 5-minute walkthrough:

| # | Route | What to show |
|---|-------|--------------|
| 1 | `/pitch` | One-page pitch: problem → solution → AI → QR → impact |
| 2 | `/dashboard` | Citizen-friendly summary: KPIs, wada overview, risk alerts |
| 3 | `/projects/proj-ith-02` | Ward 2 Drainage — trust score + governance risk panel |
| 4 | `/ask` | Citizen Query Bot — *"Show high risk projects in Itahari"* |
| 5 | `/qr-demo/proj-ith-01` | QR wow demo — scan with phone |
| 6 | `/complaints` | Submit feedback (Wada 1–5 → project) |
| 7 | `/admin` | Login as ward admin — add payment or review complaint |

### Seed project IDs

`proj-ith-01` … `proj-ith-10`

| ID | Project | Ward |
|----|---------|------|
| proj-ith-01 | Itahari Main Road Repair | 1 |
| proj-ith-02 | Ward 2 Drainage Construction | 2 |
| proj-ith-03 | Street Light Installation at Market Area | 4 |
| proj-ith-04 | Community School Building Maintenance | 3 |
| proj-ith-05 | Public Health Post Upgrade | 5 |
| proj-ith-06 | Drinking Water Pipeline Extension | 5 |
| proj-ith-07 | Waste Management Vehicle Purchase | 3 |
| proj-ith-08 | Community Park Renovation | 2 |
| proj-ith-09 | Footpath Construction Near Bazaar Area | 1 |
| proj-ith-10 | Digital Ward Notice Board Installation | 5 |

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/pitch` | **Pitch Mode** — hackathon deck for judges |
| `/dashboard` | Public transparency dashboard |
| `/projects` | Project listing (supports `?ward=`) |
| `/projects/:id` | Project detail |
| `/projects/:id/qr-board` | Printable QR board |
| `/qr-demo/:id` | QR presentation (scan instructions) |
| `/scan/:id` | Mobile QR scan destination |
| `/complaints` | Citizen feedback |
| `/ask` | Citizen Query Bot |
| `/login` | Login |
| `/register` | Register |
| `/profile` | User profile (authenticated) |
| `/admin` | Ward admin dashboard |
| `/admin/add-project` | New project |
| `/admin/add-payment` | Record payment |
| `/admin/upload-proof` | Upload proof |
| `/admin/add-update` | Multi-step project update |
| `/admin/complaints` | Review complaints |

---

## Data & Firebase

- **Default:** All data loads from `src/data/seedData.js` via `DataContext`.
- **With Firebase:** Set all six `VITE_FIREBASE_*` vars. App loads wards/projects from Firestore; writes sync on admin actions.
- **Fallback:** Missing env, empty Firestore, or fetch errors → seed data is used automatically.

Firestore collections: `wards`, `projects`, `payments`, `proofs`, `complaints`, `users` (reserved).

Branding constants: `src/config/branding.js`

---

## Future Scope

- **Production auth:** Ward IT/Admin self-registration with municipality approval workflow before `/admin` access (hackathon demo auto-approves immediately)  
- Nepali UI (Devanagari) and SMS/notification alerts for citizens and admins  
- Multi-municipality support and province-level dashboards  
- Integration with government open-data and tender APIs  
- Offline PWA for field QR scans in low connectivity  
- Audit log export and PDF ward transparency reports  
- Blockchain-anchored proof timestamps (research phase)  

---

## Team Notes

- **Built for:** Civic-tech / gov-tech hackathons focused on local transparency in Nepal  
- **Design principle:** Summary first, details later — citizens should understand the platform in under 5 seconds  
- **Demo data:** Fictional Itahari ward records for presentation only — not affiliated with Itahari Sub-Metropolitan City  
- **Offline-first:** Judges can run the full demo without API keys or internet after `npm install`  
- **Pitch URL:** Share `/pitch` with judges before the live demo for a quick overview  

---

## License

Hackathon MVP — demo use only. Not an official government product.
