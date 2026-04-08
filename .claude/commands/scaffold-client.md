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
---