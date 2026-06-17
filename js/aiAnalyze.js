function fileToResizedBase64(file, maxDim = 1280) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
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
      const { base64, mediaType } = await fileToResizedBase64(file);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType })
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
