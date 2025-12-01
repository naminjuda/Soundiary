import * as authSvc from '../services/auth.service.js';

// ▼▼▼ [이 함수가 없거나 export가 빠져 있어서 에러가 난 겁니다!] ▼▼▼
export async function kakaoLoginStart(req, res, next) {
  try {
    // .env나 서비스에서 URL 생성 로직을 가져옴
    const url = authSvc.buildKakaoAuthUrl('dummy'); 
    console.log('[Kakao authorize URL]', url);
    return res.redirect(url);
  } catch (e) { 
    next(e); 
  }
}
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// 아까 수정한 콜백 함수 (req.body 버전)
export async function kakaoCallback(req, res, next) {
  try {
    const { code } = req.body; 

    if (!code) return res.status(400).json({ error: 'missing_code' });

    const { jwt, isNewUser, user } = await authSvc.handleKakaoCallback(code);

    return res.json({ jwt: jwt, isNewUser, user });   
    
  } catch (err) {
    next(err);
  }
}