import { initRecordForm } from './recordForm.js';
import { recordStorage, intentStorage } from './storage.js';
import { renderRecordList } from './analysisList.js';
import { renderStats } from './stats.js';
import { renderReviewList } from './reviewList.js';

function renderIntentSuggestions() {
  const datalist = document.getElementById('intentSuggestions');
  datalist.innerHTML = intentStorage.getAll()
    .map(p => `<option value="${p.label}"></option>`).join('');
}

function goToInputScreen() {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.target === 'screen-input'));
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-input'));
}

function refreshAnalysis() {
  renderRecordList(document.getElementById('recordList'), {
    onEdit: (record) => { recordForm.startEditing(record); goToInputScreen(); },
    onDelete: (id) => {
      recordStorage.remove(id);
      refreshAnalysis();
      refreshReview();
      refreshStats();
    }
  });
}

function refreshReview() {
  renderReviewList(document.getElementById('reviewList'), {
    onEdit: (record) => { recordForm.startEditing(record); goToInputScreen(); },
    onComplete: (id) => {
      recordStorage.update(id, { needsReview: false, reviewedAt: new Date().toISOString() });
      refreshReview();
      refreshStats();
    }
  });
}

function refreshStats() {
  const limitValue = document.getElementById('statsLimit').value;
  renderStats(document.getElementById('statsContent'), limitValue === 'all' ? 'all' : Number(limitValue));
}

function initNav() {
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(btn.dataset.target).classList.add('active');
      if (btn.dataset.target === 'screen-analysis') refreshAnalysis();
      if (btn.dataset.target === 'screen-stats') refreshStats();
      if (btn.dataset.target === 'screen-review') refreshReview();
    });
  });
}

const recordForm = initRecordForm({
  onSaved: () => {
    renderIntentSuggestions();
    refreshAnalysis();
    refreshReview();
    refreshStats();
  }
});

document.getElementById('statsLimit').addEventListener('change', refreshStats);

initNav();
renderIntentSuggestions();
