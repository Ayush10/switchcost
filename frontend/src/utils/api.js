const API_BASE = '/api';

export async function startAnalysis(task) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task }),
  });
  return res.json();
}

export async function getAnalysis(analysisId) {
  const res = await fetch(`${API_BASE}/analyze/${analysisId}`);
  return res.json();
}

export async function getMigrationPlan(analysisId) {
  const res = await fetch(`${API_BASE}/analyze/${analysisId}/plan`);
  return res.json();
}

export async function getQualityMatrix(analysisId) {
  const res = await fetch(`${API_BASE}/analyze/${analysisId}/quality-matrix`);
  return res.json();
}

export async function calculateSavings(dailyCalls, proprietaryModel) {
  const res = await fetch(`${API_BASE}/savings-calculator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ daily_calls: dailyCalls, proprietary_model: proprietaryModel }),
  });
  return res.json();
}

export async function getProprietaryModels() {
  const res = await fetch(`${API_BASE}/proprietary-models`);
  return res.json();
}

export async function getDemoTask() {
  const res = await fetch(`${API_BASE}/demo-task`);
  return res.json();
}
