# 🪺 MindNest — Production-Grade Technical & User Blogging Platform

**MindNest** is an advanced, full-stack blogging platform built with **React 18 (Vite)**, **Node.js (Express)**, **MongoDB**, and **JWT Authentication**. It features real-time email OTP verification, dual-pane markdown editing, `.md`/`.txt` file uploading, adaptive reading time modes, atomic view deduplication, persistent embedded database storage, developer telemetry, and a zero-native-popup glassmorphic UI.

---

## 🌟 Unique Flagship Feature: Adaptive Reading Experience ("How much time do you have?")

Instead of simply truncating an article, MindNest features an intelligent **Adaptive Reading System**. When a user opens any article, they can select their available time window:

- ⚡ **2 min — Give me the gist**: Condenses the article into essential high-level summaries and key takeaways.
- ☕ **5 min — Important parts**: Displays core technical concepts, key code blocks, and primary arguments.
- 📖 **10 min — I have time to explore**: Provides in-depth explanations, code snippets, and structural sections.
- 🛋️ **20+ min — Full experience**: Renders the complete, uncompressed article.

### ⏳ Live Scroll Reading Progress Indicator
While reading, a dynamic progress bar tracks the user's scroll position and updates in real-time with an estimated remaining time indicator (`⏳ X min remaining`).

---

## ✨ Features Overview

### 🔐 Email Authentication & Role-Based Authorization
- **Real 6-Digit OTP Email Verification**: Powered by Nodemailer with Gmail SMTP integration (and automatic Ethereal test inbox fallback).
- **Post-Registration Modal Guard**: Right after registration, a dead-centered modal requires users to verify their 6-digit email OTP before accessing writing, commenting, or social features.
- **JWT & HTTP-Only Cookies**: Stateless authentication secured via encrypted HTTP-only cookies and bcrypt password hashing.
- **Role-Based Access Control (RBAC)**: Enforces permission boundaries across `Guest` (read-only), `Reader`, `Author`, and `Admin` roles.

### ✍️ Dual-Pane Markdown Authoring & File Uploads
- **Live HTML Markdown Preview**: Side-by-side real-time rendering supporting GFM markdown, code syntax styling, tables, blockquotes, and inline media.
- **Markdown / Text File Upload**: Upload existing `.md` or `.txt` blog files directly into the editor. MindNest automatically parses and populates the Title (`# Title`), Subtitle/Excerpt, Tags (`#tag1 #tag2`), and Body content.
- **Bundled Sample Uploads**: Located in `./samples/` for instant testing:
  - `sample_ai_agents.md` — Technical guide on building autonomous AI agents.
  - `sample_react_performance.md` — Deep dive into React 18 memoization & performance.
  - `sample_system_design.txt` — Distributed systems architecture blueprint.
- **Cover Image & Asset Upload**: Drag-and-drop cover image file upload or direct URL insertion.

### 🎨 100% Dead-Centered Custom UI & Micro-Interactions
- **Glassmorphism Design System**: Seamless dark and light theme switching with localStorage persistence.
- **Zero Native Browser Popups**: Replaced 100% of native browser `alert()` and `confirm()` popups with custom dead-centered modal dialogs (`top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`).
- **Inline Share Tooltip**: Clicking the share button displays an elegant inline tooltip (`✓ Link copied successfully!`) directly beside the button.

### 📊 Atomic View Counting & Analytics
- **Deduplicated View Tracking**: View counts are tracked atomically per authenticated User ID or Guest IP using MongoDB `$addToSet` and `$inc`, preventing view count inflation on page reloads.
- **Author Dashboard**: Track total article reads, total likes, draft/published posts, and manage user profile details.

### 💻 Developer Portal & Telemetry Suite (`/showcase`)
- **System Telemetry**: Real-time Node.js process memory metrics (RSS & Heap), uptime, active Mongoose connections, and response latency headers (`X-Response-Time`).
- **Security Audit Log**: Live audit trail recording registration, authentication attempts, and post mutations in MongoDB.
- **Multi-Format Data Exporter**: Export blog posts into formatted **CSV** and **JSON** files.

### 🚀 Persistent Embedded Database
- **Zero-Config Database Persistence**: Uses `mongodb-memory-server` configured with local disk storage (`./backend/data_db`). Articles, users, comments, and drafts persist safely across server restarts without requiring a standalone MongoDB server.

---

