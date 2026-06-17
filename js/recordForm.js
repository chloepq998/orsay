import { recordStorage, intentStorage } from './storage.js';
import { FAILURE_CATEGORIES } from './constants.js';
import { renderTagCheckboxes, getSelectedTags } from './tagPicker.js';
import { initOcr } from './ocr.js';

export function initRecordForm({ onSaved }) {
  const form = document.getElementById('recordForm');
  const tagContainer = document.getElementById('tagContainer');
  const formModeTitle = document.getElementById('formModeTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
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
  let editingId = null;
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

  function setFormMode(isEditing) {
    formModeTitle.textContent = isEditing ? '문제 기록 수정' : '문제 기록 입력';
    submitBtn.textContent = isEditing ? '수정 저장' : '저장';
    cancelBtn.style.display = isEditing ? 'inline-block' : 'none';
  }

  function resetForm() {
    form.reset();
    conditionRoles = [];
    renderCrList();
    document.getElementById('ocrScratch').value = '';
    document.getElementById('ocrStatus').textContent = '';
    editingId = null;
    setFormMode(false);
  }

  cancelBtn.addEventListener('click', resetForm);

  function startEditing(record) {
    editingId = record.id;
    document.getElementById('source').value = record.source || '';
    document.getElementById('problemNumber').value = record.problemNumber || '';
    document.getElementById('unit').value = record.unit || '';
    document.getElementById('keyConditions').value = record.keyConditions || '';

    const firstIntentId = (record.intentPatternIds || [])[0];
    document.getElementById('intentInput').value = firstIntentId ? (intentStorage.getById(firstIntentId)?.label || '') : '';

    document.getElementById('firstApproach').value = record.firstApproach || '';
    conditionRoles = (record.conditionRoles || []).map(cr => ({ ...cr }));
    renderCrList();
    document.getElementById('trap').value = record.trap || '';
    document.getElementById('stuckPoint').value = record.stuckPoint || '';
    document.getElementById('failureReason').value = record.failureReason || '';
    failureSelect.value = record.failureCategory || '';
    document.getElementById('nextSignal').value = record.nextSignal || '';
    document.getElementById('needsReview').checked = !!record.needsReview;

    tagContainer.querySelectorAll('input[name=tag]').forEach(cb => {
      cb.checked = (record.tags || []).includes(cb.value);
    });

    setFormMode(true);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const intentLabel = document.getElementById('intentInput').value.trim();
    const intentPatternIds = intentLabel ? [intentStorage.resolve(intentLabel)] : [];

    const fields = {
      source: document.getElementById('source').value.trim(),
      problemNumber: document.getElementById('problemNumber').value.trim(),
      unit: document.getElementById('unit').value.trim(),
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

    if (editingId) {
      recordStorage.update(editingId, fields);
    } else {
      recordStorage.add({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        ...fields
      });
    }

    const wasEditing = !!editingId;
    resetForm();

    const statusEl = document.getElementById('saveStatus');
    statusEl.textContent = wasEditing ? '수정되었습니다.' : '저장되었습니다.';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);

    if (onSaved) onSaved();
  });

  return { startEditing };
}
