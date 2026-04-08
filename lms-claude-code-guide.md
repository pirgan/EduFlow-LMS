# Learning Management System — Complete Claude Code Guide
### Build a Full-Stack MERN App with AI, Course RAG, Skills, Agents, Hooks, and MCP
*April 2026*

---

## Table of Contents

1. [What You Will Build](#1-what-you-will-build)
2. [Prerequisites](#2-prerequisites)
3. [Environment Setup](#3-environment-setup)
4. [Create All Skills First](#4-create-all-skills-first)
5. [Trello MCP Setup + Populate Backlog](#5-trello-mcp-setup--populate-backlog)
6. [Configure Hooks](#6-configure-hooks)
7. [UI Prototype with Pencil MCP](#7-ui-prototype-with-pencil-mcp)
8. [Scaffold the Backend](#8-scaffold-the-backend)
9. [Scaffold the Frontend](#9-scaffold-the-frontend)
10. [Write the Comprehensive Test Suite](#10-write-the-comprehensive-test-suite)
11. [GitHub Actions CI/CD](#11-github-actions-cicd)
12. [The Feature Creation Workflow](#12-the-feature-creation-workflow)
13. [The Six AI Features](#13-the-six-ai-features)
14. [Push to GitHub](#14-push-to-github)
15. [Deploy to Vercel via GitHub Actions](#15-deploy-to-vercel-via-github-actions)
16. [Release Tags and Notes](#16-release-tags-and-notes)
17. [Skills Deep Dive](#17-skills-deep-dive)
18. [Agents Deep Dive](#18-agents-deep-dive)
19. [Hooks Deep Dive](#19-hooks-deep-dive)
20. [Appendices](#20-appendices)

---

## 1. What You Will Build

A full-stack Learning Management System for **EduFlow Academy** — a fictional online education platform — where students browse and purchase courses, watch video lessons with progress tracking, earn certificates, and get personalised AI tutoring. Instructors create and manage course content, and an AI assistant answers student questions using the actual course materials.

*"Learn smarter, grow faster."* — EduFlow Academy

### Core Features

| Feature | Description |
|---------|-------------|
| Auth | JWT register, login, logout; three roles: Student, Instructor, Admin |
| Course Catalogue | Browse courses by category, difficulty, price; full-text search with filters |
| Course Purchase | Stripe-style payment simulation; enrolled courses in student dashboard |
| Lesson Player | Ordered video lessons with a progress bar; mark lesson complete |
| Progress Tracking | Per-student per-course completion percentage; resume from last position |
| Certificate Generation | Auto-issued PDF certificate when a student completes 100% of a course |
| Instructor Studio | Create/edit courses, add lessons with title + video URL + duration, manage enrolments |
| Reviews & Ratings | Students rate and review courses; instructor can respond |
| **6 AI Features** | Claude-powered enhancements including Course Content RAG chatbot (see Part 13) |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite (port 5173) + Tailwind CSS |
| Backend | Node.js + Express REST API (port 5000) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| File Storage | Cloudinary (course thumbnails, certificate PDFs) |
| Email | Nodemailer + Gmail SMTP (enrolment confirmations, certificates) |
| Scheduling | node-cron (weekly progress digest emails) |
| AI | Anthropic Claude API (server-side only — never import in client/) |
| RAG Store | MongoDB `ContentChunk` collection (no external vector DB needed) |
| Unit Testing | Vitest + React Testing Library |
| Integration | Supertest + mongodb-memory-server |
| E2E | Playwright |
| CI/CD | GitHub Actions (auto-deploy to Vercel on push to `main`) |
| Deployment | Vercel |

### Claude Code Features You Will Learn

| Feature | Used In | What It Does |
|---------|---------|--------------|
| Skills | Throughout | Custom `/slash` commands for repetitive tasks |
| Agents | Part 18 | Autonomous sub-processes with isolated context and scoped tools |
| Hooks | Part 19 | Shell commands that run automatically on Claude Code events |
| MCP — Trello | Parts 5, 12 | Create and manage user story cards from the terminal |
| MCP — Pencil | Part 7 | Generate UI wireframes and screens from a single structured prompt |

---

## 2. Prerequisites

### Verify Your Local Tools

Open a terminal and confirm each command returns a version number:

```bash
node --version          # must be 18 or higher
npm --version
git --version
gh --version            # GitHub CLI — install from cli.github.com
gh auth login           # authenticate with GitHub (run once)
```

### Accounts to Create

Before writing a single line of code, set up these services. All have free tiers.

| Service | What It Provides | URL |
|---------|-----------------|-----|
| **GitHub** | Source control + Actions CI/CD | github.com |
| **MongoDB Atlas** | Cloud database | mongodb.com/atlas |
| **Cloudinary** | Course thumbnails + certificate file storage | cloudinary.com |
| **Gmail** | SMTP for transactional email | gmail.com |
| **Trello** | Agile task board | trello.com |
| **Vercel** | Deployment platform | vercel.com |
| **Anthropic** | Claude API key | console.anthropic.com |

#### MongoDB Atlas Setup (5 minutes)
1. Create a free cluster (M0)
2. **Database Access** → Add user: `eduflow_user` with read/write permissions → note the password
3. **Network Access** → Add IP: `0.0.0.0/0` (allow all — fine for development)
4. **Connect** → **Drivers** → Copy the connection string:
   `mongodb+srv://eduflow_user:<password>@cluster0.xxxxx.mongodb.net/eduflow`

#### Gmail App Password Setup (2 minutes)
1. Google Account → **Security** → Enable **2-Step Verification**
2. **Security** → **App passwords** → Select app: Mail, device: Other → name it "EduFlow"
3. Copy the 16-character password — you will use it as `EMAIL_PASS`

#### Cloudinary Setup (2 minutes)
1. Log in → **Dashboard** → copy **Cloud name**, **API Key**, **API Secret**

### Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude --version
claude auth login
```

> **What is Claude Code?** Claude Code is a CLI tool that runs Claude directly in your terminal with access to your file system, shell, and Git. Unlike chatting in a browser, Claude Code can read your entire codebase, write files, run tests, and execute commands — all in one session.

### Create the GitHub Repository

```bash
# Create the repo on GitHub first, then clone it locally
gh repo create EduFlow-LMS --public --clone
cd EduFlow-LMS
```

---

## 3. Environment Setup

### Step 1 — Initialise the Directory Structure

Claude Code expects a specific folder layout. Create it now so every subsequent step has a home:

```bash
# From the EduFlow-LMS root
git init   # skip if cloned from GitHub (already initialised)
mkdir -p .claude/commands .claude/agents .github/workflows
```

**What each directory does:**

| Directory | Purpose |
|-----------|---------|
| `.claude/commands/` | Skill files — your custom `/slash` commands |
| `.claude/agents/` | Agent files — autonomous sub-process definitions |
| `.github/workflows/` | GitHub Actions YAML files for CI/CD |

### Step 2 — Create `.gitignore`

Create this file at the **project root** (`EduFlow-LMS/.gitignore`):

```
node_modules/
.env
dist/
.vercel/
.claude/activity.log
```

> `.env` files must never be committed — they contain secrets. `.claude/activity.log` is written by a hook and changes constantly; there is no value in tracking it.

### Step 3 — Create `CLAUDE.md`

`CLAUDE.md` is the single most important file in a Claude Code project. Claude reads it automatically at the start of every session. Think of it as an always-present briefing document: it tells Claude what you are building, how the code is organised, what commands to use, and what conventions to follow.

Create `CLAUDE.md` at the **project root**:

```markdown
# Learning Management System — EduFlow Academy

## Project Overview
Full-stack MERN learning management system with AI-powered course recommendations,
lesson summarisation, a quiz generator, adaptive learning paths, and a RAG chatbot
that answers student questions using the actual course content.
Built to teach Claude Code: Skills, Agents, Hooks, Trello MCP, and Pencil MCP.

## Architecture
- client/  — React 18 + Vite (port 5173), Tailwind CSS
- server/  — Node.js + Express REST API (port 5000)
- MongoDB Atlas — cloud database; ContentChunk collection is the RAG store
- Cloudinary — course thumbnails and certificate PDF storage
- Anthropic Claude API — six AI features (server-side only, never in client/)
- RAG pipeline — MongoDB $text search + Claude synthesis (no external vector DB)
- Nodemailer — enrolment confirmations, weekly digests, certificate emails

## Key Commands
- Start backend:      cd server && npm run dev
- Start frontend:     cd client && npm run dev
- Seed content:       cd server && node src/scripts/ingestContent.js  (run once after first deploy)
- Run all tests:      npm test
- Run unit tests:     npm run test:unit
- Build frontend:     cd client && npm run build
- Deploy:             /deploy

## Code Style
- ES modules (import/export) throughout — no require()
- async/await everywhere — no .then() chains
- Commit format: feat:, fix:, chore:, test:, docs:
- Never import @anthropic-ai/sdk in client/ — all AI calls go through server API routes

## Testing Requirements
- All controllers: unit tests with vi.mock() — never call real Anthropic, Cloudinary, or MongoDB Atlas in tests
- All API routes: integration tests using mongodb-memory-server
- Critical user flows: E2E tests with Playwright
- Coverage targets: 80% lines, 75% branches
- ANTHROPIC_API_KEY=test in CI — any real Claude call in a test is a bug to fix

## User Roles
- student     — browse and purchase courses, watch lessons, track progress, review courses
- instructor  — create and manage own courses and lessons, view enrolments and revenue
- admin       — full access: all users, all courses, platform analytics

## Skills Available
- /scaffold-server
- /scaffold-client
- /create-user-stories <feature description>
- /run-tests
- /unit-test-on-deploy
- /check-coverage
- /create-release-notes <tag>
- /deploy

## Agents Available
- test-reporter       — full test suite report with structured pass/fail output
- pr-reviewer         — diff analysis for quality, security, and coverage gaps
- content-auditor     — scans for student data leaks and missing auth guards
```

### Step 4 — Create `.claude/settings.json`

This file controls which shell commands Claude is allowed to run without asking you each time. Start with a minimal set — you will expand it in Part 6 when you add hooks.

Create `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(git *)",
      "Bash(npx *)",
      "Bash(vercel *)",
      "Bash(gh *)",
      "Bash(node src/scripts/*)"
    ]
  }
}
```

### Step 5 — Open Claude Code

```bash
claude
```

Claude reads `CLAUDE.md` automatically. You should see a welcome message. Type `/help` to see the skills list (it will be empty for now — you will populate it in Part 4).

> **Tip:** Keep this terminal open for the entire project. Claude maintains context about your codebase across all your prompts within a single session.

---

## 4. Create All Skills First

> **Why create Skills before writing any code?** Skills are your automation layer. Once defined, commands like `/scaffold-server`, `/run-tests`, and `/deploy` become single-word operations. Every hour you spend on Skills saves ten hours of typing the same prompts repeatedly.

Skills are Markdown files in `.claude/commands/`. Each file defines a custom `/slash` command. The exact frontmatter format:

```markdown
---
description: One-line summary shown in /help
allowed-tools: Bash, Read, Write, Grep
argument-hint: <placeholder shown in CLI>
---

You are a [role]. When invoked with $ARGUMENTS, you must:
1. [Explicit step — exact command]
2. [Step two — exact file path]

Always output:
## Result
[structured output block]
```

> **The `allowed-tools` field matters.** It restricts what Claude can do when the skill runs. A skill that only reads logs should not have `Write` in its allowed tools. This prevents accidental file changes.

---

### Skill 1 — `/scaffold-server`

**File location:** `.claude/commands/scaffold-server.md`

This skill installs all dependencies and creates the entire backend directory tree in one command. You run it once and the full server is ready.

```markdown
---
description: Scaffold the complete Express backend with all models, controllers, routes, email, and RAG pipeline
allowed-tools: Bash, Write
---

You are a backend engineer. Create the full server/ directory structure for a MERN Learning Management System:

1. Run: mkdir server && cd server && npm init -y
2. Run: npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer
         cloudinary multer-storage-cloudinary @anthropic-ai/sdk nodemailer node-cron
3. Run: npm install -D vitest supertest mongodb-memory-server nodemon @vitest/coverage-v8

4. Add to server/package.json scripts:
   "dev": "nodemon src/index.js"
   "start": "node src/index.js"
   "test": "vitest run"
   "test:unit": "vitest run --testPathPattern=unit"
   "test:coverage": "vitest run --coverage"

5. Create all files in this structure:
   server/src/
     config/db.js              — mongoose.connect using process.env.MONGODB_URI
     config/cloudinary.js      — cloudinary v2 config using env vars
     config/anthropic.js       — Anthropic SDK singleton: export { anthropic }
     config/email.js           — Nodemailer transporter using Gmail SMTP
     models/User.js            — name, email, password (bcrypt), role (student/instructor/admin),
                                  avatar (Cloudinary URL), bio, enrolledCourses[{course ref, enrolledAt, progress}],
                                  isActive, timestamps
     models/Course.js          — title, description, category (enum), difficulty (beginner/intermediate/advanced),
                                  price (Number), thumbnail (Cloudinary URL), instructor ref,
                                  lessons[{title, videoUrl, duration, order}],
                                  status (draft/published/archived),
                                  totalStudents, rating{average, count},
                                  aiSummary (cached), $text index on title+description
     models/Enrolment.js       — student ref, course ref, enrolledAt, completedLessons[lesson ids],
                                  progressPercent, completedAt (Date), certificateUrl, lastWatched,
                                  paymentRef (simulated)
     models/Review.js          — course ref, student ref, rating (1-5), comment,
                                  instructorReply, createdAt, updatedAt
     models/ContentChunk.js    — source (course title), section (lesson title),
                                  chunkIndex, content, wordCount, courseId ref, createdAt
     controllers/authController.js
     controllers/courseController.js     — getCourses, getById, createCourse, updateCourse,
                                            archiveCourse, getMyCourses, searchCourses
     controllers/enrolmentController.js  — enrolStudent, getMyEnrolments, markLessonComplete,
                                            getProgress, generateCertificate
     controllers/reviewController.js     — createReview, getCourseReviews, replyToReview
     controllers/aiController.js         — summariseCourse, generateQuiz, recommendCourses,
                                            adaptLearningPath, explainConcept, contentChat
     routes/authRoutes.js
     routes/courseRoutes.js
     routes/enrolmentRoutes.js
     routes/reviewRoutes.js
     routes/aiRoutes.js
     middleware/authMiddleware.js         — JWT protect: sets req.user
     middleware/roleMiddleware.js         — requireRole(...roles): 403 if role not in list
     middleware/rateLimit.js             — express-rate-limit: 10 req/min per user for /api/ai/*
     scripts/ingestContent.js            — reads all published Course documents, extracts lesson
                                            titles and descriptions, chunks into ~500-word blocks,
                                            upserts ContentChunk collection, creates $text index
     index.js                            — Express app, mounts all routes, starts cron jobs
   server/tests/
     unit/
     integration/
   server/.env.example
```

---

### Skill 2 — `/scaffold-client`

**File location:** `.claude/commands/scaffold-client.md`

```markdown
---
description: Scaffold the complete React + Vite + Tailwind frontend with all pages and components
allowed-tools: Bash, Write
---

You are a frontend engineer. Scaffold the full client/ directory for a MERN LMS:

1. Run: npm create vite@latest client -- --template react
2. Run: cd client && npm install react-router-dom axios react-toastify recharts react-player
3. Run: npm install -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui tailwindcss @tailwindcss/vite

4. Configure Tailwind in vite.config.js (plugin: tailwindcss())
5. Add to client/package.json scripts:
   "test": "vitest"
   "test:unit": "vitest run"
   "test:coverage": "vitest run --coverage"

6. Create all files in this structure:
   client/src/
     api/axios.js               — Axios instance: baseURL from VITE_API_URL env var,
                                  request interceptor adds Authorization: Bearer <token from localStorage>
     context/AuthContext.jsx    — user state, login/logout/register functions, token persistence
     hooks/useSSE.js            — EventSource hook: POST to url with body, append chunks,
                                  expose { content, sources, loading }, close on [DONE]
     components/
       Navbar.jsx               — logo left, search center, avatar + enrolment count right;
                                  links change based on user role
       CourseCard.jsx           — thumbnail, category badge, difficulty pill, title, instructor name,
                                  rating stars, price (or "Enrolled" badge), enrol button
       LessonSidebar.jsx        — ordered lesson list; completed lessons show green checkmark;
                                  current lesson highlighted; progress bar at top
       ProgressBar.jsx          — animated horizontal bar with percentage label
       VideoPlayer.jsx          — react-player wrapper; onProgress callback every 5 seconds
       StarRating.jsx           — interactive 1-5 star input component
       CertificateCard.jsx      — certificate display with course name, student name, date, download link
       ProtectedRoute.jsx       — redirects to /login if no auth token
       RoleRoute.jsx            — redirects to /dashboard if role not in allowedRoles prop
       AIChatbot.jsx            — floating indigo chat bubble (bottom-right, z-50);
                                  slide-in panel (right, w-96, full height);
                                  messages area (scrollable), source citation pills below AI replies,
                                  typing indicator (3 animated dots), input bar + Send button;
                                  mounts in App.jsx outside Routes (persists across pages)
     pages/
       Login.jsx
       Register.jsx
       Home.jsx                 — hero section + featured courses grid + category filter tabs
       CourseCatalogue.jsx      — search bar + filters sidebar (category, difficulty, price range) + course grid
       CourseDetail.jsx         — thumbnail banner, title, instructor, rating, description,
                                  lesson list preview (first 2 free), enrol/purchase CTA,
                                  AI Course Summary panel, Reviews section
       LessonPlayer.jsx         — VideoPlayer left, LessonSidebar right, "Mark Complete" button,
                                  AI Explain Concept panel below video
       StudentDashboard.jsx     — enrolled courses with ProgressBar per course, certificates earned grid,
                                  AI Recommended Courses section
       InstructorStudio.jsx     — my courses table (status badges), "Create Course" button,
                                  enrolment count and revenue per course
       CourseEditor.jsx         — multi-step form: basics (title, category, difficulty, price, thumbnail),
                                  lessons (add/reorder/delete lesson rows), publish toggle
       AdminPanel.jsx           — user list with role badges, course list with status, platform stats
       Certificate.jsx          — full-page certificate render + print/download
     App.jsx                    — BrowserRouter, all Route definitions, AIChatbot outside Routes
     design-reference/          — export destination for Pencil MCP PNG screenshots

Output: ## Client scaffolded successfully — list all files created
```

---

### Skill 3 — `/create-user-stories`

**File location:** `.claude/commands/create-user-stories.md`

```markdown
---
description: Generate user stories and create Trello cards for a feature
allowed-tools: Bash
argument-hint: <feature description>
---

You are a product manager. When invoked with $ARGUMENTS:

1. Parse the feature into 3-5 user stories using format: "As a [role], I want [action], so that [benefit]"
2. Write Given/When/Then acceptance criteria for each story
3. Create one Trello card per story in the Backlog list with label "Story"

Output:
## Created Stories for: $ARGUMENTS

| # | Story | Trello Card |
|---|-------|-------------|
| 1 | As a... | [URL] |

## Acceptance Criteria
[Given/When/Then per story]
```

---

### Skill 4 — `/run-tests`

**File location:** `.claude/commands/run-tests.md`

```markdown
---
description: Run the full test suite (unit + integration + E2E) and report results
allowed-tools: Bash
---

Run the full test suite in sequence:

1. cd server && npm test -- --reporter=verbose
2. cd client && npm test -- --run --reporter=verbose
3. npx playwright test --reporter=list

Output:
## Test Results — [ISO timestamp]

| Suite         | Passed | Failed | Skipped | Duration |
|---------------|--------|--------|---------|----------|
| Unit (server) | X      | X      | X       | Xs       |
| Unit (client) | X      | X      | X       | Xs       |
| Integration   | X      | X      | X       | Xs       |
| E2E           | X      | X      | X       | Xs       |

List each failure with file:line and error message.

Final status: PASS or FAIL

Exit with code 1 if any failures > 0.
```

---

### Skill 5 — `/unit-test-on-deploy`

**File location:** `.claude/commands/unit-test-on-deploy.md`

```markdown
---
description: Run unit tests only — blocks deployment if any fail
allowed-tools: Bash
---

Run unit tests for server and client:

1. cd server && npm run test:unit -- --run --reporter=verbose
2. cd client && npm run test:unit -- --run --reporter=verbose

If any test fails:
- Output: ## DEPLOYMENT BLOCKED — Fix failing tests first
- List each failure
- Exit with code 2

If all pass:
- Output: ## Unit Tests Passed — Safe to deploy
```

---

### Skill 6 — `/check-coverage`

**File location:** `.claude/commands/check-coverage.md`

```markdown
---
description: Generate coverage report and flag files below threshold
allowed-tools: Bash
---

1. cd server && npm run test:coverage -- --run
2. cd client && npm run test:coverage -- --run

Parse output and flag any file with:
- Line coverage < 80%
- Branch coverage < 75%

Output:
## Coverage Report — [timestamp]

| File | Lines | Branches | Status |
|------|-------|----------|--------|
| authController.js | 92% | 88% | ✅ |
| aiController.js   | 67% | 55% | ❌ BELOW THRESHOLD |

Overall: X% lines / X% branches
```

---

### Skill 7 — `/create-release-notes`

**File location:** `.claude/commands/create-release-notes.md`

```markdown
---
description: Generate release notes from git log and create a GitHub Release
allowed-tools: Bash
argument-hint: <version-tag e.g. v1.0.0>
---

Given $ARGUMENTS as the version tag:

1. TAG=$ARGUMENTS
2. PREV=$(git tag --sort=-version:refname | sed -n '2p')
3. git log $PREV..$TAG --oneline --no-merges
4. Categorise commits:
   - feat: → ## New Features
   - fix:  → ## Bug Fixes
   - chore:/docs:/test: → ## Maintenance
5. gh release create $TAG --notes "$(generated markdown)" --title "EduFlow LMS $TAG"

Output:
## Release $TAG created
URL: [GitHub Release URL]
```

---

### Skill 8 — `/deploy`

**File location:** `.claude/commands/deploy.md`

```markdown
---
description: Run pre-deploy checks, build, deploy to Vercel, and create a GitHub Release
allowed-tools: Bash
---

You are the deployment engineer. Run these steps in order — stop and report if any step fails:

Step 1: /unit-test-on-deploy
  If blocked: stop here and output "DEPLOY ABORTED — fix tests first"

Step 2: cd client && npm run build
  If build fails: stop and report the error

Step 3: vercel --prod --confirm
  Capture the deployment URL from output

Step 4: TAG=$(git tag --sort=-version:refname | head -1)
        gh release create $TAG --generate-notes

Output:
## Deployment Complete
- URL:     [Vercel deployment URL]
- Release: [GitHub Release URL]
```

---

### Verify Your Skills

After creating all 8 skill files, type `/help` in Claude Code:

```
Available skills:
  /scaffold-server         — Scaffold the complete Express backend...
  /scaffold-client         — Scaffold the complete React + Vite + Tailwind...
  /create-user-stories     — Generate user stories and create Trello cards...
  /run-tests               — Run the full test suite...
  /unit-test-on-deploy     — Run unit tests only — blocks deployment if any fail
  /check-coverage          — Generate coverage report and flag files below threshold
  /create-release-notes    — Generate release notes from git log...
  /deploy                  — Run pre-deploy checks, build, deploy to Vercel...
```

If a skill is missing, check that its `.md` file is in `.claude/commands/` with the correct frontmatter format.

---

## 5. Trello MCP Setup + Populate Backlog

MCP (Model Context Protocol) lets Claude Code talk to external services directly from your terminal. The Trello MCP means you never need to open a browser to manage your task board — Claude does it for you.

### Step 1 — Get Trello API Credentials

1. Go to https://trello.com/power-ups/admin
2. Click **New Power-Up** → name it "Claude Code — EduFlow"
3. Copy your **API Key**
4. Click **Generate Token** → authorise → copy the **Token**

### Step 2 — Configure the MCP Server

Edit `~/.claude/settings.json` (your global Claude Code settings — not the project-level one):

```json
{
  "mcpServers": {
    "trello": {
      "command": "npx",
      "args": ["-y", "mcp-server-trello"],
      "env": {
        "TRELLO_API_KEY": "your_api_key_here",
        "TRELLO_TOKEN": "your_token_here"
      }
    }
  }
}
```

> **Security note:** Never commit `~/.claude/settings.json`. It lives in your home directory and contains credentials.

### Step 3 — Create the Board Structure

In Claude Code chat:

```
Use the Trello MCP to create 4 lists on the "EduFlow LMS" board:
Backlog, In Progress, In Review, Done
```

You should see Claude call the Trello MCP tool and report back the list URLs.

### Step 4 — Populate the Backlog

Run each command. Claude creates Trello cards automatically:

```
/create-user-stories "User authentication — register, login, logout with student, instructor, and admin roles"
```

```
/create-user-stories "Course catalogue — browse, search, and filter courses by category, difficulty, and price"
```

```
/create-user-stories "Course enrolment and payment — students purchase courses, receive email confirmation, and access all lessons"
```

```
/create-user-stories "Lesson player and progress tracking — watch lessons with a video player, mark complete, resume from last position"
```

```
/create-user-stories "Instructor studio — create and manage courses with a multi-step editor, add lessons, view enrolment stats"
```

```
/create-user-stories "Reviews and ratings — students rate and review completed courses; instructors reply to reviews"
```

```
/create-user-stories "AI course assistant — students ask questions about a course and Claude answers from the actual lesson content"
```

### What the Skill Does Internally

```
/create-user-stories "Lesson player and progress tracking..."
       │
       Claude parses $ARGUMENTS
             │
             Generates 3-5 "As a / I want / so that" stories
             Writes Given/When/Then acceptance criteria per story
                   │
                   Calls Trello MCP: mcp__trello__add_card_to_list
                         │
                         Card created in Backlog with label "Story"
                         Returns Trello card URL
       │
       Output shown in Claude Code chat:
       ## Created Stories for: Lesson player...
       | 1 | As a student... | https://trello.com/c/abc123 |
```

### Moving Cards During Development

When you start working on a feature:
```
Using Trello MCP, move the "Course enrolment" story cards to In Progress
```

When done:
```
Using Trello MCP, move the "Course enrolment" cards to Done
```

---

## 6. Configure Hooks

Hooks are shell commands that fire automatically when specific Claude Code events occur. You configure them once in `.claude/settings.json` and they protect your project forever — no manual effort required.

Update `.claude/settings.json` to add hooks alongside the existing permissions:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(git *)",
      "Bash(npx *)",
      "Bash(vercel *)",
      "Bash(gh *)",
      "Bash(node src/scripts/*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git push*)",
        "hooks": [{
          "type": "command",
          "command": "cd \"$CLAUDE_PROJECT_DIR\" && cd server && npm run test:unit -- --run 2>&1; if [ $? -ne 0 ]; then echo 'BLOCKED: unit tests failed. Fix before pushing.' >&2; exit 2; fi"
        }]
      },
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "echo \"[$(date '+%Y-%m-%d %H:%M:%S')] WRITE: $CLAUDE_TOOL_INPUT_FILE_PATH\" >> \"$CLAUDE_PROJECT_DIR/.claude/activity.log\""
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash(vercel --prod*)",
        "hooks": [{
          "type": "command",
          "command": "cd \"$CLAUDE_PROJECT_DIR\" && TAG=$(git tag --sort=-version:refname | head -1) && PREV=$(git tag --sort=-version:refname | sed -n '2p') && echo \"## Release $TAG\" > /tmp/rn.md && git log $PREV..$TAG --oneline --no-merges >> /tmp/rn.md && gh release create $TAG --notes-file /tmp/rn.md --title \"EduFlow LMS $TAG\""
        }]
      }
    ],
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "printf '\\a' && echo '[Claude Code] Task complete.'"
        }]
      }
    ]
  }
}
```

### What Each Hook Does

| Event | Matcher | What Happens | Blocks? |
|-------|---------|-------------|---------|
| `PreToolUse` | `Bash(git push*)` | Runs server unit tests silently before every push | **Yes** — exit 2 cancels the push |
| `PreToolUse` | `Write` | Logs every file Claude writes to `.claude/activity.log` | No |
| `PostToolUse` | `Bash(vercel --prod*)` | Reads git log, creates a GitHub Release automatically | No |
| `Stop` | (all) | Terminal bell + message when Claude finishes a task | No |

### Why Hooks Beat Manual Reminders

Without hooks, you must remember to run tests before every push. With the `PreToolUse` hook, it is physically impossible to push untested code — Claude Code enforces the check at the tool call layer before `git push` can execute.

When Claude Code is the one pushing (via `/deploy` or a chat instruction), it sees the failing tests in context and can fix them before retrying — fully automated recovery.

---

## 7. UI Prototype with Pencil MCP

Before writing a single line of application code, use Pencil MCP to generate your UI screens. This gives you a visual target that the frontend scaffold follows, dramatically reducing guesswork and rework.

> **Key principle:** The frontend code generated in Part 9 should mirror the Pencil designs. When you scaffold the client, reference these screens explicitly — say "follow the Pencil design for Screen 2" and Claude will match the layout, colour palette, and component structure.

### Step 1 — Open a New Design File

In Claude Code chat:

```
Using Pencil MCP, open a new design file for the EduFlow LMS.
```

### Step 2 — Load the Style Guide

```
Using Pencil MCP, get guidelines for topic: web-app
```

Then:

```
Using Pencil MCP, get style guide tags, then fetch a style guide appropriate for
a modern online learning platform — clean, engaging, trustworthy, with an
indigo and white palette reminiscent of platforms like Udemy or Coursera.
```

### Step 3 — Generate Each Screen

Send each prompt separately. After each one, take a screenshot and validate before moving on.

**Screen 1 — Login / Register**
```
Design a Login/Register page for EduFlow LMS.
Centered card with logo top. Tab switcher: Login / Register.
Login: email field, password field, "Forgot password?" link, indigo CTA "Sign In".
Register: name, email, password, role selector radio (Student / Instructor), indigo CTA "Create Account".
Subtle indigo gradient background. White card with rounded corners and shadow.
```

**Screen 2 — Course Catalogue (Home)**
```
Design the Course Catalogue page for EduFlow LMS.
Navbar: logo left, search bar center (placeholder "Search courses..."), avatar + bell right.
Left sidebar (w-64): Category filter checkboxes (Development, Design, Business, Marketing),
Difficulty radio (All / Beginner / Intermediate / Advanced), Price slider (Free to $200).
Right: grid of CourseCards (3 columns). Each CourseCard:
  - thumbnail image top
  - category badge (indigo pill) top-left over image
  - difficulty pill (green/amber/red) top-right over image
  - title bold, instructor name small grey below
  - star rating (★★★★☆ 4.2, 1.2k reviews) row
  - price "$49" or "Enrolled ✓" badge
  - "Enrol Now" or "Continue" button bottom
Indigo #4F46E5 primary. White cards. Slate-100 sidebar background.
```

**Screen 3 — Course Detail**
```
Design a Course Detail page for EduFlow LMS.
Full-width hero banner with course thumbnail and gradient overlay.
Below: two-column layout.
Left (2/3):
  - Title H1, instructor row (avatar + name + rating), description paragraph
  - "What you'll learn" checklist (4 items with checkmark icons)
  - Lesson list preview: first 2 lessons unlocked (play icon), rest locked (lock icon)
  - Reviews section: overall star rating + bar chart breakdown (5★ to 1★), 3 review cards
Right (1/3) — sticky purchase card:
  - Course thumbnail image
  - Price "$49" large, original "$99" struck through
  - "Enrol Now" full-width indigo button
  - "AI Course Summary" collapsible card (indigo border, summary text inside)
  - 30-day money-back guarantee text
```

**Screen 4 — Lesson Player**
```
Design the Lesson Player page for EduFlow LMS.
Two-column layout (no navbar, full screen).
Left (3/4): VideoPlayer (black background, 16:9, controls at bottom), lesson title H2 below,
"Mark as Complete" indigo button bottom-left, "AI Explain Concept" panel below video
(indigo border, text input "Ask about this lesson...", streaming answer area).
Right (1/4): LessonSidebar — course title at top, progress bar (65% complete),
scrollable lesson list. Completed lessons: green checkmark + title strikethrough.
Current lesson: indigo background highlight. Locked lessons: grey + lock icon.
```

**Screen 5 — Student Dashboard**
```
Design the Student Dashboard for EduFlow LMS.
Navbar + welcome headline "Continue Learning, [Name]".
Section 1 — In Progress (horizontal scroll row of CourseCards with ProgressBar at bottom of each card).
Section 2 — Completed Certificates (grid of CertificateCard: gold border, course name, completion date, "Download" link).
Section 3 — Recommended For You (AI recommendations row with "Recommended" indigo badge on each card).
Stats row at top: Courses Enrolled (4), Lessons Completed (23), Certificates Earned (2), Hours Watched (18).
```

**Screen 6 — Instructor Studio**
```
Design the Instructor Studio for EduFlow LMS.
Left sidebar: My Courses, Analytics, Payouts, Settings.
Main area:
  - Header: "My Courses" + "Create New Course" indigo button top-right
  - Table: Course Title | Status (Draft/Published/Archived badge) | Students | Revenue | Actions (Edit/Archive)
  - Revenue summary card: total earnings this month with a recharts LineChart (last 6 months)
  - Top 3 courses by enrolment (mini leaderboard with rank number, thumbnail, enrolment count)
```

**Screen 7 — Course Editor (Multi-Step)**
```
Design the Course Editor multi-step form for EduFlow LMS.
Step indicator at top: 1 Basics → 2 Lessons → 3 Publish (step 2 active).
Step 1 — Basics: title input, category dropdown, difficulty radio, price input, thumbnail upload zone.
Step 2 — Lessons: drag-and-drop lesson list. Each row: drag handle ≡, lesson title input, video URL input, duration, delete icon. "+ Add Lesson" button at bottom.
Step 3 — Publish: review summary card (title, category, lesson count, price), status toggle (Draft / Published), "Publish Course" indigo CTA.
White form on slate-50 background. Indigo active step indicator.
```

### Step 4 — Validate Each Screen

After each screen:

```
Using Pencil MCP, take a screenshot of the current document.
```

Review carefully. Iterate with targeted adjustments:
```
On Screen 4, make the LessonSidebar narrower and add a "Back to Course" link at the top.
```

### Step 5 — Export to Design Reference

```
Export all 7 screens as PNG files to client/src/design-reference/
```

> **Using the designs when coding:** When you run `/scaffold-client` in Part 9, explicitly tell Claude: *"Follow the Pencil design exports in `client/src/design-reference/` for the component layouts, colour palette (indigo #4F46E5, slate sidebar), and card structures."* Claude will read the exported images and match the design.

---

## 8. Scaffold the Backend

With your skills created, hooks configured, and UI designs exported, scaffold the entire backend in one command:

```
/scaffold-server
```

Claude creates the full `server/` directory tree. When it finishes, you will see:

```
## Server scaffolded successfully — 43 files created

server/src/config/db.js
server/src/config/cloudinary.js
server/src/config/anthropic.js
server/src/config/email.js
server/src/models/User.js
server/src/models/Course.js
server/src/models/Enrolment.js
server/src/models/Review.js
server/src/models/ContentChunk.js
server/src/controllers/authController.js
... (all controllers, routes, middleware, scripts)
server/.env.example
```

### Configure Your Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your real credentials:

```env
# Database
MONGODB_URI=mongodb+srv://eduflow_user:yourpassword@cluster0.xxxxx.mongodb.net/eduflow

# Auth
JWT_SECRET=generate_a_64_char_hex_string_here

# Anthropic (server-side only — NEVER use in client/)
ANTHROPIC_API_KEY=sk-ant-...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASS=your_16_char_app_password

# App
PORT=5000
CLIENT_URL=http://localhost:5173
```

> **Generate a secure JWT secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Verify the Scaffold

```bash
cd server && npm run dev
```

Expected output:
```
MongoDB connected ✓
EduFlow API running on port 5000
Weekly digest cron job registered
```

Test the health check:
```bash
curl http://localhost:5000/api/health
# {"status":"ok","service":"EduFlow LMS API","timestamp":"..."}
```

### Understanding the Key Models

#### User Model — Three Roles

```javascript
// server/src/models/User.js
{
  name: String,
  email: { type: String, unique: true },
  password: String,         // bcrypt hashed — never stored plain
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  avatar: String,           // Cloudinary URL
  bio: String,
  enrolledCourses: [{
    course: { type: ObjectId, ref: 'Course' },
    enrolledAt: Date
  }],
  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

#### Course Model — The Content Core

```javascript
// server/src/models/Course.js
{
  title: String,            // $text indexed
  description: String,      // $text indexed
  category: {
    type: String,
    enum: ['Development', 'Design', 'Business', 'Marketing', 'Photography', 'Music']
  },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  price: { type: Number, min: 0 },   // 0 = free
  thumbnail: String,                  // Cloudinary URL
  instructor: { type: ObjectId, ref: 'User' },
  lessons: [{
    title: String,
    videoUrl: String,
    duration: Number,        // seconds
    order: Number            // sort order
  }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  totalStudents: { type: Number, default: 0 },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  aiSummary: Object          // cached Claude summary — re-generated when course is updated
}
```

#### Enrolment Model — Tracks Progress

```javascript
// server/src/models/Enrolment.js
{
  student: { type: ObjectId, ref: 'User' },
  course: { type: ObjectId, ref: 'Course' },
  enrolledAt: { type: Date, default: Date.now },
  completedLessons: [String],     // array of lesson._id strings
  progressPercent: { type: Number, default: 0 },
  completedAt: Date,              // set when progressPercent reaches 100
  certificateUrl: String,         // Cloudinary URL of generated PDF
  lastWatched: {
    lessonId: String,
    position: Number              // seconds into video
  },
  paymentRef: String              // simulated payment reference
}
```

### The Role-Based Middleware

Every protected route uses two middleware functions:

```javascript
// server/src/middleware/authMiddleware.js
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// server/src/middleware/roleMiddleware.js
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }
  next();
};
```

Usage in routes:
```javascript
// Only instructors and admins can create courses
router.post('/', protect, requireRole('instructor', 'admin'), createCourse);

// Any authenticated user can browse
router.get('/', protect, getCourses);
```

---

## 9. Scaffold the Frontend

With the backend running, scaffold the frontend:

```
/scaffold-client
```

> **Design integration:** Say this in Claude Code chat before the scaffold runs:
> ```
> /scaffold-client
> Follow the Pencil design exports in client/src/design-reference/ for the layouts,
> colour palette (indigo #4F46E5 primary, slate-100 sidebars), and component structure.
> ```
> Claude will read the design reference images and match the visual target.

Configure the environment:

```bash
echo "VITE_API_URL=http://localhost:5000/api" > client/.env
```

Start the frontend:

```bash
cd client && npm run dev
```

Navigate to `http://localhost:5173` — you should see the EduFlow login page.

### The SSE Hook for Streaming AI Responses

All six AI features that stream responses use this hook. It is created by `/scaffold-client` but understanding it helps you debug streaming issues:

```javascript
// client/src/hooks/useSSE.js
import { useState, useCallback } from 'react';

export function useSSE() {
  const [content, setContent] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const stream = useCallback(async (url, body) => {
    setContent('');
    setSources([]);
    setLoading(true);

    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const data = line.replace('data: ', '');
        if (data === '[DONE]') { setLoading(false); continue; }
        try {
          const parsed = JSON.parse(data);
          if (parsed.chunk) setContent(prev => prev + parsed.chunk);
          if (parsed.sources) setSources(parsed.sources);
        } catch {}
      }
    }
    setLoading(false);
  }, []);

  return { content, sources, loading, stream };
}
```

### The Role-Aware Router

```jsx
// client/src/components/RoleRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}
```

```jsx
// client/src/App.jsx — example usage
<Route path="/studio" element={
  <RoleRoute allowedRoles={['instructor', 'admin']}>
    <InstructorStudio />
  </RoleRoute>
} />
<Route path="/admin" element={
  <RoleRoute allowedRoles={['admin']}>
    <AdminPanel />
  </RoleRoute>
} />
```

---

## 10. Write the Comprehensive Test Suite

Tests are written after scaffolding because you can now reference the real file structure. Use four targeted prompts — one per test type.

### Server Unit Tests

```
Write unit tests for server/src/controllers/authController.js using Vitest.
Save in server/tests/unit/authController.test.js.

Tests to cover:
- register: success creates user + returns JWT; duplicate email returns 409;
  missing name/email/password returns 400; invalid role returns 400;
  password stored as bcrypt hash (never plain text)
- login: correct credentials return JWT + user object without password field;
  wrong password returns 401; unknown email returns 401;
  inactive account (isActive: false) returns 403
- getProfile: returns logged-in user without password field

Mock: vi.mock('../models/User.js'), vi.mock('bcryptjs'), vi.mock('jsonwebtoken')
Never call real MongoDB.
```

```
Write unit tests for server/src/controllers/enrolmentController.js using Vitest.
Save in server/tests/unit/enrolmentController.test.js.

Tests to cover:
- enrolStudent: success creates Enrolment, increments Course.totalStudents;
  already enrolled returns 400; course not found returns 404
- markLessonComplete: adds lessonId to completedLessons; updates progressPercent;
  at 100% sets completedAt and triggers certificate generation mock;
  lesson already complete is idempotent (no duplicate entries)
- getProgress: returns progressPercent, completedLessons, lastWatched for enrolled student;
  not enrolled returns 403

Mock Enrolment, Course, User models. Mock certificate generation function.
```

```
Write unit tests for server/src/controllers/aiController.js using Vitest.
Save in server/tests/unit/aiController.test.js.

Tests to cover:
- summariseCourse: cache hit returns Course.aiSummary without calling Anthropic;
  cache miss calls claude-3-5-haiku-20241022 with JSON mode, parses response, saves to Course.aiSummary;
  course not found returns 404
- generateQuiz: calls Anthropic with lesson content; returns parsed questions array;
  lesson not found returns 404; invalid JSON from Claude returns 500
- contentChat: calls keyword extraction (haiku), retrieves ContentChunks via $text search,
  calls answer synthesis (sonnet) with SSE streaming; empty query returns 400

IMPORTANT: Always mock @anthropic-ai/sdk with vi.mock. Never call real Anthropic API.
ANTHROPIC_API_KEY=test must be set in process.env for all tests.
```

### Server Integration Tests

```
Write integration tests using Supertest and mongodb-memory-server.
Save in server/tests/integration/learningFlow.test.js.

Test the complete student learning flow:

1. Register a Student (POST /api/auth/register { role: 'student' })
2. Login → receive JWT
3. Register an Instructor (separate registration)
4. Instructor creates a Course (POST /api/courses) with 3 lessons
5. Instructor publishes the course (PATCH /api/courses/:id { status: 'published' })
6. Student searches for the course (GET /api/courses?search=<title>)
7. Student enrols (POST /api/enrolments { courseId })
8. Student marks lesson 1 complete (PATCH /api/enrolments/:id/complete { lessonId })
9. Verify progressPercent = 33 (1 of 3 lessons done)
10. Student marks lessons 2 and 3 complete
11. Verify progressPercent = 100 and completedAt is set
12. Student posts a review (POST /api/reviews { courseId, rating: 5, comment: "Great!" })

Use mongodb-memory-server — no real Atlas connection needed.
Set ANTHROPIC_API_KEY=test — no real AI calls in integration tests.
```

### E2E Tests (Playwright)

```
Write Playwright E2E tests. Save in e2e/lmsFlow.spec.js.

Setup: seed test users before tests run (student@eduflow.test, instructor@eduflow.test).

Test 1 — Student completes a lesson:
1. Navigate to /login; fill student@eduflow.test credentials; click Sign In
2. Navigate to /courses; verify course grid renders with at least 1 card
3. Click first course card → CourseDetail page loads
4. Click "Enrol Now" → verify "Enrolled ✓" state updates
5. Click "Start Learning" → LessonPlayer loads
6. Wait for VideoPlayer to be visible
7. Click "Mark as Complete" → verify lesson gets checkmark in LessonSidebar
8. Verify ProgressBar updates above 0%

Test 2 — Instructor creates a course:
1. Login as instructor@eduflow.test
2. Navigate to /studio
3. Click "Create New Course"
4. Step 1: fill title "Test Course by Playwright", select category "Development", price 29
5. Step 2: click "Add Lesson", fill title "Introduction", video URL, duration 600
6. Step 3: click "Publish Course"
7. Verify course appears in "My Courses" table with "Published" badge

Test 3 — Student gets AI explanation:
1. Login as student; navigate to an enrolled course's LessonPlayer
2. Click "AI Explain Concept"
3. Type "What is the main topic of this lesson?" in the input
4. Click Send
5. Verify typing indicator appears then disappears
6. Verify AI response text renders in the panel (non-empty)
```

---

## 11. GitHub Actions CI/CD

GitHub Actions automatically runs tests and deploys to Vercel every time you push to `main`. This is separate from the local Hooks — it's your cloud quality gate.

### File Location

Create `.github/workflows/ci.yml`:

> **Where this file goes:** `.github/workflows/ci.yml` must be at the repository root level — i.e., `EduFlow-LMS/.github/workflows/ci.yml`. GitHub Actions only reads workflow files from this exact path.

```yaml
name: EduFlow LMS CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'

jobs:
  # ──────────────────────────────────────────────
  # Job 1: Run all tests
  # ──────────────────────────────────────────────
  test:
    name: Test Suite
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: |
            server/package-lock.json
            client/package-lock.json

      - name: Install server dependencies
        run: cd server && npm ci

      - name: Install client dependencies
        run: cd client && npm ci

      - name: Run server unit tests
        run: cd server && npm run test:unit -- --run --reporter=verbose
        env:
          JWT_SECRET: ci_test_secret_eduflow_lms
          ANTHROPIC_API_KEY: test_key_always_mocked_never_real
          # No MONGODB_URI — unit tests mock mongoose entirely

      - name: Run server integration tests
        run: cd server && npm test -- --run
        env:
          JWT_SECRET: ci_test_secret_eduflow_lms
          ANTHROPIC_API_KEY: test_key_always_mocked_never_real
          # mongodb-memory-server spins up an in-memory MongoDB — no Atlas needed

      - name: Run client unit tests
        run: cd client && npm run test:unit -- --run

      - name: Generate coverage report
        run: cd server && npm run test:coverage -- --run
        env:
          JWT_SECRET: ci_test_secret_eduflow_lms
          ANTHROPIC_API_KEY: test_key

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./server/coverage/lcov.info,./client/coverage/lcov.info
          flags: eduflow-lms
        continue-on-error: true   # coverage upload failure should not block deploy

  # ──────────────────────────────────────────────
  # Job 2: Build check
  # ──────────────────────────────────────────────
  build:
    name: Build Check
    runs-on: ubuntu-latest
    needs: test    # only runs if test job passes

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install and build client
        run: cd client && npm ci && npm run build
        env:
          VITE_API_URL: https://placeholder.vercel.app/api
          # Placeholder URL — the real URL is set in Vercel environment variables

  # ──────────────────────────────────────────────
  # Job 3: Deploy to Vercel (main branch only)
  # ──────────────────────────────────────────────
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: [test, build]    # only runs if both previous jobs pass
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    # ↑ Auto-deploys on every push to main — never on PRs or develop branch

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel Production
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --confirm
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### The Three-Job Pipeline Explained

```
Push to main
     │
     ├─ Job 1: test   ── server unit tests
     │                ── server integration tests (mongodb-memory-server)
     │                ── client unit tests
     │                ── coverage report → Codecov
     │                FAIL? Pipeline stops here. Nothing deploys.
     │
     ├─ Job 2: build  ── client npm ci && npm run build
     │  (needs: test) FAIL? Pipeline stops. Nothing deploys.
     │
     └─ Job 3: deploy ── npx vercel --prod
        (needs: test,    Runs ONLY on: push to main (not PRs, not develop)
         build)
```

### Set GitHub Secrets

In your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | How to Get It |
|--------|--------------|
| `VERCEL_TOKEN` | Vercel dashboard → **Account Settings → Tokens** → Create token |
| `VERCEL_ORG_ID` | Run `vercel link` locally → read from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same `.vercel/project.json` file |

> **Important rule:** `ANTHROPIC_API_KEY` is **NOT** a GitHub secret. Real AI calls must never fire in CI. Unit and integration tests always mock the Anthropic SDK with `vi.mock('@anthropic-ai/sdk')`. Any test that makes a real Anthropic call is a bug.

---

## 12. The Feature Creation Workflow

This is the loop you repeat for every feature. The example below walks through **AI Quiz Generator** — Feature 2 of the six AI features — step by step.

### Step 1 — Create User Stories

```
/create-user-stories "AI Quiz Generator — after watching a lesson, students can request
a Claude-generated 5-question multiple choice quiz on the lesson content, with immediate
feedback and score, and a retry option"
```

Expected output:

```
## Created Stories for: AI Quiz Generator

| # | Story | Trello Card |
|---|-------|-------------|
| 1 | As a student, I want a quiz after each lesson, so I can test my understanding | https://trello.com/c/abc1 |
| 2 | As a student, I want immediate right/wrong feedback per question, so I can learn from mistakes | https://trello.com/c/abc2 |
| 3 | As an instructor, I want students to be tested on my content, so I can ensure lesson retention | https://trello.com/c/abc3 |
```

### Step 2 — Move Cards to In Progress

```
Using Trello MCP, move the "AI Quiz Generator" cards from Backlog to In Progress
```

### Step 3 — Prototype the UI Screen (if not already in Pencil designs)

```
Using Pencil MCP, design a Quiz Panel for EduFlow LMS.
Displayed below the VideoPlayer on the LessonPlayer page.
"Generate Quiz" indigo button at top.
When quiz loads: question number header (Question 1 of 5),
question text bold, 4 answer options as radio buttons (A, B, C, D).
"Submit Answer" button below options.
After submit: correct answer highlight green, wrong answer highlight red,
brief explanation text in grey italic.
"Next Question" button. After question 5: score card ("You scored 4/5 — Great job!")
with "Retry" and "Next Lesson" buttons.
```

### Step 4 — Build the Backend

```
Create POST /api/ai/generate-quiz in server/src/controllers/aiController.js.
Accept { courseId, lessonId } in req.body.
Protect with authMiddleware + requireRole('student', 'instructor', 'admin') + aiRateLimit.

Validate: courseId and lessonId must be provided. Return 400 if missing.
Fetch the Course by courseId. Find the lesson by lessonId in course.lessons[].
If course or lesson not found: return 404.

Check that req.user has an active Enrolment for this course.
If not enrolled: return 403 "You must be enrolled to access quizzes."

Call claude-3-5-haiku-20241022 with JSON mode.
System: 'Return ONLY valid JSON. No markdown. No prose outside the JSON object.'
User prompt: "Generate a 5-question multiple choice quiz on this lesson:
Title: ${lesson.title}
Content: ${lesson.description}
Each question must have exactly 4 options (A, B, C, D). Indicate the correct answer.
Include a brief explanation (1 sentence) for the correct answer."

Expected JSON:
{
  questions: [{
    question: string,
    options: { A: string, B: string, C: string, D: string },
    correct: "A" | "B" | "C" | "D",
    explanation: string
  }]
}

On JSON parse error: return 500 { message: "Quiz generation failed. Please try again." }
Return the parsed questions array.

Add the route: POST /api/ai/generate-quiz in server/src/routes/aiRoutes.js
```

### Step 5 — Build the Frontend

```
Create client/src/components/QuizPanel.jsx.
Props: { courseId, lessonId }.

State: quiz (array of questions | null), currentIndex (0), selectedAnswer (null),
submitted (boolean), score (0), quizComplete (boolean), loading (boolean), error (string | null).

On "Generate Quiz" click:
  Set loading: true. Call POST /api/ai/generate-quiz with { courseId, lessonId }.
  On success: set quiz = response.questions, currentIndex = 0.
  On error: set error message. Show retry button.
  Set loading: false.

Render:
  - If !quiz and !loading: show "Generate Quiz" indigo button.
  - If loading: show skeleton loader (5 pulsing lines).
  - If quiz and !quizComplete:
      Question header "Question {currentIndex + 1} of {quiz.length}"
      Question text in bold.
      4 radio options (A, B, C, D).
      "Submit Answer" button (disabled until option selected).
      After submit: colour the selected option (green if correct, red if wrong).
      Show explanation text in grey italic.
      "Next Question" button — advances currentIndex; if last question, set quizComplete: true.
  - If quizComplete:
      Score card: "You scored {score} / {quiz.length}"
      Colour: green if score >= 4, amber if 3, red if <= 2.
      "Retry Quiz" button (resets all state).
      "Continue to Next Lesson" button (links to next lesson in sidebar).

Mount QuizPanel in LessonPlayer.jsx below the VideoPlayer component.
Import and use only when student role is confirmed via AuthContext.
```

### Step 6 — Write Tests

```
Write unit tests for the generateQuiz function in server/tests/unit/aiController.test.js.

Add these test cases (do not remove existing tests):
- Returns 400 if courseId or lessonId is missing
- Returns 404 if course not found
- Returns 403 if student is not enrolled in the course
- Calls claude-3-5-haiku-20241022 with JSON mode
- Returns parsed questions array on success (5 questions, each with A/B/C/D options + correct + explanation)
- Returns 500 with user-friendly message when Anthropic returns invalid JSON

Always vi.mock('@anthropic-ai/sdk'). ANTHROPIC_API_KEY=test in env.
```

```
Write React Testing Library tests for QuizPanel.jsx.
Save in client/src/tests/QuizPanel.test.jsx.

Tests:
- Renders "Generate Quiz" button when no quiz is loaded
- Shows skeleton loader while API call is pending
- Renders question text and 4 radio options after quiz loads
- "Submit Answer" is disabled until an option is selected
- Shows green highlight on correct option after submit
- Shows red highlight on wrong option after submit, plus correct answer indication
- Shows explanation text after submit
- Score card renders after all 5 questions answered
- "Retry Quiz" resets state back to question 1
```

### Step 7 — Run Tests

```
/run-tests
```

All green? Commit:

```bash
git add -A
git commit -m "feat: add AI quiz generator for lesson assessment"
```

### Step 8 — Close Trello Cards

```
Using Trello MCP, move the "AI Quiz Generator" cards to Done
```

Repeat this 8-step loop for every feature.

---

## 13. The Six AI Features

Each feature follows the Feature Creation Workflow from Part 12. Backend and frontend prompts are provided for each.

---

### Feature 1 — AI Course Summariser (JSON + Cache)

**Endpoint:** `POST /api/ai/summarise-course` | **Model:** `claude-3-5-haiku-20241022`

```
/create-user-stories "AI Course Summariser — when a student opens a course detail page,
Claude generates a structured summary of the course covering key topics, learning outcomes,
and difficulty assessment, cached in the Course document and refreshed when the course is updated"
```

**Backend prompt:**
```
Create POST /api/ai/summarise-course in aiController.js.
Accept { courseId } in req.body. Protect with authMiddleware + aiRateLimit.
Fetch Course by ID with lessons populated. If Course.aiSummary exists and is non-empty: return it immediately (cache hit).
Fetch all lesson titles and descriptions from the course.
Call claude-3-5-haiku-20241022 with JSON mode.
System: 'Return ONLY valid JSON. No markdown. No prose outside JSON.'
User prompt: include course title, category, difficulty, all lesson titles and descriptions.
Expected JSON:
{
  keyTopics: string[],        // 4-6 bullet points of what the course covers
  learningOutcomes: string[], // 3-5 "By the end you will be able to..." statements
  difficultyAssessment: string, // 2-3 sentence paragraph on prerequisites and pace
  estimatedHours: number,     // total lesson duration in hours (round to 0.5)
  targetAudience: string      // 1 sentence describing ideal student
}
Parse JSON. Save to Course.aiSummary. Return it.
Add a post-save hook on the Course schema: clear Course.aiSummary whenever lessons[] is modified.
Add route: POST /api/ai/summarise-course in aiRoutes.js.
```

**Frontend prompt:**
```
Create a collapsible "AI Course Summary" card in CourseDetail.jsx.
Position: right-hand sticky purchase card, below the price and enrol button.
Collapsed by default. Show a "✨ View AI Summary" toggle link.
On first expand: call POST /api/ai/summarise-course with the courseId.
Show skeleton loader (4 pulsing lines) while loading.
Expanded content:
  - "Key Topics" section: tag chips in indigo for each topic
  - "Learning Outcomes" section: bulleted list with checkmark icons
  - "Who is this for?" paragraph in grey italic
  - "Estimated time" row: clock icon + hours
Collapse on second click (chevron icon top-right).
Show "Last updated: [timestamp]" in small grey text.
```

---

### Feature 2 — AI Quiz Generator (JSON)

*(Already built step-by-step in Part 12 — Feature Creation Workflow)*

**Endpoint:** `POST /api/ai/generate-quiz` | **Model:** `claude-3-5-haiku-20241022`

See Part 12, Steps 4 and 5 for the full backend and frontend prompts.

---

### Feature 3 — AI Course Recommender (Batch)

**Endpoint:** `POST /api/ai/recommend-courses` | **Model:** `claude-3-5-haiku-20241022`

```
/create-user-stories "AI Course Recommender — Claude analyses a student's enrolled courses
and completed lessons to infer their learning preferences, then returns 4 personalised
course recommendations from the catalogue with an explanation of why each was chosen"
```

**Backend prompt:**
```
Create POST /api/ai/recommend-courses in aiController.js.
Protect with authMiddleware + requireRole('student') + aiRateLimit.
Fetch all Enrolments for req.user._id, populate course (title, category, difficulty).
If fewer than 1 enrolment: return 400 "Enrol in at least one course to get recommendations."
Call claude-3-5-haiku-20241022 with JSON mode.
System: 'Return ONLY valid JSON. No markdown.'
User prompt: list enrolled courses (title, category, difficulty, progressPercent).
Ask Claude to infer:
{
  preferredCategories: string[],
  preferredDifficulty: string,
  learningGoals: string,
  explanation: string   // why these preferences were inferred
}
Parse JSON. Build MongoDB query:
  category $in preferredCategories, difficulty: preferredDifficulty,
  status: 'published', exclude already-enrolled course IDs, limit 4.
Return { recommendations: Course[], explanation, preferences }.
```

**Frontend prompt:**
```
Create a "Recommended For You" section in StudentDashboard.jsx.
Place it below the "In Progress" courses row.
On component mount, call POST /api/ai/recommend-courses.
Show a skeleton loader (4 pulsing cards) while loading.
Display Claude's explanation in italic below the section heading.
Render up to 4 CourseCards with an "AI Pick ✨" indigo badge top-left.
If fewer than 1 course enrolled, show an empty state card:
  "Enrol in your first course to get personalised recommendations."
```

---

### Feature 4 — AI Learning Path Advisor (Streaming)

**Endpoint:** `POST /api/ai/learning-path` | **Model:** `claude-3-5-sonnet-20241022`

```
/create-user-stories "AI Learning Path Advisor — a student enters a career goal
(e.g. 'Become a full-stack developer in 6 months') and Claude streams a personalised
week-by-week learning path using only courses available in the EduFlow catalogue"
```

**Backend prompt:**
```
Create POST /api/ai/learning-path in aiController.js.
Accept { goal: string } in req.body. Protect with authMiddleware + requireRole('student') + aiRateLimit.
Validate: goal must be a non-empty string. Return 400 if missing.
Fetch all published courses (title, category, difficulty, price, totalStudents).
Fetch student's current enrolments.
Set SSE headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive.
Call claude-3-5-sonnet-20241022 with stream.
System: "You are an expert curriculum designer. Create personalised learning paths using
ONLY the courses provided. Never suggest external resources. Format using Markdown headings
and bullet points. Be specific about which week to take which course."
User prompt: include goal, full published course catalogue (title + category + difficulty),
and student's already-enrolled courses.
On each text delta: res.write("data: " + JSON.stringify({ chunk: text }) + "\n\n").
On stream end: res.write("data: [DONE]\n\n"); res.end().
Add route: POST /api/ai/learning-path in aiRoutes.js.
```

**Frontend prompt:**
```
Create client/src/pages/LearningPath.jsx.
Accessible from StudentDashboard via "Get My Learning Path" button.
Show a large textarea: "What is your learning goal?" (placeholder: "e.g. Become a data scientist in 3 months")
"Generate My Path" indigo button.
On submit: call useSSE hook to stream POST /api/ai/learning-path.
Display streaming Markdown text in a styled panel using a simple markdown renderer.
Show animated typing cursor during streaming.
After [DONE]: show a "Save Path" button (stores the text in localStorage as backup)
and "Browse Courses" button linking to /courses.
Add a link "Get My Learning Path" to the StudentDashboard stats row.
```

---

### Feature 5 — AI Concept Explainer (Streaming)

**Endpoint:** `POST /api/ai/explain-concept` | **Model:** `claude-3-5-sonnet-20241022`

```
/create-user-stories "AI Concept Explainer — while watching a lesson, a student can highlight
or type any concept they don't understand, and Claude streams an explanation tailored to
the course's difficulty level with analogies and examples"
```

**Backend prompt:**
```
Create POST /api/ai/explain-concept in aiController.js.
Accept { concept: string, courseId: string } in req.body.
Protect with authMiddleware + requireRole('student', 'instructor') + aiRateLimit.
Validate: concept must be non-empty. Return 400 if missing.
Fetch Course difficulty and category if courseId is provided.
Set SSE headers.
Call claude-3-5-sonnet-20241022 with stream.
System: "You are a patient and engaging tutor. Explain concepts clearly for a
${difficulty || 'beginner'} level ${category || ''} student.
Use real-world analogies. Include a practical example at the end.
Keep the explanation under 300 words."
User prompt: "Explain this concept: ${concept}"
Stream each text delta. End with [DONE].
```

**Frontend prompt:**
```
Create client/src/components/ConceptExplainer.jsx.
Display on the LessonPlayer page below the QuizPanel.
UI: collapsed "💡 Ask AI to explain a concept" toggle.
On expand: text input "Type a concept from this lesson..." + "Explain" button.
On submit: use useSSE hook to stream POST /api/ai/explain-concept with { concept, courseId }.
Render streaming text in a panel with an indigo left border.
Show animated typing cursor during streaming.
After [DONE]: show "Copy explanation" button and "Ask another question" button (clears state).
Store last 3 explanations in component state; show as collapsible history below the current panel.
```

---

### Feature 6 — Course Content RAG Chatbot ⭐

**Endpoint:** `POST /api/ai/content-chat` | **Models:** `claude-3-5-haiku-20241022` (keyword extraction) + `claude-3-5-sonnet-20241022` (answer synthesis)

```
/create-user-stories "Course Content RAG Chatbot — students ask questions about any enrolled course
and Claude answers using only the actual lesson content from that course, with citations showing
which lesson the answer came from, available as a floating chatbot on all pages"
```

This is the architectural centrepiece. It involves two Claude calls per query and a MongoDB-backed content store — no external vector database.

---

#### Step A — Content Ingestion (`scripts/ingestContent.js`, run once)

The ingestion script reads lesson content from published courses, chunks it into ~500-word blocks, and upserts them into the `ContentChunk` collection with a `$text` index.

**Prompt to create the ingestion script:**
```
Create server/src/scripts/ingestContent.js.
Connect to MongoDB using process.env.MONGODB_URI.
Fetch all Courses where status === 'published'.
For each course:
  For each lesson in course.lessons[]:
    1. Combine lesson title + description as the chunk text
    2. If text > 500 words: split at paragraph boundaries into sub-chunks
    3. For each chunk, upsert a ContentChunk document:
       { source: course.title, section: lesson.title, chunkIndex: n,
         content: chunkText, wordCount: n, courseId: course._id }
    Use updateOne with upsert:true, matching on courseId + section + chunkIndex.
Create a $text index on ContentChunk.content.
Log: "Ingested X chunks from Y courses."
Disconnect and exit.
```

**Run once after seeding courses:**
```bash
cd server && node src/scripts/ingestContent.js
```

---

#### Step B — The RAG Endpoint (Two-Claude Pipeline)

**Backend prompt:**
```
Create POST /api/ai/content-chat in aiController.js.
Accept { query: string, courseId: string | null, history: [{role, content}] } in req.body.
Protect with authMiddleware + aiRateLimit.
Validate: query must be non-empty. Return 400 if missing.

Set SSE headers (text/event-stream).

Step 1 — Keyword Extraction (claude-3-5-haiku-20241022, NOT streaming):
  System: 'Return ONLY a JSON array of 3-6 search keywords. No prose. Example: ["react","hooks","useState"]'
  User: 'Extract search keywords from: "${query}"'
  Parse the JSON array. If parse fails: use the raw query words as fallback keywords.

Step 2 — Chunk Retrieval (MongoDB $text search):
  Build query: { $text: { $search: keywords.join(' ') } }
  If courseId provided: also filter { courseId: mongoose.Types.ObjectId(courseId) }
  Sort by textScore descending, limit 5 chunks.
  If no chunks found:
    stream "I couldn't find relevant information in the course content for that question.
    Try rephrasing, or check the lesson list for the topic."
    then [DONE]. Return.

Step 3 — Answer Synthesis (claude-3-5-sonnet-20241022, streaming):
  Build context block from the 5 chunks. Include source (course title) and section (lesson title) per chunk.
  System: "You are EduFlow's course assistant. Answer student questions ONLY using the
  provided course content excerpts. Always cite which lesson your answer comes from using
  [Lesson: <title>] notation. If the answer is not in the content, say so clearly and
  suggest the student check the lesson directly. Be encouraging and educational."
  Messages: history + { role: 'user', content: query + "\n\nCourse Content:\n" + contextBlock }
  Stream each text delta: res.write("data: " + JSON.stringify({ chunk: delta }) + "\n\n")
  On stream end:
    Extract all [Lesson: <title>] citations from the full response using regex.
    Deduplicate citations. Map to { lessonTitle, courseTitle } objects.
    Send: res.write("data: " + JSON.stringify({ sources: citedLessons }) + "\n\n")
    res.write("data: [DONE]\n\n"); res.end()

Add route: POST /api/ai/content-chat in aiRoutes.js.
```

---

#### Step C — The Chatbot Frontend Component

**Frontend prompt:**
```
Create client/src/components/AIChatbot.jsx.

State: isOpen (boolean), messages ([{role, content, sources}]), input (string), courseId (from URL params or null).

Render:
1. Fixed indigo chat bubble button (bottom-right, z-50).
   Show unread dot (red) when closed and messages.length > 0.
   "💬" icon when closed, "×" when open.

2. Slide-in panel (right side, w-96, full height, shadow-xl, white background).
   Header: "EduFlow AI Assistant" + indigo badge "Powered by Claude" + X close button.
   Subheader: if courseId detected "Answering from: [course name]" else "Ask about any enrolled course".
   Messages area (scrollable, flex-col gap-3):
     - User bubbles: indigo background, white text, right-aligned, rounded-l-xl rounded-tr-xl
     - AI bubbles: white card, slate-800 text, left-aligned, indigo left border, rounded-r-xl rounded-tl-xl
     - Below each AI bubble: source citation pills — small indigo-100 rounded tags showing "[Lesson: title]", grey text
     - Typing indicator: 3 animated grey dots, only visible while streaming
   Input bar (fixed at panel bottom):
     - Textarea (auto-grow, max 4 rows) + indigo Send button
     - Placeholder: "Ask a question about this course..."
     - Send on Enter (Shift+Enter for newline); disabled during streaming

On send:
  Append { role: 'user', content: input } to messages.
  Clear input. Append placeholder AI message { role: 'assistant', content: '', sources: [] }.
  Call useSSE stream to POST /api/ai/content-chat with { query: input, courseId, history }.
  Append each chunk to the last message's content incrementally.
  On [DONE] with sources: update last message's sources array. Close stream.
  On error: update last message content to "Sorry, something went wrong. Please try again."

courseId detection: read from window.location.pathname if on /courses/:id/* route, else null.

Mount AIChatbot in App.jsx outside <Routes> so it persists across page navigation.
```

---

#### Step D — Ingest Content After First Course Creation

After creating your first published course in the Instructor Studio:

```bash
cd server && node src/scripts/ingestContent.js
# Ingested 12 chunks from 1 courses.
```

Then test the chatbot in the browser — click the indigo bubble and ask a question about the course content.

---

## 14. Push to GitHub

### Option A — Ask Claude Code (recommended during active development)

```
commit and push with message "feat: add course content RAG chatbot"
```

Claude runs `git add → git commit → git push`. The `PreToolUse` hook fires before the push. If unit tests fail:

```
BLOCKED: unit tests failed. Fix before pushing.
```

Claude sees the failing tests in context, fixes them, and retries the push automatically.

### Option B — Direct Terminal

```bash
git add -A
git commit -m "feat: add course content RAG chatbot"
git push origin main
```

The hook still fires on `git push` — even when you run it manually.

### What Happens on Every Push to Main

```
git push origin main
        │
        PreToolUse hook fires
              │
              npm run test:unit -- --run
                    │
                    PASS → push proceeds → GitHub receives the commit
                                │
                                GitHub Actions triggers ci.yml
                                      │
                                      Job 1: test (unit + integration + client)
                                      Job 2: build (npm run build)
                                      Job 3: deploy → npx vercel --prod
                                                    ↓
                                              Live on Vercel 🚀
                    │
                    FAIL → push BLOCKED → Claude explains which tests failed
```

### Commit Message Convention

```
feat:   new feature (adds a user-visible capability)
fix:    bug fix
chore:  dependency update, config change, tooling
test:   adding or fixing tests
docs:   documentation only
```

---

## 15. Deploy to Vercel via GitHub Actions

Deployment happens automatically via the GitHub Actions pipeline defined in Part 11. This section explains the one-time setup required to connect GitHub Actions to your Vercel project.

### Step 1 — Create `vercel.json`

**File location:** `vercel.json` belongs at the **project root** — `EduFlow-LMS/vercel.json`. This file tells Vercel how to build and route the monorepo.

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "server/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/src/index.js" },
    { "src": "/(.*)",     "dest": "/client/dist/$1" }
  ]
}
```

**What each section means:**

| Section | Purpose |
|---------|---------|
| `builds[0]` | Vite static build — reads `client/package.json`, outputs to `client/dist/` |
| `builds[1]` | Node.js serverless function — your Express server entry point |
| `routes[0]` | All `/api/*` requests go to the Express server |
| `routes[1]` | Everything else serves the React SPA (`client/dist/`) |

> **node-cron in production:** Vercel runs serverless functions — persistent cron processes do not work. Replace `node-cron` weekly digest jobs with **Vercel Cron Jobs** (add a `crons` section to `vercel.json`) or an external scheduler like **Upstash QStash**.

### Step 2 — Link Your Vercel Project (run once locally)

```bash
npm install -g vercel
vercel login
vercel link   # follow prompts to connect to your Vercel project
```

After `vercel link`, a `.vercel/project.json` file is created:

```json
{
  "orgId": "your_org_id",
  "projectId": "your_project_id"
}
```

Copy these values — you need them for GitHub Secrets.

> **Do not commit `.vercel/`** — it is already in `.gitignore`.

### Step 3 — Create a Vercel API Token

1. Vercel dashboard → **Account Settings** (avatar top-right) → **Tokens**
2. Click **Create Token** → name it "GitHub Actions EduFlow" → select **Full Account** scope
3. Copy the token — it is shown only once

### Step 4 — Set GitHub Secrets

In your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

Add these three secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | The token you just created |
| `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

### Step 5 — Set Vercel Environment Variables

These are the runtime secrets your server needs in production. Set them in the Vercel dashboard: **Project → Settings → Environment Variables**

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URI` | Atlas connection string | Include DB name: `.../eduflow` |
| `JWT_SECRET` | 64-char hex string | Same value as your local `.env` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | **Only in Vercel, never in GitHub Secrets or CI** |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard | |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | |
| `EMAIL_USER` | Gmail address | |
| `EMAIL_PASS` | Gmail App Password | |
| `CLIENT_URL` | `https://your-project.vercel.app` | Set after first deploy |
| `VITE_API_URL` | `https://your-project.vercel.app/api` | Used during Vercel's client build |

### Step 6 — Trigger Your First Deployment

Push any change to `main`:

```bash
git add vercel.json
git commit -m "chore: add vercel.json for monorepo deployment"
git push origin main
```

Monitor the deployment at: `github.com/youruser/EduFlow-LMS/actions`

You should see three jobs running in sequence: **Test Suite → Build Check → Deploy to Vercel**

### Step 7 — Seed the RAG Store on Production

After the first successful deployment, run the content ingestion script against your production MongoDB Atlas:

```bash
# Locally, with your MONGODB_URI pointing to Atlas:
MONGODB_URI=mongodb+srv://eduflow_user:pass@cluster0.xxxx.mongodb.net/eduflow \
  node server/src/scripts/ingestContent.js
# Ingested 34 chunks from 3 courses.
```

### Step 8 — Verify the Live Deployment

```bash
vercel ls
```

Open the deployment URL in your browser. Log in as a student, open a course, and click the indigo chatbot bubble. Ask a question about the lesson content. The chatbot should stream an answer with `[Lesson: title]` citations.

---

## 16. Release Tags and Notes

### What is a Release Tag?

A release tag marks a specific point in your git history as a named version. GitHub Releases display these with auto-generated changelog notes based on your commit messages.

### Create a Tag

```bash
git tag -a v1.0.0 -m "First release: auth, courses, lessons, progress, 6 AI features"
git push origin v1.0.0
```

### Generate Release Notes

```
/create-release-notes v1.0.0
```

Claude reads the git log, categorises commits by prefix (`feat:`, `fix:`, `chore:`), and creates a GitHub Release at: `github.com/youruser/EduFlow-LMS/releases/tag/v1.0.0`

> **The `/deploy` skill does this automatically** — the `PostToolUse` hook fires after `vercel --prod` and creates the release. You only need to call `/create-release-notes` manually for hotfix tags deployed outside the normal flow.

### Semantic Versioning Guide

| Version | When to use |
|---------|------------|
| `v1.0.0` | First public release |
| `v1.1.0` | New feature added (e.g. new AI feature) |
| `v1.1.1` | Bug fix or minor patch |
| `v2.0.0` | Breaking change (e.g. API redesign, DB schema change) |

---

## 17. Skills Deep Dive

### What Skills Are

Skills are the automation layer of Claude Code. Each skill is a Markdown file in `.claude/commands/` that defines a custom `/slash` command. When you type `/run-tests`, Claude reads the Markdown, follows the instructions, and executes the steps.

Skills are powerful because they are:
- **Repeatable** — same command, same result, every time
- **Composable** — the `/deploy` skill calls `/unit-test-on-deploy` as a sub-step
- **Shareable** — commit `.claude/commands/` to git and the whole team gets the same commands
- **Auditable** — you can read exactly what any skill does before running it

### Skill Anatomy

```markdown
---
description: One-line summary shown in /help
allowed-tools: Bash, Read, Write, Grep
argument-hint: <placeholder shown in CLI>
---

You are a [role]. When invoked with $ARGUMENTS:
1. [Explicit step — exact command with exact file paths]
2. [Step two]

Always output:
## Result
[structured output block]
```

### Key Fields Explained

| Field | Purpose | Example |
|-------|---------|---------|
| `description` | Shown in `/help` — be action-oriented | `"Run the full test suite..."` |
| `allowed-tools` | Restricts Claude's capabilities during this skill | `"Bash, Read"` — no Write |
| `argument-hint` | CLI placeholder after skill name | `<feature description>` |
| `$ARGUMENTS` | The text the user types after the skill name | `/create-user-stories "quiz feature"` |

### Three Principles for Effective Skills

**1. Be explicit about commands.** Vague instructions produce inconsistent results.
```markdown
# Bad — too vague:
Run the tests.

# Good — exact commands:
1. cd server && npm run test:unit -- --run --reporter=verbose
2. cd client && npm run test:unit -- --run --reporter=verbose
```

**2. Define the output format.** Skills with structured output can be parsed by hooks or other skills.
```markdown
Always output:
## Test Results — [ISO timestamp]
| Suite | Passed | Failed | Duration |
```

**3. Use `allowed-tools` as a security boundary.** A skill that only reads logs should declare `allowed-tools: Read, Bash` — not `Write`. This prevents Claude from accidentally modifying files while a read-only skill runs.

### Storage Locations

| Path | Scope |
|------|-------|
| `.claude/commands/` | Project-scoped — only this repository |
| `~/.claude/commands/` | Global — available in all your projects |

### All 8 Skills — Quick Reference

| Skill | File | What It Does | Has `$ARGUMENTS`? |
|-------|------|-------------|-------------------|
| `/scaffold-server` | `scaffold-server.md` | Creates full `server/` tree | No |
| `/scaffold-client` | `scaffold-client.md` | Creates full `client/` tree | No |
| `/create-user-stories` | `create-user-stories.md` | Generates stories + Trello cards | Yes — feature description |
| `/run-tests` | `run-tests.md` | Full test suite: unit + integration + E2E | No |
| `/unit-test-on-deploy` | `unit-test-on-deploy.md` | Unit tests only, exit 2 on failure | No |
| `/check-coverage` | `check-coverage.md` | Coverage report, flags below threshold | No |
| `/create-release-notes` | `create-release-notes.md` | Git log → GitHub Release | Yes — version tag |
| `/deploy` | `deploy.md` | Tests → build → Vercel → release | No |

---

## 18. Agents Deep Dive

### What Agents Are

Agents are subprocess Claude instances launched by the main Claude Code session. Unlike Skills (which run in the main session), each Agent has its own isolated context window and can only use the tools you declare in its frontmatter. The agent runs to completion, then returns a single structured result to the parent session.

### Skills vs Agents

| | Skills | Agents |
|--|--------|--------|
| Duration | Under 1 minute, single-shot | Multi-step, can take several minutes |
| Context | Shares parent session context | Fully isolated context window |
| Use case | Deterministic, repetitive tasks | Research, analysis, parallel work |
| Invocation | User types `/skill-name` | Parent Claude spawns them on demand |
| Output | Printed inline in terminal | Returned as structured result to parent |

### When to Use Agents Instead of Skills

Use an agent when the task requires: reading many files and synthesising a conclusion, running tests and interpreting results together, comparing code across branches, or doing work that would pollute the parent context with noise.

---

### Agent 1 — `test-reporter`

**File location:** `.claude/agents/test-reporter.md`

```markdown
---
name: test-reporter
description: Runs all tests and returns a structured pass/fail report with failure details
tools: Bash, Read, Grep
---

1. cd server && npm test -- --reporter=json > /tmp/server-results.json
2. cd client && npm test -- --run --reporter=json > /tmp/client-results.json
3. npx playwright test --reporter=json > /tmp/e2e-results.json

Parse all three JSON outputs. Return:

## Test Report — [ISO timestamp]

| Suite         | Passed | Failed | Duration |
|---------------|--------|--------|----------|
| Unit (server) | X      | X      | Xs       |
| Unit (client) | X      | X      | Xs       |
| Integration   | X      | X      | Xs       |
| E2E           | X      | X      | Xs       |

### Failures
- Test: [test name] | File: [path:line] | Error: [message]

Final status: PASS or FAIL
```

**Spawn from Claude Code chat:**
```
Ask the test-reporter agent to run all tests and report results.
```

---

### Agent 2 — `pr-reviewer`

**File location:** `.claude/agents/pr-reviewer.md`

```markdown
---
name: pr-reviewer
description: Reviews a PR diff for code quality, test coverage gaps, and security issues
tools: Bash, Read, Grep
---

Given branch name $ARGUMENTS:

1. git diff main..$ARGUMENTS -- server/ client/
2. Analyse the diff for:
   a. Missing test coverage — any new controller function without a corresponding test?
   b. Security issues — hardcoded secrets, missing auth middleware on new routes, exposed API keys
   c. Role checks — any new route in aiRoutes.js or enrolmentRoutes.js missing protect middleware?
   d. Error handling — unhandled promise rejections, missing try/catch in async controllers
   e. AI usage — any direct Anthropic SDK call outside server/src/controllers/aiController.js?
   f. Client imports — any import of @anthropic-ai/sdk found in client/ directory?

Return:

## PR Review — [branch name]

### Summary
[1-2 sentence overview of what the PR does]

### Issues Found
| Severity | File | Line | Issue |
|----------|------|------|-------|
| HIGH     | ...  | ...  | ...   |

### Missing Tests
- [function name] in [file] has no test

### Recommendation
APPROVE / REQUEST_CHANGES
```

**Spawn before merging a feature branch:**
```
Ask the pr-reviewer agent to review feature/ai-quiz-generator
```

---

### Agent 3 — `content-auditor`

**File location:** `.claude/agents/content-auditor.md`

This agent is LMS-specific — it checks for student data exposure and missing enrolment checks.

```markdown
---
name: content-auditor
description: Scans code changes for student data leaks and missing enrolment guards
tools: Bash, Read, Grep
---

Scan git diff HEAD~1 for these issues:

1. Student PII in logs: search for console.log() calls that include student fields
   (email, name, completedLessons, progressPercent, certificateUrl, paymentRef).
   Flag any match as CRITICAL.

2. Missing enrolment check: find any route that serves lesson content (GET /api/courses/:id/lessons/:lid)
   that does not verify the student has an active Enrolment for that course.
   Flag as HIGH.

3. Anthropic key in client: search client/src/**/*.{js,jsx} for any import or usage
   of ANTHROPIC_API_KEY or @anthropic-ai/sdk. Flag as CRITICAL.

4. Unprotected AI routes: find any route in aiRoutes.js that does NOT use protect middleware.
   Flag as CRITICAL.

5. Course content leaking to unenrolled users: find any controller that returns full lesson
   content (videoUrl, full description) without checking enrolment status.
   Flag as HIGH.

Return:

## Content Audit Report — [timestamp]

| Severity | File | Line | Issue | Recommendation |
|----------|------|------|-------|----------------|

Overall: CLEAR / LOW / MEDIUM / HIGH / CRITICAL

If CRITICAL issues: output "MERGE BLOCKED — resolve all CRITICAL issues first."
```

**Spawn before every push to main:**
```
Ask the content-auditor agent to scan the latest diff
```

**Run agents in parallel:**
```
Spawn the test-reporter and content-auditor agents in parallel, then summarise combined results.
```

---

## 19. Hooks Deep Dive

### What Hooks Are

Hooks are shell commands that Claude Code runs automatically at specific lifecycle events — before a tool call (`PreToolUse`), after a tool call (`PostToolUse`), or when a session ends (`Stop`). They are defined in `.claude/settings.json`.

Unlike Skills (which you invoke) and Agents (which Claude spawns), Hooks fire without anyone asking. They are always-on automation.

### Hook Event Types

| Event | When It Fires | Common Use |
|-------|-------------|------------|
| `PreToolUse` | Before any tool call | Block dangerous operations (failing tests → no push) |
| `PostToolUse` | After a tool call succeeds | Side effects (create release, send notification) |
| `Notification` | When Claude sends a notification | Relay to Slack, desktop alert |
| `Stop` | When Claude finishes its turn | Coverage snapshot, cleanup |

### The Three EduFlow Hooks Explained

**Hook 1 — Pre-push Test Gate**

```json
{
  "matcher": "Bash(git push*)",
  "hooks": [{
    "type": "command",
    "command": "cd \"$CLAUDE_PROJECT_DIR\" && cd server && npm run test:unit -- --run 2>&1; if [ $? -ne 0 ]; then echo 'BLOCKED: unit tests failed. Fix before pushing.' >&2; exit 2; fi"
  }]
}
```

How it works:
1. The `PreToolUse` event fires before every Bash call
2. The matcher `Bash(git push*)` limits it to only `git push` commands (glob pattern)
3. It runs server unit tests silently
4. If tests fail: `exit 2` — Claude Code cancels the `git push` tool call entirely
5. If tests pass: Claude Code proceeds with the push normally

**Hook 2 — Auto Release After Deploy**

```json
{
  "matcher": "Bash(vercel --prod*)",
  "hooks": [{
    "type": "command",
    "command": "cd \"$CLAUDE_PROJECT_DIR\" && TAG=$(git tag --sort=-version:refname | head -1) && PREV=$(git tag --sort=-version:refname | sed -n '2p') && echo \"## Release $TAG\" > /tmp/rn.md && git log $PREV..$TAG --oneline --no-merges >> /tmp/rn.md && gh release create $TAG --notes-file /tmp/rn.md --title \"EduFlow LMS $TAG\""
  }]
}
```

How it works:
1. `PostToolUse` fires after `vercel --prod` completes
2. Reads the latest and previous git tags
3. Generates release notes from the git log between those tags
4. Creates a GitHub Release automatically — no extra steps

**Hook 3 — Terminal Bell on Completion**

```json
{
  "hooks": [{
    "type": "command",
    "command": "printf '\\a' && echo '[Claude Code] Task complete.'"
  }]
}
```

How it works: `printf '\a'` sends the ASCII bell character, which makes your terminal beep. Switch to another window during a long scaffold operation — the bell brings you back when Claude is done.

### Exit Codes

| Code | Effect |
|------|--------|
| `exit 0` | Success — proceed normally |
| `exit 1` | Report error to Claude Code, but proceed |
| `exit 2` | **BLOCK** — the tool call does NOT execute |

Only `exit 2` stops the tool. Use it only for genuine gate checks (failing tests, failing lint).

### Matcher Patterns

| Pattern | Matches |
|---------|---------|
| `"Bash"` | ALL Bash tool calls |
| `"Bash(git push*)"` | Only `git push` commands (glob) |
| `"Bash(vercel --prod*)"` | Only production Vercel deploys |
| `"Write"` | All file write operations |

### Debugging a Hook

If a hook blocks unexpectedly, test the shell command directly:

```bash
# Simulate what the hook checks
echo '{"command":"git push origin main"}' | grep -q 'git push' && echo "WOULD FIRE" || echo "NO MATCH"

# Run the test command manually to see the raw output
cd server && npm run test:unit -- --run 2>&1
```

Check the activity log to see every file Claude has written:
```bash
cat .claude/activity.log
```

---

## 20. Appendices

### Appendix A — Final Folder Structure

```
EduFlow-LMS/
  client/
    src/
      api/             ← axios.js
      components/      ← Navbar, CourseCard, LessonSidebar, ProgressBar,
                          VideoPlayer, StarRating, CertificateCard,
                          ProtectedRoute, RoleRoute, AIChatbot,
                          QuizPanel, ConceptExplainer
      context/         ← AuthContext.jsx
      hooks/           ← useSSE.js
      pages/           ← Login, Register, Home, CourseCatalogue, CourseDetail,
                          LessonPlayer, StudentDashboard, InstructorStudio,
                          CourseEditor, AdminPanel, Certificate, LearningPath
      App.jsx
      design-reference/ ← Pencil PNG exports (7 screens)
    package.json
    vite.config.js
    .env              ← VITE_API_URL=http://localhost:5000/api
  e2e/                ← Playwright tests
  playwright.config.ts
  server/
    src/
      config/          ← db.js, cloudinary.js, anthropic.js, email.js
      controllers/     ← authController.js, courseController.js,
                          enrolmentController.js, reviewController.js,
                          aiController.js
      middleware/      ← authMiddleware.js, roleMiddleware.js, rateLimit.js
      models/          ← User.js, Course.js, Enrolment.js, Review.js,
                          ContentChunk.js
      routes/          ← authRoutes.js, courseRoutes.js, enrolmentRoutes.js,
                          reviewRoutes.js, aiRoutes.js
      scripts/         ← ingestContent.js
      index.js
    tests/
      unit/            ← authController.test.js, enrolmentController.test.js,
                          aiController.test.js
      integration/     ← learningFlow.test.js
    .env              ← all server secrets (never commit)
    .env.example      ← template with variable names only
    package.json
  .claude/
    commands/          ← 8 skill .md files
    agents/            ← 3 agent .md files
    settings.json      ← permissions + hooks
    activity.log       ← written by Write hook (gitignored)
  .github/
    workflows/
      ci.yml           ← test → build → deploy pipeline
  CLAUDE.md            ← project briefing (committed to git)
  vercel.json          ← Vercel monorepo config (project root)
  .gitignore
  package.json         ← optional root scripts (npm test runs both)
```

---

### Appendix B — Environment Variables Reference

| Variable | Location | In CI? | Notes |
|----------|----------|--------|-------|
| `MONGODB_URI` | `server/.env` + Vercel | No (memory server in CI) | Include DB name in URI |
| `JWT_SECRET` | `server/.env` + Vercel + GitHub Secrets | Yes (test value) | Generate with `crypto.randomBytes(32)` |
| `ANTHROPIC_API_KEY` | `server/.env` + Vercel **only** | **Never** — always mocked | Never commit, never set as GitHub Secret |
| `CLOUDINARY_CLOUD_NAME` | `server/.env` + Vercel | Never | Mocked in tests |
| `CLOUDINARY_API_KEY` | `server/.env` + Vercel | Never | Mocked in tests |
| `CLOUDINARY_API_SECRET` | `server/.env` + Vercel | Never | Mocked in tests |
| `EMAIL_USER` | `server/.env` + Vercel | Never | Gmail address |
| `EMAIL_PASS` | `server/.env` + Vercel | Never | Gmail App Password |
| `CLIENT_URL` | `server/.env` + Vercel | Never | Set to Vercel URL after first deploy |
| `VITE_API_URL` | `client/.env` + Vercel | Yes (placeholder) | Frontend uses this for all API calls |

---

### Appendix C — Role-Permission Matrix

| Route | student | instructor | admin |
|-------|---------|-----------|-------|
| `POST /api/auth/register` | ✓ | ✓ | ✓ |
| `POST /api/auth/login` | ✓ | ✓ | ✓ |
| `GET /api/courses` | ✓ | ✓ | ✓ |
| `POST /api/courses` | | ✓ | ✓ |
| `PATCH /api/courses/:id` | | owner | ✓ |
| `DELETE /api/courses/:id` | | owner | ✓ |
| `POST /api/enrolments` | ✓ | | ✓ |
| `PATCH /api/enrolments/:id/complete` | enrolled | | ✓ |
| `GET /api/enrolments/mine` | ✓ | | ✓ |
| `POST /api/reviews` | enrolled | | ✓ |
| `PATCH /api/reviews/:id/reply` | | owner-course | ✓ |
| `GET /api/users` | | | ✓ |
| `POST /api/ai/summarise-course` | ✓ | ✓ | ✓ |
| `POST /api/ai/generate-quiz` | enrolled | ✓ | ✓ |
| `POST /api/ai/recommend-courses` | ✓ | | ✓ |
| `POST /api/ai/learning-path` | ✓ | | ✓ |
| `POST /api/ai/explain-concept` | enrolled | ✓ | ✓ |
| `POST /api/ai/content-chat` | ✓ | ✓ | ✓ |

**Key:** ✓ = full access · `owner` = created by this user · `owner-course` = instructor of that course · `enrolled` = has active Enrolment for that course · blank = no access (403)

---

### Appendix D — MongoDB Schema Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     User     │       │      Course       │       │  Enrolment   │
│──────────────│       │──────────────────│       │──────────────│
│ _id          │◄──┐   │ _id              │◄───┐  │ _id          │
│ name         │   │   │ title ($text)    │    │  │ student ─────┼──► User
│ email        │   │   │ description ($t) │    │  │ course  ─────┼──► Course
│ password     │   └───│ instructor       │    │  │ enrolledAt   │
│ role         │       │ lessons[]        │    │  │ completedLess│
│ avatar       │       │ status           │    │  │ progressPct  │
│ bio          │       │ category         │    │  │ completedAt  │
│ enrolledCrs[]│       │ difficulty       │    │  │ certificateUr│
│ isActive     │       │ price            │    │  │ lastWatched{}│
└──────────────┘       │ aiSummary{}      │    │  └──────────────┘
                       │ rating{}         │    │
                       └──────────────────┘    │  ┌──────────────┐
                                               │  │    Review    │
                       ┌──────────────────┐    │  │──────────────│
                       │  ContentChunk    │    │  │ course  ─────┼──► Course
                       │──────────────────│    └──│ student ─────┼──► User
                       │ source (course)  │       │ rating (1-5) │
                       │ section (lesson) │       │ comment      │
                       │ chunkIndex       │       │ instrReply   │
                       │ content ($text)  │       └──────────────┘
                       │ wordCount        │
                       │ courseId    ─────┼──► Course
                       └──────────────────┘
```

---

### Appendix E — GitHub Actions Secrets Setup (Visual Guide)

```
github.com → your-repo → Settings → Secrets and variables → Actions

Required secrets for deployment:
┌─────────────────────┬────────────────────────────────────────────┐
│ Secret Name         │ Where to find the value                    │
├─────────────────────┼────────────────────────────────────────────┤
│ VERCEL_TOKEN        │ Vercel dashboard → Account Settings →      │
│                     │ Tokens → Create Token                      │
├─────────────────────┼────────────────────────────────────────────┤
│ VERCEL_ORG_ID       │ .vercel/project.json → "orgId" field       │
│                     │ (created after running `vercel link`)       │
├─────────────────────┼────────────────────────────────────────────┤
│ VERCEL_PROJECT_ID   │ .vercel/project.json → "projectId" field   │
└─────────────────────┴────────────────────────────────────────────┘

DO NOT add these to GitHub Secrets (they are set in Vercel dashboard instead):
  ANTHROPIC_API_KEY  — Vercel only. Real AI calls must never run in CI.
  MONGODB_URI        — Vercel only. CI uses mongodb-memory-server.
  CLOUDINARY_*       — Vercel only. CI mocks Cloudinary.
```

---

### Appendix F — The Complete Workflow at a Glance

```
ONE-TIME SETUP
─────────────────────────────────────────────────────────
Create GitHub repo + clone locally
Create CLAUDE.md + .claude/settings.json               ← do this first
Create all 8 Skills in .claude/commands/               ← do this second
Configure Hooks (update settings.json)
Set up Trello MCP + create board lists
Create .github/workflows/ci.yml
Set GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
Create vercel.json at project root
Set Vercel environment variables in dashboard

/scaffold-server    →  full server/ created in one command
/scaffold-client    →  full client/ created (referencing Pencil designs)
Paste test prompts from Part 10  →  test files written

PER-FEATURE LOOP (repeat for each of the 6 AI features)
─────────────────────────────────────────────────────────
/create-user-stories "feature"   →  Trello cards created in Backlog
Trello: move cards to In Progress
[backend prompt]                  →  controller + route written
[frontend prompt]                 →  component/page written
/run-tests                        →  suite runs (repeat until green)
/check-coverage                   →  flag any files below threshold
Trello: move cards to Done

PUSH AND DEPLOY (when feature set is ready)
─────────────────────────────────────────────────────────
"commit and push feat:..."   →  PreToolUse hook fires unit tests
                                 PASS → push to GitHub
                                 GitHub Actions triggers:
                                   Job 1: test (unit + integration + client)
                                   Job 2: build (npm run build)
                                   Job 3: deploy → vercel --prod
                                 PostToolUse hook creates GitHub Release
                                 🚀 Live on Vercel

POST-DEPLOY (first time only)
─────────────────────────────────────────────────────────
node server/src/scripts/ingestContent.js   →  RAG store seeded in Atlas
Test chatbot at live URL
Update CLIENT_URL env var in Vercel to production domain
```

---

### Appendix G — The Six AI Features Summary

| # | Feature | Model | Pattern | Streaming? |
|---|---------|-------|---------|------------|
| 1 | Course Summariser | Haiku | JSON + Cache | No |
| 2 | Quiz Generator | Haiku | JSON | No |
| 3 | Course Recommender | Haiku | JSON + Batch | No |
| 4 | Learning Path Advisor | Sonnet | Streaming | Yes |
| 5 | Concept Explainer | Sonnet | Streaming | Yes |
| 6 | Content RAG Chatbot ⭐ | Haiku → Sonnet | Two-Claude RAG + Streaming | Yes |

**Pattern guide:**
- **JSON** — Claude returns structured data; parse and render in UI
- **JSON + Cache** — result saved to DB; subsequent calls return cache without calling Anthropic
- **Streaming** — Claude streams text chunks via SSE; `useSSE` hook renders progressively
- **Two-Claude RAG** — Haiku extracts keywords → MongoDB retrieves chunks → Sonnet synthesises answer with citations

---

*EduFlow LMS — Complete Claude Code Guide*
*Built with Claude Code, Anthropic Claude API, and the MERN stack*
*April 2026*
