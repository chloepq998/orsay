import { recordStorage } from './storage.js';
import { ANSWER_STATUSES, FAILURE_CATEGORIES } from './constants.js';

function renderBarList(entries) {
  if (entries.length === 0) return '<p class="stub-note">데이터 없음</p>';
  const max = Math.max(...entries.map(e => e.count));
  return `<ul class="bar-list">${entries.map(e => `
    <li>
      <span class="bar-label">${e.label} (${e.count})</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(e.count / max * 100).toFixed(0)}%"></span></span>
    </li>
  `).join('')}</ul>`;
}

export function renderStats(container, limit) {
  const all = recordStorage.getAll(); // 최신순
  const recent = limit === 'all' ? all : all.slice(0, limit);

  if (recent.length === 0) {
    container.innerHTML = '<p class="stub-note">분석할 기록이 없습니다.</p>';
    return;
  }

  const answerCounts = {};
  ANSWER_STATUSES.forEach(s => { answerCounts[s.value] = 0; });
  recent.forEach(r => {
    if (r.answerStatus && answerCounts.hasOwnProperty(r.answerStatus)) {
      answerCounts[r.answerStatus] += 1;
    }
  });
  const answeredCount = ANSWER_STATUSES.reduce((sum, s) => sum + answerCounts[s.value], 0);
  const correctRate = answeredCount > 0 ? Math.round(answerCounts.CORRECT / answeredCount * 100) : null;
  const answerEntries = ANSWER_STATUSES
    .map(s => ({ label: s.label, count: answerCounts[s.value] }))
    .filter(e => e.count > 0);

  const failureCounts = {};
  FAILURE_CATEGORIES.forEach(c => { failureCounts[c.value] = 0; });
  recent.forEach(r => {
    if (r.failureCategory && failureCounts.hasOwnProperty(r.failureCategory)) {
      failureCounts[r.failureCategory] += 1;
    }
  });
  const failureEntries = FAILURE_CATEGORIES
    .map(c => ({ label: c.label, count: failureCounts[c.value] }))
    .filter(e => e.count > 0)
    .sort((a, b) => b.count - a.count);

  const tagCounts = {};
  recent.forEach(r => (r.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const tagEntries = Object.entries(tagCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const needsReviewCount = recent.filter(r => r.needsReview).length;

  container.innerHTML = `
    <p class="stats-summary">최근 ${recent.length}개 기록 기준 (복습 필요 ${needsReviewCount}개)${correctRate !== null ? ` · 정답률 ${correctRate}%` : ''}</p>
    <h3>정답 현황</h3>
    ${renderBarList(answerEntries)}
    <h3>틀린 이유 분류</h3>
    ${renderBarList(failureEntries)}
    <h3>발상 태그 빈도</h3>
    ${renderBarList(tagEntries)}
  `;
}
