import { Router } from 'express';
import { kakaoLoginStart, kakaoCallback } from '../controllers/auth.controller.js';

const router = Router();

// 이 라우트는 (아마도) 서버사이드에서 리디렉션할 때 사용 (지금은 안 쓰임)
router.get('/kakao', kakaoLoginStart); 

// 🔴 수정 전:
// router.get('/kakao/callback', kakaoCallback);

// 🟢 수정 후: (프론트엔드의 POST /auth/kakao 요청을 처리)
router.post('/kakao', kakaoCallback);

export default router;