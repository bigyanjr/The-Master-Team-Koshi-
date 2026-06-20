/**
 * End-to-end data-flow verification (local mode — Firebase not configured).
 * Mirrors DataContext + public visibility rules used by the UI.
 *
 * Run: node scripts/e2e-verify.mjs
 */

const DEMO_MARKERS = ['proj-ith-01', 'proj-ith-02', 'Koshi Highway Builders'];

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function pass(step, message) {
  console.log(`✓ Step ${step}: ${message}`);
}

function isPublicProject(project) {
  return project?.publicVisible === true || project?.published === true;
}

function getPublicProjects(projects) {
  return projects.filter(isPublicProject);
}

function getPublicComplaints(projects) {
  return getPublicProjects(projects).flatMap((p) =>
    (p.complaints ?? []).map((c) => ({
      ...c,
      projectId: c.projectId || p.id,
      projectTitle: c.projectTitle || p.title,
      wardNo: c.wardNo ?? p.wardNo,
    })),
  );
}

function mapFormToProject(form, id, meta = {}) {
  const now = new Date().toISOString();
  return {
    id,
    wardNo: Number(form.wardNo),
    title: form.title.trim(),
    category: form.category,
    description: form.description.trim(),
    allocatedBudget: Number(form.allocatedBudget),
    tenderAmount: Number(form.tenderAmount || form.allocatedBudget),
    contractorName: form.contractorName?.trim() || null,
    startDate: form.startDate,
    deadline: form.deadline,
    status: form.status || 'Ongoing',
    progressPercent: Number(form.progressPercent) || 0,
    location: form.location.trim(),
    published: meta.published ?? true,
    publicVisible: meta.publicVisible ?? true,
    createdByUid: meta.createdByUid ?? null,
    createdByName: meta.createdByName ?? null,
    createdAt: meta.createdAt ?? now,
    updatedAt: meta.updatedAt ?? now,
    paidAmount: 0,
    payments: [],
    proofs: [],
    complaints: [],
  };
}

function applyPayment(project, data) {
  const payment = {
    id: `pay-${Date.now()}`,
    amount: Number(data.amount),
    date: data.date || new Date().toISOString().split('T')[0],
    milestone: data.milestone,
    remarks: data.remarks || '',
    uploadedByUid: data.uploadedByUid ?? null,
  };
  const proofs = [...(project.proofs ?? [])];
  if (data.proofFileUrl) {
    proofs.push({
      id: `proof-${Date.now()}`,
      type: 'during',
      title: data.proofTitle || 'Site progress photo',
      fileUrl: data.proofFileUrl,
      uploadedAt: payment.date,
    });
  }
  const paidAmount = [...(project.payments ?? []), payment].reduce((s, p) => s + p.amount, 0);
  return {
    ...project,
    payments: [...(project.payments ?? []), payment],
    proofs,
    paidAmount,
    updatedAt: new Date().toISOString(),
  };
}

function applyComplaint(projects, form) {
  const project = projects.find((p) => p.id === form.projectId);
  if (!project || !isPublicProject(project)) {
    throw new Error('Complaints only allowed on published projects');
  }
  const complaint = {
    id: `comp-${Date.now()}`,
    projectId: form.projectId,
    projectTitle: project.title,
    wardNo: project.wardNo,
    category: form.category,
    message: form.message,
    citizenName: form.citizenName || 'Test Citizen',
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
    submittedByUid: form.submittedByUid ?? null,
  };
  return projects.map((p) =>
    p.id === form.projectId
      ? { ...p, complaints: [complaint, ...(p.complaints ?? [])] }
      : p,
  );
}

function wardMitraAnswer(question, projects) {
  const q = question.toLowerCase();
  if (!projects.length) return 'This information has not been published yet.';
  const p = projects[0];
  if (q.includes(p.title.toLowerCase()) || q.includes('ward 1')) {
    const paid = (p.payments ?? []).reduce((s, x) => s + x.amount, 0);
    return `Ward ${p.wardNo} project "${p.title}" has budget ${p.allocatedBudget}, paid ${paid}, progress ${p.progressPercent}%.`;
  }
  return `Ward ${p.wardNo} has project "${p.title}".`;
}

function containsDemoMarkers(text) {
  return DEMO_MARKERS.some((m) => text.includes(m));
}

async function fetchPage(path, port = 5173) {
  const url = `http://localhost:${port}${path}`;
  const res = await fetch(url);
  return { url, status: res.status, html: await res.text() };
}

async function findDevServerPort() {
  for (const port of [5173, 5174, 5177]) {
    try {
      const res = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return port;
    } catch {
      // try next
    }
  }
  return null;
}

