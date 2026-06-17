import { recordStorage } from './storage.js';

export function fieldSuggestions(field) {
  const values = recordStorage.getAll().map(r => (r[field] || '').toString().trim()).filter(Boolean);
  return [...new Set(values)];
}

export function roleSuggestions() {
  const values = recordStorage.getAll()
    .flatMap(r => (r.conditionRoles || []).map(cr => (cr.role || '').trim()))
    .filter(Boolean);
  return [...new Set(values)];
}