## 🛠️ Environment Variables Setup

Create a `.env` file in the root directory (or use `.env.example` as reference):

```env
PORT=5001
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

> 💡 **Note on Email OTP:** If `EMAIL_USER` and `EMAIL_PASS` are provided, real OTP emails will be sent to the user's inbox. If omitted, Nodemailer will automatically generate an **Ethereal test inbox link** printed in the backend terminal console for instant testing.

---

## 🚀 How to Run the Website

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

### Step 1: Clone Repository & Install Dependencies

```bash
git clone <repository-url>
cd <repository-directory>

# Install both backend and frontend dependencies in one command
npm run install:all
```

---

### Step 2: (Optional) Seed Sample Articles & Default Admin

To populate the database with 7 detailed initial technical blogs and seed accounts:

```bash
node backend/seed.js
```

**Default Credentials Created by Seed:**
- **Admin**: Email: `admin@mindnest.com` | Password: `admin123`
- **Author**: Email: `alex@mindnest.com` | Password: `user123`

---

### Step 3: Run the Application

You can run MindNest using any of the following modes:

#### ⚡ Mode A: Production / Unified Server (Recommended)
Builds the frontend and serves both API and React application from a single server port (`http://localhost:5001`).

```bash
# Build the React frontend production bundle
npm run build:frontend

# Start the Node.js Express server
npm start
```
📍 Open browser at: **`http://localhost:5001`**

---

#### 🛠️ Mode B: Hot-Reloading Development Mode
Runs backend API server and frontend Vite server independently with hot-reloading.

**Terminal 1 (Backend API with hot-reload):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend Vite dev server):**
```bash
npm run dev:frontend
```
📍 Open browser at: **`http://localhost:5173`** (API requests automatically proxied to port 5001).

---

#### 🐳 Mode C: Docker Container Deployment
Run MindNest in a fully containerized environment using Docker Compose:

```bash
docker-compose up --build
```
📍 Open browser at: **`http://localhost:5001`**

---

## 📂 Testing Sample File Uploads

To test the **Markdown / Text File Upload** feature:

1. Log into your MindNest account (or register a new user and verify OTP).
2. Click **Write Story** in the navigation bar.
3. Click the **"📂 Upload .md / .txt"** button near the top of the editor.
4. Select any sample file from the `./samples/` folder in the project:
   - `./samples/sample_ai_agents.md`
   - `./samples/sample_react_performance.md`
   - `./samples/sample_system_design.txt`
5. Watch title, tags, and body content auto-fill instantly!
6. Click **Publish Post**.

---

## 📁 Project Structure

```
.
├── backend/
│   ├── config/          # Database setup & persistent MongoMemoryServer connection
│   ├── controllers/     # Auth, Post, Comment, User, Showcase & OTP logic
│   ├── middleware/      # JWT protection, RBAC guards & error handling
│   ├── models/          # User, Post, Comment, and AuditLog Mongoose schemas
│   ├── routes/          # REST API routes (/api/auth, /api/posts, etc.)
│   ├── utils/           # JWT, CSV Exporter, and Nodemailer OTP email helper
│   ├── data_db/         # Local persistent database storage (auto-generated)
│   ├── seed.js          # Database seed script with initial technical blogs
│   └── server.js        # Express application entry point
├── frontend/
│   ├── public/          # Static assets & icons
│   ├── src/
│   │   ├── components/  # Navbar, Footer, PostCard, MarkdownEditor, Modal, Toast, etc.
│   │   ├── context/     # AuthContext provider (JWT & OTP state management)
│   │   ├── pages/       # Home, Post Detail, Editor, Dashboard, Profile, Auth, Showcase
│   │   ├── services/    # Axios API client setup
│   │   ├── styles/      # Glassmorphic CSS design system (Dark & Light tokens)
│   │   ├── App.jsx      # React Router routes & protection
│   │   └── main.jsx     # React entry point
│   ├── index.html
│   └── vite.config.js   # Vite configuration & API proxy rules
├── samples/             # Sample .md and .txt blog files for upload testing
│   ├── sample_ai_agents.md
│   ├── sample_react_performance.md
│   └── sample_system_design.txt
├── docs/
│   └── ARCHITECTURE.md  # Extended architecture documentation & API specifications
├── Dockerfile           # Production Docker container manifest
├── docker-compose.yml   # Multi-container orchestration
├── .env.example         # Reference environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.

