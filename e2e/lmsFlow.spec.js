/**
 * E2E Tests — EduFlow LMS  (Playwright)
 *
 * Prerequisites:
 *   npm install -D @playwright/test && npx playwright install chromium
 *
 * Seed test users before running:
 *   cd server && node src/scripts/seedTestUsers.js
 *   (or register them manually via /api/auth/register)
 *
 * Run:
 *   npx playwright test e2e/lmsFlow.spec.js
 *
 * Expected test users seeded in the DB:
 *   student@eduflow.test    / TestPass123
 *   instructor@eduflow.test / TestPass123
 */

import { test, expect } from '@playwright/test';

const BASE_URL        = process.env.BASE_URL        || 'http://localhost:5173';
const STUDENT_EMAIL   = 'student@eduflow.test';
const INSTRUCTOR_EMAIL = 'instructor@eduflow.test';
const PASSWORD        = 'TestPass123';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login(page, email, password = PASSWORD) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in|login/i }).click();
  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10_000 });
}

// ─── Test 1: Student completes a lesson ──────────────────────────────────────

test('Student can enrol in a course and mark a lesson complete', async ({ page }) => {
  // 1. Login
  await login(page, STUDENT_EMAIL);

  // 2. Navigate to catalogue and verify course cards render
  await page.goto(`${BASE_URL}/courses`);
  const cards = page.locator('[data-testid="course-card"], .course-card, [class*="CourseCard"]');
  await expect(cards.first()).toBeVisible({ timeout: 10_000 });

  // 3. Click the first course card → CourseDetail page
  await cards.first().click();
  await page.waitForURL(/\/courses\/[a-f0-9]+/, { timeout: 8_000 });

  // 4. Click "Enrol Now" and verify enrolled state
  const enrolBtn = page.getByRole('button', { name: /enrol now|enroll now/i });
  if (await enrolBtn.isVisible()) {
    await enrolBtn.click();
    // After enrolment the button or badge should change
    await expect(
      page.getByText(/enrolled|start learning/i).first()
    ).toBeVisible({ timeout: 8_000 });
  }

  // 5. Start learning → LessonPlayer
  const startBtn = page.getByRole('link', { name: /start learning/i })
    .or(page.getByRole('button', { name: /start learning/i }));
  await startBtn.click();
  await page.waitForURL(/\/learn\/[a-f0-9]+/, { timeout: 8_000 });

  // 6. Wait for VideoPlayer to be present in the DOM
  const videoPlayer = page.locator('video, [class*="VideoPlayer"], [class*="react-player"]').first();
  await expect(videoPlayer).toBeVisible({ timeout: 10_000 });

  // 7. Mark lesson as complete
  const markBtn = page.getByRole('button', { name: /mark as complete|mark complete/i });
  await expect(markBtn).toBeVisible({ timeout: 5_000 });
  await markBtn.click();

  // 8. Lesson should show a checkmark in the sidebar
  const checkmark = page.locator('[class*="LessonSidebar"] svg, [class*="sidebar"] .text-green, [class*="sidebar"] [class*="green"]').first();
  await expect(checkmark).toBeVisible({ timeout: 8_000 });

  // 9. Progress bar should be above 0%
  const progressBar = page.locator('[role="progressbar"], [class*="ProgressBar"], [class*="progress"]').first();
  await expect(progressBar).toBeVisible({ timeout: 5_000 });
  const widthStyle = await progressBar.getAttribute('style');
  const widthMatch  = widthStyle?.match(/width:\s*([\d.]+)%/);
  if (widthMatch) {
    expect(Number(widthMatch[1])).toBeGreaterThan(0);
  }
});

// ─── Test 2: Instructor creates a course ─────────────────────────────────────

