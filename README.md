# DocuKeep — Personal Document Organizer

> **"Your documents, organized. Keep important files in one place and stay ahead of expiry dates."**

DocuKeep is a complete MERN-stack web application designed for personal document tracking, categorized record keeping, and intelligent calendar-based expiry management.

---

## 🎨 Design Philosophy & Color System

DocuKeep is designed with a premium, restrained aesthetic inspired by high-productivity software, avoiding template clichés like excessive neon glows, arbitrary cards, and floating shapes.

| Element | Color Hex | Role |
| :--- | :--- | :--- |
| **Main Background** | `#080B0A` | Deep midnight black background |
| **Content Surfaces** | `#111715` | Dark charcoal surfaces, cards, and sidebars |
| **Primary Accent** | `#C6FF5E` | Muted electric lime for primary actions, active items |
| **Secondary Accent** | `#39D98A` | Emerald green for success indicators and highlights |
| **Primary Text** | `#F5F7F5` | Crisp high-contrast text |
| **Secondary Text** | `#929B96` | Muted readable secondary labels |
| **Borders** | `#1F2B25` | Subtle dark borders |

---

## ✨ Key Features

1. **Personal Document Storage**
   - Upload PDF, Word (`.doc`, `.docx`), images (`.jpg`, `.png`, `.webp`), and scanned records (up to 15MB).
   - Secure private local filesystem storage isolated from public static paths.
   - Inline preview modal for PDF and images, with instant secure downloads.
   - Clean drag-and-drop upload zone and standard file picker.

2. **Smart Categories**
   - 9 seeded default categories: *Identity, Education, Financial, Insurance, Medical, Employment, Legal, Travel, Other*.
   - Create, edit, and delete custom categories per user.
   - Safe deletion: Deleting a category automatically reassigns its documents to *Other*.

3. **Intelligent Expiry Tracking**
   - Strict calendar date status rules:
     - 🔴 **Expired**: Expiry date is before today's calendar date.
     - 🟡 **Expiring Soon**: Expiry date is today or within the next 7 calendar days.
     - 🔵 **Expiring This Month**: Between 8 and 30 calendar days away.
     - 🟢 **Valid**: More than 30 calendar days away.
     - ⚪ **No Expiry Date**: No expiration date provided.
   - Dedicated views for **Expiring Soon** and **Expired Documents** sorted with urgent deadlines first.

4. **Authentic Dashboard Analytics**
   - 4 real MongoDB metrics calculated from authenticated user records:
     - Total Documents
     - Expiring Soon
     - Expired Documents
     - Categories Used
   - Recently added document list, attention-required expiry feed, and compact category breakdown bars.
   - Zero invented stats or meaningless percentages.

5. **Security & Ownership Isolation**
   - Password hashing with `bcryptjs` (salt rounds: 10).
   - JWT tokens with support for both HttpOnly cookies and `Authorization: Bearer <token>` headers.
   - Strict server-side ownership enforcement: Every query and file operation verifies `req.user._id === doc.userId`.
   - Complete file cleanup: Deleting a document or replacing a file permanently removes the old physical file from disk.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router 7, Tailwind CSS, Lucide React, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Multer, bcryptjs, jsonwebtoken, cookie-parser
- **Storage**: Private server storage layer with cryptographic unique filenames

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (Local instance or MongoDB Atlas URI).
  *Note: If local MongoDB is not running, DocuKeep includes an automatic in-memory MongoDB fallback for instant zero-configuration development.*

### 1. Installation

Install all dependencies for root, server, and client:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

cd ..
```

Or from the root directory:
```bash
npm run install:all
```

### 2. Configuration

Create or verify `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/docukeep
JWT_SECRET=your_jwt_secret_key_change_in_production
CLIENT_URL=http://localhost:5173
```

### 3. Running the Application

**Run Server (Port 5000):**
```bash
cd server
npm run dev
# or: node server.js
```

**Run Client (Port 5173):**
```bash
cd client
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## Production Deployment

The Vercel project serves the React/Vite frontend only. The Express API and MongoDB must be deployed separately; Vercel's SPA fallback is not an API server. Configure Vercel with the repository root (`.`), the Vite preset, `npm ci` for installation, `npm run build` for the build command, and `client/dist` as the output directory. The `vercel.json` file contains these settings and the React Router fallback.

