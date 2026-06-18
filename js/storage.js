const RECORDS_KEY = 'mathRecords';
const INTENTS_KEY = 'mathIntentPatterns';

function readAll(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function writeAll(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

export const recordStorage = {
  getAll() {
    return readAll(RECORDS_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getById(id) {
    return readAll(RECORDS_KEY).find(r => r.id === id) || null;
  },
  add(record) {
    const all = readAll(RECORDS_KEY);
    all.push(record);
    writeAll(RECORDS_KEY, all);
  },
  update(id, patch) {
    const all = readAll(RECORDS_KEY);
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], ...patch };
    writeAll(RECORDS_KEY, all);
  },
  remove(id) {
    writeAll(RECORDS_KEY, readAll(RECORDS_KEY).filter(r => r.id !== id));
  }
};

export function exportData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    records: readAll(RECORDS_KEY),
    intents: readAll(INTENTS_KEY)
  };
}

// id가 겹치지 않는 항목만 추가하는 병합 방식 — 기존 기록을 덮어쓰지 않음
export function importData(data) {
  const existingRecords = readAll(RECORDS_KEY);
  const existingRecordIds = new Set(existingRecords.map(r => r.id));
  const newRecords = (data.records || []).filter(r => r && r.id && !existingRecordIds.has(r.id));
  writeAll(RECORDS_KEY, [...existingRecords, ...newRecords]);

  const existingIntents = readAll(INTENTS_KEY);
  const existingIntentIds = new Set(existingIntents.map(p => p.id));
  const newIntents = (data.intents || []).filter(p => p && p.id && !existingIntentIds.has(p.id));
  writeAll(INTENTS_KEY, [...existingIntents, ...newIntents]);

  return { addedRecords: newRecords.length, addedIntents: newIntents.length };
}

export const intentStorage = {
  getAll() {
    return readAll(INTENTS_KEY).sort((a, b) => b.usageCount - a.usageCount);
  },
  findByLabel(label) {
    const target = label.trim().toLowerCase();
    return readAll(INTENTS_KEY).find(p => p.label.trim().toLowerCase() === target) || null;
  },
  getById(id) {
    return readAll(INTENTS_KEY).find(p => p.id === id) || null;
  },
  incrementUsage(id) {
    const all = readAll(INTENTS_KEY);
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return;
    all[idx].usageCount += 1;
    writeAll(INTENTS_KEY, all);
  },
  // 기존 패턴이 있으면 재사용(사용 횟수 증가), 없으면 새로 등록 — 사용자가 직접 쌓는 출제 의도 사전
  resolve(label) {
    const trimmed = label.trim();
    if (!trimmed) return null;
    const existing = this.findByLabel(trimmed);
    if (existing) {
      this.incrementUsage(existing.id);
      return existing.id;
    }
    const pattern = {
      id: crypto.randomUUID(),
      label: trimmed,
      usageCount: 1,
      createdAt: new Date().toISOString()
    };
    const all = readAll(INTENTS_KEY);
    all.push(pattern);
    writeAll(INTENTS_KEY, all);
    return pattern.id;
  }
};
