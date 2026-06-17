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
  '대수': {
    '지수함수와 로그함수': ['지수와 로그', '지수함수와 로그함수'],
    '삼각함수': ['삼각함수의 뜻과 그래프', '삼각함수의 활용'],
    '수열': ['등차수열과 등비수열', '수열의 합', '수학적 귀납법']
  },
  '미적분': {
    '함수의 극한과 연속': ['함수의 극한', '함수의 연속'],
    '미분': ['미분계수와 도함수', '도함수의 활용'],
    '적분': ['부정적분과 정적분', '정적분의 활용']
  },
  '확률과 통계': {
    '경우의 수': ['여러 가지 순열', '조합'],
    '확률': ['확률의 뜻과 활용', '조건부확률'],
    '통계': ['확률분포', '통계적 추정']
  }
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