test('Instructor can create a course and publish it', async ({ page }) => {
  // 1. Login as instructor
  await login(page, INSTRUCTOR_EMAIL);

  // 2. Navigate to studio
  await page.goto(`${BASE_URL}/studio`);
  await expect(page.getByText(/instructor studio/i)).toBeVisible({ timeout: 8_000 });

  // 3. Click "Create New Course"
  await page.getByRole('link', { name: /create new course/i })
    .or(page.getByRole('button', { name: /create new course/i }))
    .click();
  await page.waitForURL(/\/studio\/new/, { timeout: 5_000 });

  // 4. Step 1 — fill basics
  const titleInput = page.getByPlaceholder(/course title|e\.g\. React/i);
  await titleInput.fill('Test Course by Playwright');

  const categorySelect = page.getByLabel(/category/i);
  if (await categorySelect.isVisible()) {
    await categorySelect.selectOption('Programming');
  }

  const priceInput = page.getByLabel(/price/i);
  if (await priceInput.isVisible()) {
    await priceInput.fill('29');
  }

  await page.getByRole('button', { name: /continue to lessons/i }).click();

  // 5. Step 2 — add a lesson
  await expect(page.getByRole('button', { name: /add lesson/i })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /add lesson/i }).click();

  const lessonTitle = page.getByPlaceholder(/lesson title/i).first();
  await lessonTitle.fill('Introduction');

  const videoUrl = page.getByPlaceholder(/video url/i).first();
  await videoUrl.fill('https://vimeo.com/123456');

  const durationInput = page.getByPlaceholder(/mins/i).first();
  await durationInput.fill('10');

  await page.getByRole('button', { name: /continue to publish/i }).click();

  // 6. Step 3 — toggle publish and submit
  await expect(page.getByText(/review summary/i)).toBeVisible({ timeout: 5_000 });

  // Enable publish toggle if not already on
  const toggleBtn = page.locator('button[role="switch"], button:has(span.rounded-full)').first();
  const isPublished = await page.getByText(/published/i).isVisible().catch(() => false);
  if (!isPublished) await toggleBtn.click();

  await page.getByRole('button', { name: /create course|save/i }).click();

  // 7. Should redirect to studio with the new course in the table
  await page.waitForURL(/\/studio$/, { timeout: 10_000 });

  const courseRow = page.getByText('Test Course by Playwright');
  await expect(courseRow).toBeVisible({ timeout: 10_000 });

  const publishedBadge = page.getByText(/published/i).first();
  await expect(publishedBadge).toBeVisible({ timeout: 5_000 });
});

// ─── Test 3: Student gets an AI explanation ──────────────────────────────────

test('Student receives an AI concept explanation in LessonPlayer', async ({ page }) => {
  // 1. Login as student
  await login(page, STUDENT_EMAIL);

  // Navigate to catalogue and open an enrolled course
  await page.goto(`${BASE_URL}/courses`);
  const cards = page.locator('[data-testid="course-card"], .course-card, [class*="CourseCard"]');
  await expect(cards.first()).toBeVisible({ timeout: 10_000 });

  // Click first course
  await cards.first().click();
  await page.waitForURL(/\/courses\/[a-f0-9]+/, { timeout: 8_000 });

  // Enrol if needed
  const enrolBtn = page.getByRole('button', { name: /enrol now|enroll now/i });
  if (await enrolBtn.isVisible()) {
    await enrolBtn.click();
    await expect(page.getByText(/enrolled|start learning/i).first()).toBeVisible({ timeout: 8_000 });
  }

  // Go to LessonPlayer
  const startBtn = page.getByRole('link', { name: /start learning/i })
    .or(page.getByRole('button', { name: /start learning/i }));
  await startBtn.click();
  await page.waitForURL(/\/learn\/[a-f0-9]+/, { timeout: 8_000 });

  // 2. Locate the "AI Explain Concept" panel
  await expect(page.getByText(/ai explain concept/i)).toBeVisible({ timeout: 5_000 });

  // 3. Type a question
  const conceptInput = page.getByPlaceholder(/ask about/i)
    .or(page.getByRole('textbox', { name: /concept/i }));
  await conceptInput.fill('What is the main topic of this lesson?');

  // 4. Click Ask/Send
  await page.getByRole('button', { name: /ask|send/i }).last().click();

  // 5. Typing indicator (3 animated dots) should appear
  const typingIndicator = page.locator('[class*="animate-bounce"], [style*="animation"]').first();
  await expect(typingIndicator).toBeVisible({ timeout: 5_000 });

  // 6. Typing indicator disappears and AI response renders (non-empty)
  await expect(typingIndicator).toBeHidden({ timeout: 20_000 });

  const aiResponse = page.locator('[class*="text-\\[\\#AAA\\]"], [class*="explanation"]').first();
  await expect(aiResponse).toBeVisible({ timeout: 10_000 });
  const responseText = await aiResponse.textContent();
  expect(responseText?.trim().length).toBeGreaterThan(0);
});