The included `render.yaml` prepares the Express API for Render with a persistent upload disk. Creating that service requires a persistent-disk-capable Render plan because uploaded documents are stored on disk. The Render service needs a persistent MongoDB URI; set `MONGODB_URI` to the private Atlas connection string when creating the service. Render generates `JWT_SECRET`; it is not stored in the repository.

After the API is deployed, set `VITE_API_URL` in the Vercel project to the API origin followed by `/api` (for example, `https://docukeep-api.onrender.com/api`) and redeploy. The API's `CLIENT_URL` must be `https://bwt-project.vercel.app`; add any other trusted production frontend origins to `CORS_ORIGINS` as a comma-separated list. Never add database credentials or JWT secrets to Vercel's frontend environment variables or source control.

Production does not start if MongoDB or a strong JWT secret is missing, and it never substitutes an in-memory database. Local development can still fall back to an in-memory database. The backend health endpoint is `/api/health`.

---

## 🧪 Automated Test Suite

A complete 16-point end-to-end integration test is provided in `server/test-suite.js`.

To run the automated tests against the running server:
```bash
node server/test-suite.js
```

**What the test verifies:**
1. Health check endpoint.
2. User registration and JWT issuance.
3. Seeding of default 9 categories.
4. Custom category creation.
5. Multi-user security isolation.
6. Document upload with valid PDF attachment.
7. Date validation (rejecting expiry dates earlier than issue dates).
8. Uploading documents expiring within 7 days.
9. Uploading expired documents.
10. Live dashboard statistics calculation against actual MongoDB records.
11. Search query and status filters.
12. Secure download (`attachment`) and inline preview (`inline`) headers.
13. Ownership enforcement (User B blocked from User A's documents).
14. Document metadata updates.
15. Profile and settings update.
16. Permanent file deletion and storage cleanup.

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a new account (seeds default categories).
- `POST /api/auth/login` — Sign in and receive token/cookie.
- `POST /api/auth/logout` — Clear session cookie.
- `GET /api/auth/me` — Retrieve current user profile.

### Documents
- `POST /api/documents` — Upload new document (`multipart/form-data`: `file`, `title`, `category`, `description`, `issueDate`, `expiryDate`).
- `GET /api/documents` — List documents (Query params: `search`, `category`, `status`, `sortBy`, `order`).
- `GET /api/documents/:id` — Get single document details.
- `PUT /api/documents/:id` — Update document metadata or replace attached file.
- `DELETE /api/documents/:id` — Delete document and delete physical file from storage.
- `GET /api/documents/:id/download` — Stream file with `Content-Disposition: attachment`.
- `GET /api/documents/:id/preview` — Stream file with `Content-Disposition: inline`.

### Dashboard
- `GET /api/dashboard/stats` — Returns `{ totalDocuments, expiringSoon, expiredDocuments, categoriesUsed }`.
- `GET /api/dashboard/recent-documents` — Returns 5 most recently created documents.
- `GET /api/dashboard/expiry` — Returns urgent documents and category distribution breakdown.

### Categories
- `GET /api/categories` — Get categories with document counts.
- `POST /api/categories` — Create custom category.
- `PUT /api/categories/:id` — Rename category (and updates all linked documents).
- `DELETE /api/categories/:id` — Delete category (reassigns linked documents to 'Other').

### Profile & Settings
- `GET /api/profile` — Get profile info and document statistics.
- `PUT /api/profile` — Update name, email, and password.

---

## 📁 Project Structure

```
BWT PROJECT/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── DocumentCard.jsx
│   │   │   ├── DocumentModal.jsx
│   │   │   ├── DocumentPreviewModal.jsx
│   │   │   ├── DocumentTable.jsx
│   │   │   ├── FileTypeIcon.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Topbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── DocumentsPage.jsx
│   │   │   ├── ExpiredDocumentsPage.jsx
│   │   │   ├── ExpiringSoonPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── dateUtils.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/
│   │   ├── constants.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── dashboardController.js
│   │   ├── documentController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Category.js
│   │   ├── Document.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── documentRoutes.js
│   │   └── profileRoutes.js
│   ├── uploads/
│   ├── server.js
│   └── test-suite.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
