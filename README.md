# orsay

수학 문제 분석 기록 앱. 정적 HTML/CSS/JS + localStorage로 동작하며, "AI로 출제 의도 분석" 버튼은 Vercel Serverless Function(`api/analyze.js`)을 통해 Claude API를 호출합니다.

## AI 분석 기능 설정 (Vercel)

1. https://console.anthropic.com 에서 API 키를 발급받습니다.
2. Vercel 프로젝트 → Settings → Environment Variables 에서 `ANTHROPIC_API_KEY` 값을 추가합니다.
3. (선택) 사용할 모델을 바꾸려면 `ANTHROPIC_MODEL` 환경변수를 추가합니다. 기본값은 `claude-sonnet-4-6`입니다.
4. 재배포하면 입력 화면의 "AI로 출제 의도 분석" 버튼이 동작합니다.

API 키를 설정하지 않으면 버튼을 눌렀을 때 안내 메시지만 표시되고, 나머지 기능(기록/통계/복습)은 그대로 동작합니다.

AI 분석 결과는 출제 의도/첫 발상/가이드라인/태그 입력칸에 초안으로만 채워지며, 저장 전에 직접 확인하고 수정할 수 있습니다.
