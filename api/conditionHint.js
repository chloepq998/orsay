import { checkOrigin, checkRateLimit } from './_guard.js';

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

  const { imageBase64, mediaType, condition } = req.body || {};
  if (!imageBase64 || !condition) {
    res.status(400).json({ error: '이미지와 조건이 필요합니다.' });
    return;
  }

  const prompt = `다음은 수학 문제 사진입니다. 이 문제의 조건 중 하나는 다음과 같습니다: "${condition}"
이 조건이 문제 풀이에서 어떤 역할을 하는지 한 문장으로만 답하세요.
문제를 풀거나 정답/풀이 과정을 알려주지 마세요. 다른 설명 없이 역할 문장만 출력하세요.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: 'AI 힌트 요청이 실패했습니다.', detail });
      return;
    }

    const data = await response.json();
    const role = (data.content?.[0]?.text || '').trim();
    res.status(200).json({ role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
