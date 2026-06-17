import { fileToResizedBase64 } from './imageUtils.js';

let lastImage = null;

export function getLastAnalyzedImage() {
  return lastImage;
}

export function initAiAnalyze({ fileInput, button, statusEl, onResult }) {
  button.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      statusEl.textContent = '먼저 사진을 선택하세요.';
      return;
    }

    button.disabled = true;
    statusEl.textContent = 'AI가 분석 중입니다...';

    try {
      const image = await fileToResizedBase64(file);
      lastImage = image;
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageBase64: image.base64, mediaType: image.mediaType })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI 분석에 실패했습니다.');

      onResult(data);
      statusEl.textContent = 'AI 분석 초안이 채워졌습니다. 내용을 확인하고 직접 수정한 뒤 저장하세요.';
    } catch (err) {
      statusEl.textContent = '분석 실패: ' + err.message;
    } finally {
      button.disabled = false;
    }
  });
}
