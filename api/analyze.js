import { checkOrigin, checkRateLimit } from './_guard.js';

const IDEA_TAGS = [
  '조건 해석형', '구조 관찰형', '발상 전환형', '그래프 해석형',
  '계산 유도형', '함정 회피형', '개념 확인형', '경우 분류형',
  '식 변형형', '역추적형'
];

const PROMPT = `다음은 수학 문제 사진입니다. 이 문제를 풀거나 정답/풀이 과정을 알려주지 마세요.
오직 아래 JSON 형식으로만 답하세요. JSON 외의 텍스트는 출력하지 마세요.

{
  "intent": "이 문제가 묻는 핵심 개념/발상 (한 문장)",
  "firstApproach": "이 문제에 접근하기 위해 가장 먼저 떠올려야 하는 발상 (한 문장)",
  "guideline": "유사한 문제를 풀 때 무엇을 먼저 확인해야 하는지에 대한 가이드라인 (1~2문장)",
  "tags": ["아래 태그 목록 중 이 문제에 해당하는 것만 선택"],
  "conditions": ["문제에 주어진 조건을 각각 한 문장씩 나열 (조건의 역할이나 풀이는 포함하지 말 것)"]
}

사용 가능한 태그 목록: ${IDEA_TAGS.join(', ')}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    return;
  }

  if (!checkOrigin(req, res)) return;
  if (!checkRateLimit(req, res)) return;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: '서버에 ANTHROPIC_API_KEY가 설정되어 있지 않습니다.' });
    return;
  }

  const { imageBase64, mediaType } = req.body || {};
  if (!imageBase64) {
    res.status(400).json({ error: '이미지 데이터가 없습니다.' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: PROMPT }
          ]
        }]
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: 'AI 분석 요청이 실패했습니다.', detail });
      return;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : null;

    if (!parsed) {
      res.status(502).json({ error: 'AI 응답을 해석할 수 없습니다.' });
      return;
    }

    parsed.tags = Array.isArray(parsed.tags) ? parsed.tags.filter(t => IDEA_TAGS.includes(t)) : [];
    parsed.conditions = Array.isArray(parsed.conditions)
      ? parsed.conditions.map(c => (c || '').toString().trim()).filter(Boolean)
      : [];
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
