# 🔥 FLAMES Game Web Application (MERN Stack)

A modern, playful, and responsive web application built with the **MERN stack** (MongoDB, Express, React, Node.js), styled with **Bootstrap 5** and custom CSS glassmorphism. It implements the classic childhood **FLAMES** relationship algorithm with interactive animations, live calculation visualizers, procedural audio effects, and a secure, hidden **Admin Dashboard**.

---

## 🌟 Highlights & Features

### 1. Modern & Playful UI/UX
- **Vibrant Aesthetic**: Midnight mesh background, neon gradient text, and glassmorphic cards (`backdrop-filter: blur(20px)`).
- **Interactive Animations**: Floating hearts and stars, pulsing badges, and bouncing icons.
- **FLAMES Visualizer**: Live step-by-step cross-cancellation of matching letters with strikethrough effects and circular FLAMES letter elimination.
- **Sound Effects**: Procedural Web Audio API sound system (pop effects, calculating whooshes, chimes, and victory fanfare) with an easy Mute/Unmute toggle.
- **Celebratory Confetti**: Multi-angle canvas confetti bursts upon destiny reveals.
- **1-Click Test Pairs**: Instant presets (*Romeo & Juliet*, *Jack & Rose*, *Barbie & Ken*, *Harry & Hermione*).

### 2. Relationship Icons & Definitions
Each FLAMES outcome corresponds to the required symbolic icon:
- **Friendship (F)**: 🤝 Handshake — *Best Friends Forever*
- **Love (L)**: ❤️ Heart — *Cupid Approved True Romance*
- **Affection (A)**: 😊 Smiling Face — *Pure Warmth & Care*
- **Marriage (M)**: 💍 Ring — *Soulmate Destiny*
- **Enemy (E)**: ⚔️ Crossed Swords — *Spicy Rivals*
- **Sibling (S)**: 👨‍👩‍👧‍👦 Family Icon — *Family Vibe & Playful Teasing*

### 3. Private Hidden Admin Portal (`/admin`)
- Accessible only via the secret route: `http://localhost:5173/admin` (or `http://localhost:5174/admin`).
- **Passcode Protected**: Protected by a secret key (`flamesadmin2026`). Normal users cannot view calculation logs.
- **Live Metrics**: Total games played, breakdown by outcome (F, L, A, M, E, S), and real-time database status.
- **Search & Filtering**: Search entries by player name, or filter by specific FLAMES outcome.
- **Entry Management**: Delete individual records or perform a complete database wipe with confirmation.
- **Export to CSV**: 1-click export of calculation history.

### 4. Resilient Backend & MongoDB Integration
- Built with **Node.js, Express, and Mongoose**.
- **Resilient Fallback Mode**: If a local MongoDB instance is not currently active, the server seamlessly falls back to a file-persisted JSON store (`server/data/local_entries.json`), ensuring zero-downtime gameplay while logging clear connection status. Once a MongoDB instance (or Atlas URI) is connected, it switches to Mongo automatically.

---

## 📁 Modular Project Structure

