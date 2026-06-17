// 사진 -> 텍스트 변환은 입력을 돕는 임시 작업장일 뿐이다.
// 추출된 텍스트는 화면에만 표시되고 저장되지 않는다 (문제 원문 비저장 원칙).
export function initOcr({ fileInput, scratchArea, statusEl }) {
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (typeof Tesseract === 'undefined') {
      statusEl.textContent = 'OCR 라이브러리를 불러오지 못했습니다.';
      return;
    }

    scratchArea.value = '';
    statusEl.textContent = '인식 중...';

    try {
      const { data } = await Tesseract.recognize(file, 'kor+eng');
      scratchArea.value = data.text.trim();
      statusEl.textContent = '인식 완료 — 참고용입니다. 정확한 내용은 직접 확인 후 아래 항목에 정리하세요.';
    } catch (err) {
      statusEl.textContent = '인식 실패: ' + err.message;
    } finally {
      fileInput.value = '';
    }
  });
}
