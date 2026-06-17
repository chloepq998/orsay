import { IDEA_TAGS } from './constants.js';

export function renderTagCheckboxes(container) {
  container.innerHTML = IDEA_TAGS.map(tag => `
    <label class="tag-option">
      <input type="checkbox" name="tag" value="${tag}">
      ${tag}
    </label>
  `).join('');
}

export function getSelectedTags(container) {
  return [...container.querySelectorAll('input[name=tag]:checked')].map(el => el.value);
}
