import { recordStorage } from './storage.js';
import { escapeHtml } from './utils.js';

export function renderReviewList(container, { onEdit, onComplete }) {
  const records = recordStorage.getAll().filter(r => r.needsReview);

  if (records.length === 0) {
    container.innerHTML = '<p class="stub-note">복습할 기록이 없습니다.</p>';
    return;
  }

  container.innerHTML = records.map(r => `
    <article class="record-card" data-id="${r.id}">
      <h3>${escapeHtml(r.source) || '출처 없음'} ${r.problemNumber ? '#' + escapeHtml(r.problemNumber) : ''}</h3>
      <p><strong>주의할 함정:</strong> ${escapeHtml(r.trap) || '-'}</p>
      <p><strong>내가 막힌 지점:</strong> ${escapeHtml(r.stuckPoint) || '-'}</p>
      <p><strong>다음에 볼 신호:</strong> ${escapeHtml(r.nextSignal) || '-'}</p>
      <div class="card-actions">
        <button type="button" class="edit-btn">상세/수정</button>
        <button type="button" class="complete-btn">복습 완료</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.record-card').dataset.id;
      onEdit(recordStorage.getById(id));
    });
  });

  container.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.record-card').dataset.id;
      onComplete(id);
    });
  });
}
