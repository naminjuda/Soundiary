import * as authSvc from '../services/auth.service.js';

// export async function kakaoLoginStart(req, res, next) {
//   try {
//     // CSRF용 state는 JSON 방식이면 굳이 필요 없음 (원하면 추가 가능)
//     const url = authSvc.buildKakaoAuthUrl('dummy_state');
//     return res.redirect(url);
//   } catch (err) {
//     next(err);
//   }
// }

export async function kakaoLoginStart(_req, res, next) {
  try {
    const url = authSvc.buildKakaoAuthUrl('dummy');
    console.log('[Kakao authorize URL]', url); // 이 주소가 .env의 redirect_uri를 포함하는지 확인
    return res.redirect(url);
  } catch (e) { next(e); }
}


export async function kakaoCallback(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'missing_code' });

    const { jwt, isNewUser, user } = await authSvc.handleKakaoCallback(code);

    // JSON 응답 (프론트가 token 저장)
    return res.json({ token: jwt, isNewUser, user });
  } catch (err) {
    next(err);
  }
}
