# EduFlow Academy — AI-Powered Learning Management System

A full-stack MERN learning management system with six AI-powered features including course recommendations, lesson summarisation, quiz generation, adaptive learning paths, concept explanation, and a RAG chatbot grounded in actual course content.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Testing](#testing)
- [Deployment](#deployment)
- [AI Features](#ai-features)

---

## Features

### Core LMS
- User registration and JWT-based authentication
- Course catalogue with search and filtering
- Video lesson player with progress tracking
- Student enrolment and certificate generation
- Course reviews and ratings
- Instructor studio for creating and managing courses
- Admin panel with platform analytics

### AI-Powered (via Claude API)
| Feature | Description |
|---|---|
| Course Summarisation | Cached Claude summary of all course lessons |
| Quiz Generator | Auto-generates 5-question MCQs from course content |
| Course Recommendations | Personalised recommendations based on student history |
| Adaptive Learning Path | Custom study plan targeting identified weak topics |
| Concept Explainer | Plain-language explanations of any course concept |
| RAG Chatbot | Answers student questions grounded in actual course content via MongoDB $text search |

### Notifications
- Enrolment confirmation emails via Nodemailer
- Weekly digest emails with course progress
- Certificate delivery on course completion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend | Node.js, Express 5, ES Modules |
| Database | MongoDB Atlas + Mongoose |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Media Storage | Cloudinary (thumbnails, certificate PDFs) |
| Email | Nodemailer |
| Charts | Recharts |
| Testing | Vitest, Testing Library, Playwright, mongodb-memory-server |
| Deployment | Vercel (static frontend + serverless API) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge                          │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │  React + Vite    │    │   Express (Serverless)   │  │
│  │  (client/dist)   │    │   server/api.js          │  │
│  │  port 5173 dev   │    │   port 5000 dev          │  │
│  └──────────────────┘    └──────────┬───────────────┘  │
└─────────────────────────────────────┼───────────────────┘
                                      │
              ┌───────────────────────┼───────────────────┐
              │                       │                   │
    ┌─────────▼────────┐  ┌──────────▼──────┐  ┌────────▼───────┐
    │  MongoDB Atlas   │  │  Anthropic API  │  │  Cloudinary    │
    │  (data + RAG     │  │  (6 AI features)│  │  (media store) │
    │   ContentChunks) │  └─────────────────┘  └────────────────┘
    └──────────────────┘
```

**RAG Pipeline:** Course content is chunked and stored in a `ContentChunk` MongoDB collection with full-text indexes. At query time, relevant chunks are retrieved via `$text` search and passed as context to Claude — no external vector database required.

---

## Project Structure

```
EduFlow-LMS/
├── client/                     # React frontend
│   └── src/
│       ├── api/                # Axios API client modules
│       ├── components/         # Shared UI components
│       ├── context/            # React context (auth, etc.)
│       ├── hooks/              # Custom React hooks
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── CourseCatalogue.jsx
│           ├── CourseDetail.jsx
│           ├── LessonPlayer.jsx
│           ├── StudentDashboard.jsx
│           ├── InstructorStudio.jsx
│           ├── CourseEditor.jsx
│           ├── Certificate.jsx
│           └── AdminPanel.jsx
├── server/                     # Express backend
│   └── src/
│       ├── config/             # DB and Cloudinary config
│       ├── controllers/        # Route handlers + unit tests
│       ├── middleware/         # Auth, rate limiting
│       ├── models/             # Mongoose schemas
│       │   ├── User.js
│       │   ├── Course.js
│       │   ├── Enrolment.js
│       │   ├── Review.js
│       │   └── ContentChunk.js # RAG document store
│       ├── routes/             # Express routers
│       │   ├── authRoutes.js
│       │   ├── courseRoutes.js
│       │   ├── enrolmentRoutes.js
│       │   ├── reviewRoutes.js
│       │   └── aiRoutes.js
│       └── scripts/
│           └── ingestContent.js # Seeds ContentChunk collection
├── e2e/                        # Playwright E2E tests
├── vercel.json                 # Vercel build + routing config
└── package.json                # Root build scripts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- An [Anthropic API key](https://console.anthropic.com/)
- A [Cloudinary](https://cloudinary.com/) account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/eduflow-lms.git
cd eduflow-lms

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running Locally

```bash
# Terminal 1 — start the backend (port 5000)
cd server && npm run dev

# Terminal 2 — start the frontend (port 5173)
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

### Seed Course Content (run once)

After your first deployment or local setup, populate the RAG content store:

```bash
cd server && node src/scripts/ingestContent.js
```

---

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/eduflow

# JWT
JWT_SECRET=your_jwt_secret_here

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
EMAIL_FROM=EduFlow Academy <your@email.com>
```

> The Claude API key is **server-side only**. It must never be exposed to `client/`.

---

## API Reference

All routes are prefixed with `/api`.

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create a new user account |
| POST | `/login` | Authenticate and receive JWT |
| GET | `/me` | Get current user profile |

### Courses — `/api/courses`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all published courses |
| GET | `/:id` | Get a single course with lessons |
| POST | `/` | Create course (instructor) |
| PUT | `/:id` | Update course (instructor/admin) |
| DELETE | `/:id` | Delete course (instructor/admin) |

### Enrolments — `/api/enrolments`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Enrol in a course |
| GET | `/my` | Get current student's enrolments |
| PATCH | `/:id/progress` | Update lesson progress |

### Reviews — `/api/reviews`
| Method | Path | Description |
|---|---|---|
| POST | `/` | Submit a course review |
| GET | `/course/:courseId` | Get reviews for a course |

### AI — `/api/ai` _(all require auth, rate-limited to 10 req/min)_
| Method | Path | Description |
|---|---|---|
| GET | `/summarise/:courseId` | Cached Claude course summary |
| GET | `/quiz/:courseId` | Generate 5-question MCQ |
| POST | `/recommend` | Personalised course recommendations |
| POST | `/adapt/:courseId` | Adaptive learning path |
| POST | `/explain` | Explain a concept in plain language |
| POST | `/chat` | RAG chatbot (course-grounded answers) |

---

## User Roles

| Role | Permissions |
|---|---|
| `student` | Browse catalogue, purchase/enrol, watch lessons, track progress, leave reviews |
| `instructor` | All student permissions + create/edit own courses and lessons, view enrolment analytics and revenue |
| `admin` | Full platform access: all users, all courses, platform-wide analytics |

---

## Testing

```bash
# Run all tests (unit + integration)
npm test

# Server unit tests only
cd server && npm run test:unit

# Client unit tests only
cd client && npm run test:unit

# Coverage report
cd server && npm run test:coverage
cd client && npm run test:coverage

# E2E tests (Playwright)
npx playwright test
```

### Coverage Targets
- Lines: **80%**
- Branches: **75%**

### Testing Rules
- Controllers: unit tests with `vi.mock()` — no real Anthropic, Cloudinary, or Atlas calls
- Routes: integration tests using `mongodb-memory-server`
- Critical user flows: E2E tests with Playwright
- `ANTHROPIC_API_KEY=test` in CI — any real Claude call in a test is a bug

---

## Deployment

The project deploys to **Vercel** as a hybrid app:
- Frontend: static build from `client/dist`
- Backend: serverless Express function at `server/api.js`

```bash
# Deploy via the built-in skill
/deploy
```

Manual deployment:

```bash
# Build the frontend
cd client && npm run build

# Deploy with Vercel CLI
vercel --prod
```

The `vercel.json` config routes `/api/*` to the serverless function and all other paths to the SPA's `index.html`.

---

## AI Features

All AI features are implemented in `server/src/controllers/aiController.js` and `server/src/routes/aiRoutes.js`. Every request requires a valid JWT and is subject to a **10 requests/minute** rate limit per user to manage Anthropic API costs.

### RAG Chatbot

The chatbot retrieves relevant course content using MongoDB `$text` search on the `ContentChunk` collection, then passes the matched chunks as grounding context to Claude. This eliminates the need for an external vector database while keeping answers accurate to the actual course material.

### Seeding Content

Run the ingest script once to chunk and index your course content into MongoDB:

```bash
cd server && node src/scripts/ingestContent.js
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`
4. Open a pull request against `main`

---

## License

MIT
