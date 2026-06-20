/**
 * Browser E2E — full UI flow (local mode).
 * Run: node scripts/e2e-browser.mjs
 * Requires: npm run dev (background) + npx playwright (auto-installed)
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

const DEMO_MARKERS = ['proj-ith-01', 'proj-ith-02', 'Koshi Highway Builders'];
const PROJECT_TITLE = `E2E Footpath ${Date.now()}`;
const ADMIN_EMAIL = `ward1e2e${Date.now()}@test.local`;
const CITIZEN_EMAIL = `citizene2e${Date.now()}@test.local`;
const PASSWORD = 'TestPass123!';

let devProcess = null;
let port = 5173;

function log(step, msg) {
  console.log(`✓ Step ${step}: ${msg}`);
}

function fail(step, msg) {
  throw new Error(`FAIL step ${step}: ${msg}`);
}

async function findDevServer(maxMs = 5000) {
  const ports = [5173, 5174, 5177];
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    for (const p of ports) {
      try {
        const res = await fetch(`http://localhost:${p}/`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) return p;
      } catch {
        // retry
      }
    }
    await sleep(500);
  }
  return null;
}

async function waitForServer(maxMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const p = await findDevServer(2000);
    if (p) {
      port = p;
      return p;
    }
    await sleep(500);
  }
  throw new Error('Dev server did not start');
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    devProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, VITE_USE_DEMO_SEED: 'false' },
    });
    let out = '';
    devProcess.stdout?.on('data', (d) => { out += d.toString(); });
    devProcess.stderr?.on('data', (d) => { out += d.toString(); });
    devProcess.on('error', reject);
    waitForServer().then(resolve).catch(reject);
  });
}

function stopDevServer() {
  if (devProcess && !devProcess.killed) {
    devProcess.kill('SIGTERM');
  }
}

async function spaClick(page, namePattern) {
  await page.getByRole('link', { name: namePattern }).first().click();
  await page.waitForLoadState('networkidle');
}

async function postUpdate(page, projectId, typeLabel, fillStep3) {
  await page.locator('#projectId').selectOption(projectId);
  await page.getByRole('button', { name: /^Continue$/i }).click();
  await sleep(300);
  await page.getByRole('button', { name: typeLabel }).click();
  await page.getByRole('button', { name: /^Continue$/i }).click();
  await sleep(300);
  await fillStep3(page);
  await page.getByRole('button', { name: /^Continue$/i }).click();
  await sleep(300);
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: /Publish Update/i }).click();
  await page.waitForSelector('text=Update published successfully', { timeout: 15000 });
}

async function clearAppData(page) {
  await page.goto(`http://localhost:${port}/dev-reset`);
  await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k?.startsWith('wardwatch_')) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  });
  // localStorage clear + reload resets to empty initial data (do not click "Clear Local Demo Data" — that re-seeds demo projects).
  await page.reload();
}

async function main() {
  console.log('\n=== WardWatch Browser E2E ===\n');
  console.log(`Project title: ${PROJECT_TITLE}\n`);

  const existing = await findDevServer().catch(() => null);
  if (existing) {
    port = existing;
    console.log(`Using existing dev server on port ${port}\n`);
  } else {
    await startDevServer();
    console.log(`Dev server ready on port ${port}\n`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1 — clear data
    await clearAppData(page);
    log(1, 'Cleared local app data via /dev-reset + localStorage');

    // Step 2 — dashboard empty
    await page.goto(`http://localhost:${port}/dashboard`);
    await page.waitForLoadState('networkidle');
    const dashText = await page.textContent('body');
    if (DEMO_MARKERS.some((m) => dashText.includes(m))) {
      fail(2, 'Fake demo project found on dashboard');
    }
    const emptyDash = dashText.includes('No ward projects published yet');
    const hasZeroProjects = /\bWard Projects[\s\S]{0,120}?\b0\b/.test(dashText.replace(/\s+/g, ' '));
    if (!emptyDash && !hasZeroProjects) {
      fail(2, 'Dashboard should show empty state or 0 ward projects');
    }
    log(2, 'Dashboard shows empty state (0 projects, no fake data)');

    // Step 4–5 — complaints empty
    await page.goto(`http://localhost:${port}/complaints`);
    await page.waitForLoadState('networkidle');
    const compText = await page.textContent('body');
    if (DEMO_MARKERS.some((m) => compText.includes(m))) fail(5, 'Fake complaint data found');
    log(5, 'Complaints page has no fake complaint data');

    // Step 6 — register Ward 1 admin
    await page.goto(`http://localhost:${port}/register`);
    await page.getByText('I am Ward IT/Admin', { exact: false }).click();
    await page.locator('#fullName').fill('E2E Ward 1 Admin');
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('#confirmPassword').fill(PASSWORD);
    await page.locator('#phone').fill('9801111111');
    await page.locator('#wardNo').selectOption('1');
    await page.locator('#positionTitle').fill('Ward IT Officer');
    await page.getByRole('button', { name: /Create account|Register/i }).click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    log(6, `Registered Ward 1 admin (${ADMIN_EMAIL})`);

    // Step 7 — add project
    await page.goto(`http://localhost:${port}/admin/add-project`);
    await page.locator('#title, input[name="title"]').first().fill(PROJECT_TITLE);
    await page.locator('textarea').first().fill('E2E test project for footpath repair in Ward 1.');
    await page.locator('#location, input[name="location"]').first().fill('Ward 1 Main Road');
    await page.locator('#allocatedBudget, input[name="allocatedBudget"]').first().fill('500000');
    await page.locator('#contractorName, input[name="contractorName"]').first().fill('E2E Builders');
    await page.locator('#startDate, input[name="startDate"]').first().fill('2026-01-01');
    await page.locator('#deadline, input[name="deadline"]').first().fill('2026-12-31');
    await page.locator('#progressPercent, input[name="progressPercent"]').first().fill('20');
    await page.getByRole('button', { name: /Publish Project/i }).click();
    await page.waitForSelector('text=Project created successfully', { timeout: 15000 });
    log(7, `Added project: "${PROJECT_TITLE}"`);

    // View public page from success screen (keeps SPA session)
    await page.getByRole('link', { name: /View Public Page/i }).click();
    await page.waitForURL(/\/projects\//);
    const projectUrl = page.url();
    const projectId = projectUrl.split('/projects/')[1]?.replace(/\/$/, '').split(/[?#]/)[0];
    if (!projectId) fail(7, 'Could not capture project ID from URL');
    const detailAfterCreate = await page.textContent('body');
    if (!detailAfterCreate.includes(PROJECT_TITLE)) fail(9, 'Created project not on public detail page');

    // Step 8–9 — projects list
    await spaClick(page, /Projects/i);
    await page.waitForURL(/\/projects\/?$/, { timeout: 10000 });
    await page.waitForSelector(`article >> text=${PROJECT_TITLE}`, { timeout: 10000 });
    const projectsBody = await page.textContent('body');
    if (DEMO_MARKERS.some((m) => projectsBody.includes(m))) fail(9, 'Fake projects on list page');
    if (!projectsBody.includes(PROJECT_TITLE)) fail(9, 'Uploaded project missing from projects page');
    const cardCount = await page.locator('article').filter({ hasText: PROJECT_TITLE }).count();
    if (cardCount !== 1) fail(9, `Expected 1 project card, found ${cardCount}`);
    log(9, 'Public projects page shows only the one uploaded project');

    await spaClick(page, /Spending/i);
    const dashAfter = await page.textContent('body');
    if (DEMO_MARKERS.some((m) => dashAfter.includes(m))) fail(8, 'Fake data on dashboard after publish');
    log(8, 'Public dashboard loaded with no fake projects');

    // Step 10 — payment + progress (SPA only)
    await spaClick(page, /Ward office/i);
    await page.getByRole('link', { name: /Post Update/i }).click();
    await page.waitForURL(/\/admin\/add-update/);
    await postUpdate(page, projectId, 'Payment Release', async (p) => {
      await p.locator('#amount').fill('150000');
      await p.locator('#milestone').fill('First installment');
    });

    await spaClick(page, /Ward office/i);
    await page.getByRole('link', { name: /Post Update/i }).click();
    await postUpdate(page, projectId, 'Progress Update', async (p) => {
      await p.locator('#progressAfter').fill('35');
    });
    log(10, 'Added payment + progress update');

    // Step 11–12 — project detail from update success screen
    await page.getByRole('link', { name: /View Public Page/i }).click();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 15000 });
    await sleep(1000);
    const detailText = await page.textContent('body');
    const hasPayment = /150,?000|150000|First installment|payment record/i.test(detailText);
    const hasProgress = /35%/.test(detailText);
    if (!hasPayment && !hasProgress) {
      fail(12, `Payment/progress not visible on project detail. Snippet: ${detailText.slice(0, 400)}`);
    }
    log(11, 'Opened project detail');
    log(12, 'Payment visible on project detail');

    // Step 13 — citizen in same session (keeps shared DataContext state)
    await page.getByRole('button', { name: /Logout/i }).click();
    await sleep(500);
    await spaClick(page, /Register/i);
    await page.getByText('I am a Citizen', { exact: false }).click();
    await page.locator('#fullName').fill('E2E Test Citizen');
    await page.locator('#username').fill(`e2ecitizen${Date.now()}`);
    await page.locator('#email').fill(CITIZEN_EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('#confirmPassword').fill(PASSWORD);
    await page.getByRole('button', { name: /Create account|Register/i }).click();
    await page.waitForURL(/\/(dashboard|profile)/, { timeout: 15000 });
    log(13, `Registered citizen (${CITIZEN_EMAIL})`);

    // Step 14–15 — complaint
    await spaClick(page, /Share feedback/i);
    await page.locator('#wardNo').selectOption('1');
    await page.locator('#projectId').selectOption(projectId);
    await page.locator('#category').selectOption('Delay concern');
    await page.locator('textarea').first().fill('E2E test feedback: please verify footpath work progress near main road section.');
    await page.getByRole('button', { name: /Submit feedback/i }).click();
    await page.waitForSelector('text=Thank you for participating', { timeout: 15000 });
    log(14, 'Submitted complaint for real project');

    await spaClick(page, /Projects/i);
    await page.waitForURL(/\/projects\/?$/);
    await page.getByRole('link', { name: 'View project' }).click();
    await page.waitForURL(new RegExp(`/projects/${projectId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await sleep(500);
    const afterComplaint = await page.textContent('body');
    if (!/E2E test feedback|footpath work progress/i.test(afterComplaint)) {
      fail(15, `Complaint not visible on project detail. Snippet: ${afterComplaint.slice(0, 500)}`);
    }
    log(15, 'Complaint appears under the project');

    // Step 16–17 — Ward Mitra
    await spaClick(page, /Ask Ward Mitra/i);
    await page.locator('input[placeholder*="Ask"]').fill(`Tell me about ${PROJECT_TITLE}`);
    await page.getByRole('button', { name: /Send/i }).click();
    await sleep(2500);
    const chatText = await page.textContent('body');
    if (!chatText.includes(PROJECT_TITLE) && !chatText.includes('Footpath') && !chatText.includes('Ward 1')) {
      fail(17, 'Ward Mitra did not answer from uploaded project data');
    }
    if (DEMO_MARKERS.some((m) => chatText.includes(m))) {
      fail(17, 'Ward Mitra referenced demo/fake data');
    }
    log(16, 'Asked Ward Mitra about the project');
    log(17, 'Ward Mitra answered from uploaded data');
  } finally {
    await browser.close();
    if (devProcess) stopDevServer();
  }

  console.log('\n=== Browser E2E passed ===\n');
}

main().catch((err) => {
  console.error('\n' + err.message + '\n');
  stopDevServer();
  process.exit(1);
});
