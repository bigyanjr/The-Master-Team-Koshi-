# WardWatch Itahari

**Public Money, Public Visibility** — a civic-tech platform for Itahari ward-level budget transparency, project tracking, and citizen accountability.

Demo data: **Itahari Sub-Metropolitan City Demo** (Koshi Province, Nepal) — FY 2081/82 Demo — 5 wards, 10 public projects.

---

## Problem Statement

Local government spending is often opaque. Itahari citizens struggle to answer basic questions:

- Where did the ward budget go?
- Who won the tender and for how much?
- Was payment released with proof of work?
- Is the project on track or delayed?

Information lives in PDFs, notice boards, or office files — not in a form citizens can search, verify, or question.

---

## Solution

WardWatch Itahari connects the full accountability chain in one public portal:

**Budget → Tender → Contractor → Payment → Proof → Citizen Feedback**

Ward IT and admin teams use an admin portal to upload official updates. Citizens use a public dashboard, project pages, QR site scans, and an AI query bot — all backed by a transparency score and governance risk flags.

### How it works

1. **Ward publishes** budget and project details  
2. **Citizens track** payments, proof, and progress  
3. **AI flags risks** and explains data in simple language  

---

## Features

| Area | Capability |
|------|------------|
| **Public dashboard** | Itahari KPIs, ward filters, budget charts, risk alerts, recent updates |
| **Project registry** | Search, filter, sort; trust score and status badges on every card |
| **Project detail** | Budget, payments, proofs, timeline, contractor, QR code, AI summary |
| **Governance risk detector** | 0–100 transparency score, red-flag explanations |
| **Citizen query bot** | Natural-language Q&A (English + Roman Nepali) over public data |
| **Citizen feedback** | Complaint form with file upload + public feedback board |
| **Live QR scan** | Mobile-friendly project view at `/scan/:id` |
| **Admin portal** | Add projects, payments, proofs, updates; review complaints |
| **Firebase-ready** | Optional Firestore sync; **local seed data fallback** when env vars are missing |

---

## Tech Stack

- **Frontend:** React 19, Vite 8, React Router 7
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** lucide-react
- **QR:** qrcode.react
- **Data:** Local seed JSON + React Context; optional **Firebase Firestore**
- **AI (optional):** Google Gemini via `VITE_AI_API_KEY` for project summaries

---

## How to Run

### Prerequisites

- Node.js 18+
- npm

### Install & start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

For **phone QR testing** (LAN):

```bash
npm run dev
# Vite prints Network URL — set in .env:
# VITE_PUBLIC_URL=http://YOUR_LAN_IP:5173
```

### Environment variables

Copy `.env.example` to `.env`:

```env
# Optional — AI summaries
VITE_AI_API_KEY=

# Optional — mobile QR base URL
VITE_PUBLIC_URL=http://192.168.x.x:5173

# Optional — Firebase (app uses seed data if any value is missing)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Production build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Demo Flow (Hackathon / Judges)

1. **Landing** — `/` — how it works, problem, features, QR wow-demo  
2. **Dashboard** — `/dashboard` — Itahari Public Transparency Dashboard  
3. **Projects** — `/projects` — filter by ward, status, risk  
4. **Risk demo** — `/projects/proj-ith-02` — Ward 2 Drainage (governance risk panel)  
5. **Citizen bot** — `/ask` — try: *"Where did Ward 3 budget go?"* or *"Ward 2 ko budget kaha kharcha bhayo?"*  
6. **Complaints** — `/complaints` — submit feedback with optional photo/PDF  
7. **QR mobile scan** — on phone: `{VITE_PUBLIC_URL}/scan/proj-ith-01`  
8. **Admin** — `/admin` — add project, post payment/update, review complaints  

### Seed project IDs

`proj-ith-01` … `proj-ith-10` — all resolve on the project detail page.

| ID | Project |
|----|---------|
| proj-ith-01 | Itahari Main Road Repair |
| proj-ith-02 | Ward 2 Drainage Construction |
| proj-ith-03 | Street Light Installation at Market Area |
| proj-ith-04 | Community School Building Maintenance |
| proj-ith-05 | Public Health Post Upgrade |
| proj-ith-06 | Drinking Water Pipeline Extension |
| proj-ith-07 | Waste Management Vehicle Purchase |
| proj-ith-08 | Community Park Renovation |
| proj-ith-09 | Footpath Construction Near Bazaar Area |
| proj-ith-10 | Digital Ward Notice Board Installation |

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/dashboard` | Public dashboard |
| `/projects` | Project listing |
| `/projects/:id` | Project detail |
| `/projects/:id/qr-board` | Printable QR board |
| `/scan/:id` | Mobile QR scan view |
| `/complaints` | Citizen feedback |
| `/ask` | Citizen query bot |
| `/admin` | Admin dashboard |
| `/admin/add-project` | New project form |
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

Branding constants live in `src/config/branding.js`.

---

## Future Scope

- Firebase Authentication for ward officials and role-based access  
- Firebase Storage for complaint/proof file uploads (replacing base64)  
- SMS / notification alerts for citizens and admins  
- Multi-municipality support and Nepali UI (Devanagari)  
- Integration with government open-data APIs  
- Offline PWA for field QR scans in low connectivity  
- Audit log export and PDF ward transparency reports  

---

## License

Hackathon MVP — demo use. Not affiliated with Itahari Sub-Metropolitan City.
