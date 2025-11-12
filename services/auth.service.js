import * as kakao from './kakao.client.js';
import * as users from '../repositories/user.repo.js';
import * as jwtSvc from './jwt.service.js';

export function buildKakaoAuthUrl(state = '') {
  return kakao.buildAuthorizeUrl(state);
}

export async function handleKakaoCallback(code) {
  // 1) code → access_token
  const token = await kakao.exchangeToken(code);

  // 2) 사용자 정보
  const me = await kakao.getUserMe(token.access_token);
  const kakao_id = me.id; // number
  const nickname = me.kakao_account?.profile?.nickname || 'user';

  // 3) upsert
  let user = await users.findByKakaoId(kakao_id);
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await users.create({
      kakao_id,
      nickname: null,    // 신규이면 닉네임은 나중에 설정
      item_count: 0,
    });
  } else {
    // 필요 시 동기화
    // user = await users.update(kakao_id, { nickname });
  }

  // 4) JWT
  const jwt = jwtSvc.sign({ sub: String(kakao_id), kakao_id });
  return { jwt, isNewUser, user };
}
