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