```
GAMEAPP/
├── package.json             # Root orchestrator (runs client & server concurrently)
├── .gitignore               # Root git ignore
├── README.md                # Documentation
│
├── server/                  # Node.js + Express Backend
│   ├── package.json
│   ├── .env                 # Environment config (PORT, MONGODB_URI, ADMIN_SECRET_KEY)
│   ├── .env.example
│   ├── data/                # Resilient fallback persistence directory
│   └── src/
│       ├── config/
│       │   └── db.js        # Mongoose connection with auto-fallback
│       ├── controllers/
│       │   ├── flamesController.js  # FLAMES gameplay and public stats logic
│       │   └── adminController.js   # Admin verification, entries querying, CSV export
│       ├── models/
│       │   └── FlameEntry.js        # Mongoose Schema with indexes
│       ├── routes/
│       │   ├── flamesRoutes.js      # /api/flames/play, /api/flames/stats
│       │   └── adminRoutes.js       # /api/admin/auth, /api/admin/entries, etc.
│       ├── utils/
│       │   └── flamesCalculator.js  # Core algorithm & step audit
│       └── index.js                 # Express app bootstrap, CORS, error handling
│
└── client/                  # React + Vite Frontend
    ├── package.json
    ├── vite.config.js       # Proxy setup for /api -> http://localhost:5000
    ├── index.html           # Meta tags, Outfit & Plus Jakarta Sans fonts
    └── src/
        ├── index.css        # Custom Bootstrap overrides, keyframes, glassmorphism
        ├── App.jsx          # React Router setup
        ├── main.jsx         # Application root
        ├── components/
        │   ├── Navbar.jsx              # Responsive navigation, sound toggle, rules modal
        │   ├── Footer.jsx              # Responsive footer with subtle admin link
        │   ├── FlamesInputCard.jsx     # Modern name inputs, validation & presets
        │   ├── FlamesVisualizer.jsx    # Cancellation animation & circular elimination
        │   ├── ResultCard.jsx          # Result display, icons, quotes, share tools
        │   └── ParticlesBackground.jsx # Floating hearts, sparkles & flame particles
        ├── pages/
        │   ├── HomePage.jsx            # Multi-stage interactive game flow
        │   └── AdminDashboardPage.jsx  # Secret admin command center
        └── utils/
            ├── api.js                  # Frontend API client
            ├── flamesEngine.js         # Client-side validation & metadata
            └── soundEffects.js         # Web Audio API sound generator
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Optional: works with local MongoDB, MongoDB Atlas, or built-in auto-fallback)

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install each folder manually: `npm install` in root, `server/`, and `client/`)*

### 2. Configure Environment Variables
A default `server/.env` is already created. You can customize it as needed:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/flames_game
ADMIN_SECRET_KEY=flamesadmin2026
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Run Application
Run both backend and frontend concurrently with one command from the root:
```bash
npm run dev
```

Or run them individually in separate terminals:
- **Backend**: `cd server && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend**: `cd client && npm run dev` (Runs on `http://localhost:5173` or `5174`)

Open your browser at **`http://localhost:5173/`** to start playing!

---

## 🛡️ Admin Portal

- **Secret Route**: Navigate to `/admin` (e.g., `http://localhost:5173/admin` or click the shield icon in the top navbar).
- **Default Admin Key**: `flamesadmin2026`
- **Features**:
  - View full history of entries (names, timestamp, calculated result, and character count).
  - Search player names and filter by outcome.
  - Delete unwanted entries or reset database.
  - Export CSV report.

---

## 🧮 The FLAMES Algorithm

1. **Input Normalization**:
   Names are trimmed and sanitized to alphabetic characters (case-insensitive).
2. **Letter Cross-Cancellation**:
   Each letter common to both names is removed from both lists.
   *Example: "Romeo" & "Juliet" -> letter 'e' cancelled -> remaining count $N = 9$.*
3. **Circular Elimination**:
   Starting with `[F, L, A, M, E, S]`, count cyclically up to $N$. The letter at the count is eliminated. The count resumes from the next letter until exactly one letter remains.
4. **Special Cases**:
   If $N = 0$ (identical names or complete anagrams), it is recognized as a *Soulmate Love Match*.

---

## 🚀 Deployment (Vercel & Render)

The project is fully pre-configured for **Vercel** (Frontend) and **Render** (Backend):

- 📖 **Full Deployment Guide**: See [DEPLOYMENT.md](file:///c:/Users/ravik/OneDrive/Desktop/GAMEAPP/DEPLOYMENT.md) for a comprehensive, step-by-step walkthrough.
- **Frontend on Vercel**:
  - Root directory: `client` (or `./`)
  - Framework: Vite
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-backend.onrender.com`
  - SPA Routing: Handled via `vercel.json` (no 404 on page refresh)
- **Backend on Render**:
  - Service Type: Web Service
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `npm start`
  - Health check path: `/api/health`
  - Configured via `render.yaml` Blueprint or Render dashboard

---

## 📄 License
MIT License. Built for fun and learning!
