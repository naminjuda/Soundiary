import { Router } from 'express';
import { kakaoLoginStart, kakaoCallback } from '../controllers/auth.controller.js';

const router = Router();
router.get('/kakao', kakaoLoginStart);
router.get('/kakao/callback', kakaoCallback);

export default router;
