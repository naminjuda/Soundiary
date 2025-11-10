// services/kakao.client.js
import 'dotenv/config'; 

const KAUTH = 'https://kauth.kakao.com';
const KAPI  = 'https://kapi.kakao.com';

function getEnv() {
  const {
    KAKAO_REST_API_KEY,
    KAKAO_CLIENT_SECRET,
    KAKAO_REDIRECT_URI,
  } = process.env;

  if (!KAKAO_REST_API_KEY || !KAKAO_REDIRECT_URI) {
    throw new Error(
      `Missing env: KAKAO_REST_API_KEY or KAKAO_REDIRECT_URI (got: client_id=${KAKAO_REST_API_KEY}, redirect_uri=${KAKAO_REDIRECT_URI})`
    );
  }
  return { KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI };
}

export function buildAuthorizeUrl(state = '') {
  const { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } = getEnv();
  const p = new URLSearchParams({
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: 'code',
    state,
  });
  return `${KAUTH}/oauth/authorize?${p.toString()}`;
}

export async function exchangeToken(code) {
  const { KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI } = getEnv();

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    code,
  });
  if (KAKAO_CLIENT_SECRET) body.set('client_secret', KAKAO_CLIENT_SECRET);

  const resp = await fetch(`${KAUTH}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`kakao token error: ${resp.status} ${t}`);
  }
  return resp.json();
}

export async function getUserMe(accessToken) {
  const resp = await fetch(`${KAPI}/v2/user/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`kakao me error: ${resp.status} ${t}`);
  }
  return resp.json();
}

