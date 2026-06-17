export const IDEA_TAGS = [
  '조건 해석형',
  '구조 관찰형',
  '발상 전환형',
  '그래프 해석형',
  '계산 유도형',
  '함정 회피형',
  '개념 확인형',
  '경우 분류형',
  '식 변형형',
  '역추적형'
];

export const UNIT_STRUCTURE = {
  '대수': ['지수함수와 로그함수', '삼각함수', '수열'],
  '미적분': ['함수의 극한과 연속', '미분', '적분'],
  '확률과 통계': ['경우의 수', '확률', '통계']
};

export const FAILURE_CATEGORIES = [
  { value: 'CONDITION_MISREAD', label: '조건 해석 실수' },
  { value: 'APPROACH_FAIL', label: '첫 발상 실패' },
  { value: 'CALCULATION_ERROR', label: '계산 실수' },
  { value: 'CONCEPT_GAP', label: '개념 부족' },
  { value: 'GRAPH_MISREAD', label: '그래프 해석 실패' },
  { value: 'OTHER', label: '기타' }
];

export function failureCategoryLabel(value) {
  return FAILURE_CATEGORIES.find(c => c.value === value)?.label || value;
}
