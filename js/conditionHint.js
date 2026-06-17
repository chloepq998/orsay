import { fileToResizedBase64 } from './imageUtils.js';
import { getLastAnalyzedImage } from './aiAnalyze.js';

export async function fetchConditionHint(condition, fileInput) {
  let image = getLastAnalyzedImage();
  if (!image) {
    const file = fileInput.files[0];
    if (!file) throw new Error('사진을 먼저 선택하거나 AI 분석을 먼저 실행하세요.');
    image = await fileToResizedBase64(file);
  }

  const response = await fetch('/api/conditionHint', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ imageBase64: image.base64, mediaType: image.mediaType, condition })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'AI 힌트 요청이 실패했습니다.');
  return data.role;
}
