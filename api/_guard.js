const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const hits = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// fetch()로 보낸 POST는 동일 출처여도 Origin 헤더가 항상 포함되므로,
// 이 헤더가 없거나 호스트가 다르면 외부에서 직접 호출한 것으로 간주
export function checkOrigin(req, res) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  let originHost;
  try {
    originHost = origin && new URL(origin).host;
  } catch {
    originHost = null;
  }
  if (!originHost || !host || originHost !== host) {
    res.status(403).json({ error: '허용되지 않은 요청입니다.' });
    return false;
  }
  return true;
}

// 서버리스 인스턴스별 메모리 기반 best-effort 레이트리밋 (콜드 스타트 시 초기화됨)
export function checkRateLimit(req, res) {
  const ip = getClientIp(req);
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' });
    return false;
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  return true;
}
