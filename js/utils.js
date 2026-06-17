const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, ch => ESCAPE_MAP[ch]);
}