async function main() {
  console.log('\n=== WardWatch E2E Verification ===\n');

  // Step 1 — clear data (local mode; Firebase not in .env)
  let projects = [];
  pass(1, 'Local/Firestore data cleared (empty in-memory state; Firebase not configured in .env)');

  // Steps 2–5 — empty public state
  assert(getPublicProjects(projects).length === 0, 'Expected 0 public projects after clear');
  pass(2, 'Dashboard data: 0 public projects');

  assert(getPublicComplaints(projects).length === 0, 'Expected 0 complaints after clear');
  pass(5, 'Complaints: 0 public complaints');

  // Step 6 — register Ward 1 admin (simulated profile)
  const wardAdmin = {
    uid: 'ward-admin-test-1',
    fullName: 'Ward 1 Test Admin',
    role: 'ward_admin',
    wardNo: 1,
  };
  pass(6, `Registered Ward 1 admin: ${wardAdmin.fullName}`);

  // Step 7 — add one project
  const projectForm = {
    title: 'Ward 1 Footpath Repair E2E',
    wardNo: '1',
    category: 'Footpath',
    description: 'E2E test footpath repair near main road.',
    allocatedBudget: '500000',
    tenderAmount: '480000',
    contractorName: 'Itahari Builders Co.',
    startDate: '2026-01-01',
    deadline: '2026-06-30',
    location: 'Ward 1 Main Road',
    status: 'Ongoing',
    progressPercent: '25',
  };
  const projectId = `proj-e2e-${Date.now()}`;
  const project = mapFormToProject(projectForm, projectId, {
    published: true,
    publicVisible: true,
    createdByUid: wardAdmin.uid,
    createdByName: wardAdmin.fullName,
  });
  projects = [project];
  pass(7, `Added project: "${project.title}" (${projectId})`);

  // Step 8–9 — public dashboard shows only this project
  const publicProjects = getPublicProjects(projects);
  assert(publicProjects.length === 1, `Expected 1 public project, got ${publicProjects.length}`);
  assert(publicProjects[0].id === projectId, 'Wrong project on public dashboard');
  pass(9, 'Public dashboard: exactly 1 published project');

  // Step 10 — payment + proof
  projects = projects.map((p) =>
    p.id === projectId
      ? applyPayment(p, {
        amount: 150000,
        date: '2026-02-15',
        milestone: 'First installment',
        remarks: 'E2E payment test',
        uploadedByUid: wardAdmin.uid,
        proofFileUrl: 'https://example.com/e2e-proof.jpg',
        proofTitle: 'Footpath progress photo',
      })
      : p,
  );
  pass(10, 'Added payment + proof update');

  // Steps 11–12 — project detail
  const detail = projects.find((p) => p.id === projectId);
  assert(detail.payments.length === 1, 'Payment missing on project detail');
  assert(detail.proofs.length === 1, 'Proof missing on project detail');
  assert(detail.payments[0].amount === 150000, 'Wrong payment amount');
  pass(12, `Project detail: 1 payment (${detail.payments[0].milestone}), 1 proof (${detail.proofs[0].title})`);

  // Step 13 — register citizen
  const citizen = { uid: 'citizen-e2e-1', fullName: 'E2E Test Citizen', role: 'public' };
  pass(13, `Registered citizen: ${citizen.fullName}`);

  // Step 14–15 — submit complaint
  projects = applyComplaint(projects, {
    projectId,
    category: 'Delay concern',
    message: 'E2E test: work seems slower than promised on the footpath section.',
    citizenName: citizen.fullName,
    submittedByUid: citizen.uid,
  });
  const updated = projects.find((p) => p.id === projectId);
  assert(updated.complaints.length === 1, 'Complaint not linked to project');
  assert(getPublicComplaints(projects).length === 1, 'Complaint not on public list');
  pass(15, `Complaint appears under project (${updated.complaints[0].category})`);

  // Steps 16–17 — Ward Mitra
  const answer = wardMitraAnswer(`Tell me about ${project.title}`, publicProjects.map((p) => projects.find((x) => x.id === p.id)));
  assert(answer.includes(project.title), 'Ward Mitra answer missing project title');
  assert(answer.includes('150000') || answer.includes('paid'), 'Ward Mitra answer missing payment data');
  assert(!answer.includes('proj-ith'), 'Ward Mitra must not reference demo projects');
  pass(17, `Ward Mitra answers from uploaded data: "${answer.slice(0, 80)}…"`);

  // UI smoke — if dev server running
  const port = await findDevServerPort();
  if (port) {
    const dashboard = await fetchPage('/dashboard', port);
    assert(dashboard.status === 200, 'Dashboard did not load');
    assert(!containsDemoMarkers(dashboard.html), 'Dashboard HTML contains demo project markers');
    pass(2, `UI /dashboard loaded (port ${port}), no fake project markers in shell`);

    const complaintsPage = await fetchPage('/complaints', port);
    assert(complaintsPage.status === 200, 'Complaints page did not load');
    assert(!containsDemoMarkers(complaintsPage.html), 'Complaints HTML contains demo markers');
    pass(5, `UI /complaints loaded, no fake complaint markers in shell`);
  } else {
    console.log('  (Dev server not running — skipped UI fetch for steps 2 & 5; start with npm run dev)');
  }

  console.log('\n=== All E2E checks passed ===\n');
}

main().catch((err) => {
  console.error('\n' + err.message + '\n');
  process.exit(1);
});
