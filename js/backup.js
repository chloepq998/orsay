import { exportData, importData } from './storage.js';

export function initBackup({ onImported }) {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const statusEl = document.getElementById('backupStatus');

  exportBtn.addEventListener('click', () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `math-records-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    statusEl.classList.remove('status-success', 'status-error');
    try {
      const data = JSON.parse(await file.text());
      const result = importData(data);
      statusEl.classList.add('status-success');
      statusEl.textContent = `✓ 기록 ${result.addedRecords}개, 출제 의도 ${result.addedIntents}개를 가져왔습니다.`;
      if (onImported) onImported();
    } catch (err) {
      statusEl.classList.add('status-error');
      statusEl.textContent = '가져오기 실패: ' + err.message;
    } finally {
      importFile.value = '';
    }
  });
}
