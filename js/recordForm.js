import { recordStorage, intentStorage } from './storage.js';
import { FAILURE_CATEGORIES } from './constants.js';
import { renderTagCheckboxes, getSelectedTags } from './tagPicker.js';
import { initOcr } from './ocr.js';

export function initRecordForm({ onSaved }) {
  const form = document.getElementById('recordForm');
  const tagContainer = document.getElementById('tagContainer');
  renderTagCheckboxes(tagContainer);

  const failureSelect = document.getElementById('failureCategory');
  FAILURE_CATEGORIES.forEach(fc => {
    const opt = document.createElement('option');
    opt.value = fc.value;
    opt.textContent = fc.label;
    failureSelect.appendChild(opt);
  });

  initOcr({
    fileInput: document.getElementById('ocrInput'),
    scratchArea: document.getElementById('ocrScratch'),
    statusEl: document.getElementById('ocrStatus')
  });

  let conditionRoles = [];
  const crList = document.getElementById('crList');
  const crCondition = document.getElementById('crCondition');
  const crRole = document.getElementById('crRole');

  function renderCrList() {
    crList.innerHTML = conditionRoles.map((cr, i) => `
      <li>${cr.condition} → ${cr.role}
        <button type="button" data-i="${i}" class="cr-remove">삭제</button>
      </li>
    `).join('');
  }

  document.getElementById('crAddBtn').addEventListener('click', () => {
    const condition = crCondition.value.trim();
    const role = crRole.value.trim();
    if (!condition || !role) return;
    conditionRoles.push({ condition, role });
    crCondition.value = '';
    crRole.value = '';
    renderCrList();
  });

  crList.addEventListener('click', (e) => {
    if (e.target.classList.contains('cr-remove')) {
      conditionRoles.splice(Number(e.target.dataset.i), 1);
      renderCrList();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const intentLabel = document.getElementById('intentInput').value.trim();
    const intentPatternIds = intentLabel ? [intentStorage.resolve(intentLabel)] : [];

    const record = {
      id: crypto.randomUUID(),
      source: document.getElementById('source').value.trim(),
      problemNumber: document.getElementById('problemNumber').value.trim(),
      unit: document.getElementById('unit').value.trim(),
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      keyConditions: document.getElementById('keyConditions').value.trim(),
      intentPatternIds,
      firstApproach: document.getElementById('firstApproach').value.trim(),
      conditionRoles: [...conditionRoles],
      trap: document.getElementById('trap').value.trim(),
      stuckPoint: document.getElementById('stuckPoint').value.trim(),
      failureReason: document.getElementById('failureReason').value.trim(),
      failureCategory: failureSelect.value || null,
      nextSignal: document.getElementById('nextSignal').value.trim(),
      needsReview: document.getElementById('needsReview').checked,
      tags: getSelectedTags(tagContainer)
    };

    recordStorage.add(record);

    form.reset();
    conditionRoles = [];
    renderCrList();
    document.getElementById('ocrScratch').value = '';
    document.getElementById('ocrStatus').textContent = '';

    const statusEl = document.getElementById('saveStatus');
    statusEl.textContent = '저장되었습니다.';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);

    if (onSaved) onSaved();
  });
}
