import { recordStorage, intentStorage } from './storage.js';
import { answerStatusLabel, failureCategoryLabel } from './constants.js';
import { escapeHtml } from './utils.js';

export function renderRecordList(container, { onEdit, onDelete }) {
  const records = recordStorage.getAll();

  if (records.length === 0) {
    container.innerHTML = '<p class="stub-note">저장된 기록이 없습니다.</p>';
    return;
  }

  const intentLabel = (id) => intentStorage.getById(id)?.label || '';

  container.innerHTML = records.map(r => `
    <article class="record-card" data-id="${r.id}">
      <h3>${escapeHtml(r.source) || '출처 없음'} ${r.problemNumber ? '#' + escapeHtml(r.problemNumber) : ''}
        ${r.answerStatus ? `<span class="answer-badge answer-${r.answerStatus}">${escapeHtml(answerStatusLabel(r.answerStatus))}</span>` : ''}
      </h3>
      <p><strong>단원:</strong> ${escapeHtml(r.unit) || '-'}</p>
      <p><strong>출제 의도:</strong> ${(r.intentPatternIds || []).map(intentLabel).filter(Boolean).map(escapeHtml).join(', ') || '-'}</p>
      <p><strong>핵심 조건:</strong> ${escapeHtml(r.keyConditions) || '-'}</p>
      <p><strong>필요한 첫 발상:</strong> ${escapeHtml(r.firstApproach) || '-'}</p>
      ${(r.conditionRoles || []).length ? `
        <p><strong>조건별 역할:</strong></p>
        <ul class="cr-readonly-list">${r.conditionRoles.map(cr => `<li>${escapeHtml(cr.condition)} → ${escapeHtml(cr.role)}</li>`).join('')}</ul>
      ` : ''}
      <p><strong>주의할 함정:</strong> ${escapeHtml(r.trap) || '-'}</p>
      <p><strong>내가 막힌 지점:</strong> ${escapeHtml(r.stuckPoint) || '-'}</p>
      <p><strong>틀린 이유:</strong> ${escapeHtml(r.failureReason) || '-'} ${r.failureCategory ? '(' + escapeHtml(failureCategoryLabel(r.failureCategory)) + ')' : ''}</p>
      <p><strong>다음에 볼 신호:</strong> ${escapeHtml(r.nextSignal) || '-'}</p>
      <p><strong>태그:</strong></p>
      <div class="tag-pills">${(r.tags || []).length ? r.tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('') : '-'}</div>
      <p><strong>복습 필요:</strong> ${r.needsReview ? '예' : '아니오'}</p>
      <div class="card-actions">
        <button type="button" class="edit-btn">수정</button>
        <button type="button" class="delete-btn">삭제</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.record-card').dataset.id;
      onEdit(recordStorage.getById(id));
    });
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.record-card').dataset.id;
      if (confirm('이 기록을 삭제하시겠습니까?')) onDelete(id);
    });
  });
}
