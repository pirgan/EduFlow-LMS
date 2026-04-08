# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\lmsFlow.spec.js >> Student receives an AI concept explanation in LessonPlayer
- Location: e2e\lmsFlow.spec.js:160:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/email/i)

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - link "E EduFlow" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: E
        - generic [ref=e7]: EduFlow
      - textbox "Search courses…" [ref=e9]
      - generic [ref=e10]:
        - link "Browse" [ref=e11] [cursor=pointer]:
          - /url: /courses
        - link "Log in" [ref=e12] [cursor=pointer]:
          - /url: /login
        - link "Get Started" [ref=e13] [cursor=pointer]:
          - /url: /register
  - generic [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]: E
      - generic [ref=e18]: EduFlow
      - generic [ref=e19]: AI-Powered Learning
    - generic [ref=e20]:
      - generic [ref=e21]: Log In
      - link "Register" [ref=e22] [cursor=pointer]:
        - /url: /register
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]: Email address
        - textbox "you@example.com" [ref=e26]
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: Password
          - generic [ref=e30] [cursor=pointer]: Forgot password?
        - textbox "••••••••••" [ref=e31]
      - button "Sign In" [ref=e32]
    - paragraph [ref=e33]:
      - text: Don't have an account?
      - link "Sign up free" [ref=e34] [cursor=pointer]:
        - /url: /register
  - button "Open AI tutor" [ref=e35]: 🤖
  - generic [ref=e36]:
    - generic [ref=e37]:
      - generic [ref=e38]: 🤖
      - generic [ref=e39]:
        - paragraph [ref=e40]: AI Tutor
        - paragraph [ref=e41]: Powered by Claude
    - generic [ref=e44]: Hi! Ask me anything about the course content.
    - generic [ref=e45]:
      - textbox "Ask about the course…" [ref=e46]
      - button "Send" [disabled] [ref=e47]
  - region "Notifications Alt+T"
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests — EduFlow LMS  (Playwright)
  3   |  *
  4   |  * Prerequisites:
  5   |  *   npm install -D @playwright/test && npx playwright install chromium
  6   |  *
  7   |  * Seed test users before running:
  8   |  *   cd server && node src/scripts/seedTestUsers.js
  9   |  *   (or register them manually via /api/auth/register)
  10  |  *
  11  |  * Run:
  12  |  *   npx playwright test e2e/lmsFlow.spec.js
  13  |  *
  14  |  * Expected test users seeded in the DB:
  15  |  *   student@eduflow.test    / TestPass123
  16  |  *   instructor@eduflow.test / TestPass123
  17  |  */
  18  | 
  19  | import { test, expect } from '@playwright/test';
  20  | 
  21  | const BASE_URL        = process.env.BASE_URL        || 'http://localhost:5173';
  22  | const STUDENT_EMAIL   = 'student@eduflow.test';
  23  | const INSTRUCTOR_EMAIL = 'instructor@eduflow.test';
  24  | const PASSWORD        = 'TestPass123';
  25  | 
  26  | // ─── Helpers ─────────────────────────────────────────────────────────────────
  27  | 
  28  | async function login(page, email, password = PASSWORD) {
  29  |   await page.goto(`${BASE_URL}/login`);
> 30  |   await page.getByPlaceholder(/email/i).fill(email);
      |                                         ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  31  |   await page.getByPlaceholder(/password/i).fill(password);
  32  |   await page.getByRole('button', { name: /sign in|log in|login/i }).click();
  33  |   // Wait for redirect away from /login
  34  |   await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10_000 });
  35  | }
  36  | 
  37  | // ─── Test 1: Student completes a lesson ──────────────────────────────────────
  38  | 
  39  | test('Student can enrol in a course and mark a lesson complete', async ({ page }) => {
  40  |   // 1. Login
  41  |   await login(page, STUDENT_EMAIL);
  42  | 
  43  |   // 2. Navigate to catalogue and verify course cards render
  44  |   await page.goto(`${BASE_URL}/courses`);
  45  |   const cards = page.locator('[data-testid="course-card"], .course-card, [class*="CourseCard"]');
  46  |   await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  47  | 
  48  |   // 3. Click the first course card → CourseDetail page
  49  |   await cards.first().click();
  50  |   await page.waitForURL(/\/courses\/[a-f0-9]+/, { timeout: 8_000 });
  51  | 
  52  |   // 4. Click "Enrol Now" and verify enrolled state
  53  |   const enrolBtn = page.getByRole('button', { name: /enrol now|enroll now/i });
  54  |   if (await enrolBtn.isVisible()) {
  55  |     await enrolBtn.click();
  56  |     // After enrolment the button or badge should change
  57  |     await expect(
  58  |       page.getByText(/enrolled|start learning/i).first()
  59  |     ).toBeVisible({ timeout: 8_000 });
  60  |   }
  61  | 
  62  |   // 5. Start learning → LessonPlayer
  63  |   const startBtn = page.getByRole('link', { name: /start learning/i })
  64  |     .or(page.getByRole('button', { name: /start learning/i }));
  65  |   await startBtn.click();
  66  |   await page.waitForURL(/\/learn\/[a-f0-9]+/, { timeout: 8_000 });
  67  | 
  68  |   // 6. Wait for VideoPlayer to be present in the DOM
  69  |   const videoPlayer = page.locator('video, [class*="VideoPlayer"], [class*="react-player"]').first();
  70  |   await expect(videoPlayer).toBeVisible({ timeout: 10_000 });
  71  | 
  72  |   // 7. Mark lesson as complete
  73  |   const markBtn = page.getByRole('button', { name: /mark as complete|mark complete/i });
  74  |   await expect(markBtn).toBeVisible({ timeout: 5_000 });
  75  |   await markBtn.click();
  76  | 
  77  |   // 8. Lesson should show a checkmark in the sidebar
  78  |   const checkmark = page.locator('[class*="LessonSidebar"] svg, [class*="sidebar"] .text-green, [class*="sidebar"] [class*="green"]').first();
  79  |   await expect(checkmark).toBeVisible({ timeout: 8_000 });
  80  | 
  81  |   // 9. Progress bar should be above 0%
  82  |   const progressBar = page.locator('[role="progressbar"], [class*="ProgressBar"], [class*="progress"]').first();
  83  |   await expect(progressBar).toBeVisible({ timeout: 5_000 });
  84  |   const widthStyle = await progressBar.getAttribute('style');
  85  |   const widthMatch  = widthStyle?.match(/width:\s*([\d.]+)%/);
  86  |   if (widthMatch) {
  87  |     expect(Number(widthMatch[1])).toBeGreaterThan(0);
  88  |   }
  89  | });
  90  | 
  91  | // ─── Test 2: Instructor creates a course ─────────────────────────────────────
  92  | 
  93  | test('Instructor can create a course and publish it', async ({ page }) => {
  94  |   // 1. Login as instructor
  95  |   await login(page, INSTRUCTOR_EMAIL);
  96  | 
  97  |   // 2. Navigate to studio
  98  |   await page.goto(`${BASE_URL}/studio`);
  99  |   await expect(page.getByText(/instructor studio/i)).toBeVisible({ timeout: 8_000 });
  100 | 
  101 |   // 3. Click "Create New Course"
  102 |   await page.getByRole('link', { name: /create new course/i })
  103 |     .or(page.getByRole('button', { name: /create new course/i }))
  104 |     .click();
  105 |   await page.waitForURL(/\/studio\/new/, { timeout: 5_000 });
  106 | 
  107 |   // 4. Step 1 — fill basics
  108 |   const titleInput = page.getByPlaceholder(/course title|e\.g\. React/i);
  109 |   await titleInput.fill('Test Course by Playwright');
  110 | 
  111 |   const categorySelect = page.getByLabel(/category/i);
  112 |   if (await categorySelect.isVisible()) {
  113 |     await categorySelect.selectOption('Programming');
  114 |   }
  115 | 
  116 |   const priceInput = page.getByLabel(/price/i);
  117 |   if (await priceInput.isVisible()) {
  118 |     await priceInput.fill('29');
  119 |   }
  120 | 
  121 |   await page.getByRole('button', { name: /continue to lessons/i }).click();
  122 | 
  123 |   // 5. Step 2 — add a lesson
  124 |   await expect(page.getByRole('button', { name: /add lesson/i })).toBeVisible({ timeout: 5_000 });
  125 |   await page.getByRole('button', { name: /add lesson/i }).click();
  126 | 
  127 |   const lessonTitle = page.getByPlaceholder(/lesson title/i).first();
  128 |   await lessonTitle.fill('Introduction');
  129 | 
  130 |   const videoUrl = page.getByPlaceholder(/video url/i).first();
```