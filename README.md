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

**Phone testing:** Set `VITE_PUBLIC_URL=http://YOUR_LAN_IP:5174` in `.env`, run `npm run dev`, then open the **Network** URL on your laptop (not localhost) before scanning.

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
│   ├── services/               # Auth, complaints, uploads, reset, seed
│   │   ├── resetService.js     # Dev-only Firestore/local clear
│   │   └── seedService.js      # Fresh Itahari demo seed
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
```

1. Note your PC's Wi‑Fi IPv4 from `ipconfig` (e.g. `192.168.29.142`).
2. Add to `.env`: `VITE_PUBLIC_URL=http://192.168.29.142:5174` (IP only — port is synced automatically).
3. Restart dev server, then open the **Network** URL Vite prints (e.g. `http://192.168.29.142:5174`) on your laptop — **not** `localhost`.
4. Go to `/qr-demo/proj-ith-01` and scan with your phone on the **same Wi‑Fi**.
5. If it times out, allow **Node.js** through Windows Firewall when prompted.

**Common mistake:** QR shows port `5177` but dev server runs on `5174` — always use the Network URL from the terminal.

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
# Optional — AI summaries (Gemini)
VITE_AI_API_KEY=

# Optional — mobile QR base URL (required for phone scanning on local network)
VITE_PUBLIC_URL=http://192.168.x.x:5174

# Optional — Firebase (app uses seed data if any value is missing)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
# Optional — enable /dev-reset page in preview/production builds (default: dev only)
# VITE_ENABLE_DEV_RESET=true
```

> **Note:** The app runs fully offline with seed data when Firebase and AI keys are not set.

---

## Demo Accounts

| Role | Login | Password |
|------|-------|----------|
| **Citizen** | `citizen@itahari.demo` or username `democitizen` | `demo123` |

Citizens can browse, ask AI, and submit complaints. You can also register a new citizen account with a unique username at `/register`.

---

## Ward Admin Demo Logins

Ward IT/Admin users sign in with short ward login IDs. Each maps internally to a Firebase email like `ward1@itahari.demo`.

| Ward | Login ID | Password |
|------|----------|----------|
| **Ward 1** | `ward1@itahari` | `demo123` |
| **Ward 2** | `ward2@itahari` | `demo123` |
| **Ward 3** | `ward3@itahari` | `demo123` |
| **Ward 4** | `ward4@itahari` | `demo123` |
| **Ward 5** | `ward5@itahari` | `demo123` |

After login, each ward admin sees only their assigned ward dashboard (e.g. **Ward 1 Admin Dashboard**).

**Hackathon demo:** Ward IT/Admin accounts can self-register and are **auto-approved** immediately. In production, municipality approval should be required before admin access is granted.

You can also register new accounts at `/register` — choose **Citizen** or **Ward IT/Admin**.

### Firebase setup for ward demo accounts

Firebase Authentication users must exist with these actual emails:

- `ward1@itahari.demo`
- `ward2@itahari.demo`
- `ward3@itahari.demo`
- `ward4@itahari.demo`
- `ward5@itahari.demo`

Each password: `demo123`

The Firestore `users` collection must have matching documents for each UID with:

- `role: "ward_admin"`
- `wardNo: 1` through `5`
- `approved: true`

Account definitions live in `src/data/wardAdminAccounts.js`.

---

## Resetting Demo Data

Use this when you want to remove old users, projects, complaints, and registrations and start with a clean Itahari demo.

> **Important:** Firebase Authentication users **cannot** be deleted safely from the frontend client. You must delete them manually from **Firebase Console → Authentication → Users**, or use the Firebase Admin SDK on a trusted server.

### Step-by-step

1. **Delete Firebase Auth users manually**  
   Firebase Console → Authentication → Users → select and delete test accounts.

2. **Clear Firestore demo collections**  
   - Option A: Delete collections manually in Firebase Console  
   - Option B: Open [`/dev-reset`](http://localhost:5173/dev-reset) during development (`npm run dev`)  
   - Collections cleared: `users`, `wards`, `projects`, `payments`, `proofs`, `complaints`, `activityLogs`, `aiFeedback`, `bookmarks` (missing collections are skipped safely)

3. **Delete Firebase Storage uploads manually**  
   Firebase Console → Storage → remove uploaded proof/complaint files if needed.

4. **Clear browser localStorage**  
   Dev tools → Application → Local Storage → remove `wardwatch_*` keys,  
   or use **Clear Local Demo Data** on `/dev-reset`.

5. **Seed fresh Itahari data**  
   On `/dev-reset`, click **Seed Fresh Itahari Demo Data** or **Reset and Seed Fresh Data**.  
   Seeds 5 wards (Ward 1–5) and 10 projects with payments, proofs, and complaints.

6. **Register new accounts**  
   Create fresh citizen and ward admin users at `/register`. Ward admins are auto-approved in hackathon demo mode.

### Dev reset page

| Route | Availability |
|-------|----------------|
| `/dev-reset` | `import.meta.env.DEV` **or** `VITE_ENABLE_DEV_RESET=true` |

**Never enable `VITE_ENABLE_DEV_RESET` in production** unless you intentionally want the reset UI exposed.

Services: `src/services/resetService.js`, `src/services/seedService.js`

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
| `/dev-reset` | **Dev only** — clear/seed demo data |

---

## Data & Firebase

- **Default:** All data loads from `src/data/seedData.js` via `DataContext`.
- **With Firebase:** Set all six `VITE_FIREBASE_*` vars. App loads wards/projects from Firestore; writes sync on admin actions.
- **Fallback:** Missing env, empty Firestore, or fetch errors → seed data is used automatically.

Firestore collections: `wards`, `projects`, `payments`, `proofs`, `complaints`, `users`, `activityLogs`, `aiFeedback`, `bookmarks`.

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
