import { initRecordForm } from './recordForm.js';
import { recordStorage, intentStorage } from './storage.js';

function renderIntentSuggestions() {
  const datalist = document.getElementById('intentSuggestions');
  datalist.innerHTML = intentStorage.getAll()
    .map(p => `<option value="${p.label}"></option>`).join('');
}

function renderRecordList() {
  const container = document.getElementById('recordList');
  const records = recordStorage.getAll();

  if (records.length === 0) {
    container.innerHTML = '<p class="stub-note">저장된 기록이 없습니다.</p>';
    return;
  }

  container.innerHTML = records.map(r => `
    <article class="record-card">
      <h3>${r.source || '출처 없음'} ${r.problemNumber ? '#' + r.problemNumber : ''}</h3>
      <p><strong>단원:</strong> ${r.unit || '-'}</p>
      <p><strong>핵심 조건:</strong> ${r.keyConditions || '-'}</p>
      <p><strong>필요한 첫 발상:</strong> ${r.firstApproach || '-'}</p>
      <p><strong>주의할 함정:</strong> ${r.trap || '-'}</p>
      <p><strong>내가 막힌 지점:</strong> ${r.stuckPoint || '-'}</p>
      <p><strong>다음에 볼 신호:</strong> ${r.nextSignal || '-'}</p>
      <p><strong>태그:</strong> ${r.tags.join(', ') || '-'}</p>
      <p><strong>복습 필요:</strong> ${r.needsReview ? '예' : '아니오'}</p>
    </article>
  `).join('');
}

function initNav() {
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(btn.dataset.target).classList.add('active');
      if (btn.dataset.target === 'screen-analysis') renderRecordList();
    });
  });
}

initNav();
renderIntentSuggestions();
initRecordForm({
  onSaved: () => {
    renderIntentSuggestions();
    renderRecordList();
  }
});
