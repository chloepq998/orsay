import { recordStorage, intentStorage } from './storage.js';
import { FAILURE_CATEGORIES, UNIT_STRUCTURE } from './constants.js';
import { renderTagCheckboxes, getSelectedTags } from './tagPicker.js';
import { initOcr } from './ocr.js';
import { initAiAnalyze } from './aiAnalyze.js';
import { fetchConditionHint } from './conditionHint.js';
import { fieldSuggestions, roleSuggestions } from './suggestions.js';
import { escapeHtml } from './utils.js';

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

  const subjectSelect = document.getElementById('subjectSelect');
  const unitSelect = document.getElementById('unitSelect');
  const subUnitSelect = document.getElementById('subUnitSelect');
  Object.keys(UNIT_STRUCTURE).forEach(subject => {
    const opt = document.createElement('option');
    opt.value = subject;
    opt.textContent = subject;
    subjectSelect.appendChild(opt);
  });

  function populateUnitOptions(subject, selectedUnit, selectedSubUnit) {
    const units = Object.keys(UNIT_STRUCTURE[subject] || {});
    unitSelect.innerHTML = '<option value="">선택</option>' +
      units.map(u => `<option value="${u}">${u}</option>`).join('');
    if (selectedUnit) unitSelect.value = selectedUnit;
    populateSubUnitOptions(subject, unitSelect.value, selectedSubUnit);
  }

  function populateSubUnitOptions(subject, unit, selectedSubUnit) {
    const subUnits = (UNIT_STRUCTURE[subject] || {})[unit] || [];
    subUnitSelect.innerHTML = '<option value="">선택</option>' +
      subUnits.map(su => `<option value="${su}">${su}</option>`).join('');
    if (selectedSubUnit) subUnitSelect.value = selectedSubUnit;
  }

  subjectSelect.addEventListener('change', () => populateUnitOptions(subjectSelect.value));
  unitSelect.addEventListener('change', () => populateSubUnitOptions(subjectSelect.value, unitSelect.value));

  initOcr({
    fileInput: document.getElementById('ocrInput'),
    scratchArea: document.getElementById('ocrScratch'),
    statusEl: document.getElementById('ocrStatus')
  });

  initAiAnalyze({
    fileInput: document.getElementById('ocrInput'),
    button: document.getElementById('aiAnalyzeBtn'),
    statusEl: document.getElementById('aiStatus'),
    onResult: (data) => {
      if (data.intent) document.getElementById('intentInput').value = data.intent;
      if (data.firstApproach) document.getElementById('firstApproach').value = data.firstApproach;
      if (data.guideline) document.getElementById('nextSignal').value = data.guideline;
      if (Array.isArray(data.tags)) {
        tagContainer.querySelectorAll('input[name=tag]').forEach(cb => {
          cb.checked = data.tags.includes(cb.value);
        });
      }
      if (Array.isArray(data.conditions)) {
        data.conditions.forEach(c => {
          if (c && !conditionRoles.some(cr => cr.condition === c)) {
            conditionRoles.push({ condition: c, role: '' });
          }
        });
        renderCrList();
      }
    }
  });

  let conditionRoles = [];
  let editingId = null;
  const crList = document.getElementById('crList');
  const crCondition = document.getElementById('crCondition');
  const crRole = document.getElementById('crRole');
  const crHintStatus = document.getElementById('crHintStatus');

  function renderCrList() {
    crList.innerHTML = conditionRoles.map((cr, i) => `
      <li>
        <div class="cr-condition">${escapeHtml(cr.condition)}</div>
        <div class="cr-role-row">
          <input type="text" class="cr-role-input" data-i="${i}" list="crRoleSuggestions" value="${escapeHtml(cr.role || '')}" placeholder="이 조건의 역할">
          <button type="button" class="cr-hint-btn" data-i="${i}">AI 힌트</button>
          <button type="button" class="cr-remove" data-i="${i}">삭제</button>
        </div>
      </li>
    `).join('');
  }

  document.getElementById('crAddBtn').addEventListener('click', () => {
    const condition = crCondition.value.trim();
    const role = crRole.value.trim();
    if (!condition) return;
    conditionRoles.push({ condition, role });
    crCondition.value = '';
    crRole.value = '';
    renderCrList();
  });

  crList.addEventListener('input', (e) => {
    if (e.target.classList.contains('cr-role-input')) {
      conditionRoles[Number(e.target.dataset.i)].role = e.target.value;
    }
  });

  crList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('cr-remove')) {
      conditionRoles.splice(Number(e.target.dataset.i), 1);
      renderCrList();
      return;
    }

    if (e.target.classList.contains('cr-hint-btn')) {
      const i = Number(e.target.dataset.i);
      const btn = e.target;
      const input = crList.querySelector(`.cr-role-input[data-i="${i}"]`);
      btn.disabled = true;
      btn.textContent = '분석 중...';
      crHintStatus.textContent = '';
      try {
        const role = await fetchConditionHint(conditionRoles[i].condition, document.getElementById('ocrInput'));
        conditionRoles[i].role = role;
        input.value = role;
      } catch (err) {
        crHintStatus.textContent = '힌트 요청 실패: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'AI 힌트';
      }
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
    unitSelect.innerHTML = '<option value="">과목을 먼저 선택하세요</option>';
    subUnitSelect.innerHTML = '<option value="">대단원을 먼저 선택하세요</option>';
    document.getElementById('ocrScratch').value = '';
    document.getElementById('ocrStatus').textContent = '';
    document.getElementById('aiStatus').textContent = '';
    crHintStatus.textContent = '';
    editingId = null;
    setFormMode(false);
  }

  function populateDatalist(id, values) {
    document.getElementById(id).innerHTML = values.map(v => `<option value="${escapeHtml(v)}"></option>`).join('');
  }

  function refreshSuggestions() {
    populateDatalist('sourceSuggestions', fieldSuggestions('source'));
    populateDatalist('keyConditionsSuggestions', fieldSuggestions('keyConditions'));
    populateDatalist('firstApproachSuggestions', fieldSuggestions('firstApproach'));
    populateDatalist('trapSuggestions', fieldSuggestions('trap'));
    populateDatalist('stuckPointSuggestions', fieldSuggestions('stuckPoint'));
    populateDatalist('failureReasonSuggestions', fieldSuggestions('failureReason'));
    populateDatalist('nextSignalSuggestions', fieldSuggestions('nextSignal'));
    populateDatalist('crRoleSuggestions', roleSuggestions());
  }

  refreshSuggestions();

  cancelBtn.addEventListener('click', resetForm);

  function startEditing(record) {
    editingId = record.id;
    document.getElementById('source').value = record.source || '';
    document.getElementById('problemNumber').value = record.problemNumber || '';
    const [recordSubject, recordUnit, recordSubUnit] = (record.unit || '').split(' - ');
    subjectSelect.value = recordSubject || '';
    populateUnitOptions(recordSubject, recordUnit, recordSubUnit);
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

    const unitParts = [subjectSelect.value, unitSelect.value, subUnitSelect.value].filter(Boolean);
    const unit = unitParts.join(' - ');

    const fields = {
      source: document.getElementById('source').value.trim(),
      problemNumber: document.getElementById('problemNumber').value.trim(),
      unit,
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
    refreshSuggestions();

    const statusEl = document.getElementById('saveStatus');
    statusEl.textContent = wasEditing ? '수정되었습니다.' : '저장되었습니다.';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);

    if (onSaved) onSaved();
  });

  return { startEditing };
}
