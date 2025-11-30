// app.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

// [추가] path와 url 모듈 임포트
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.routes.js';
import spotifyRouter from './routes/spotify.routes.js'; // spotify router 추가
import geminiRouter from './routes/gemini.routes.js'; // gemini router 추가
import recommendationRouter from './routes/recommendation.routes.js'; // recommendation router 추가
import { notFound, errorHandler } from './middlewares/error.js';
import * as userRepo from './repositories/user.repo.js';

// [추가] __filename, __dirname 설정 (ESM 기준)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 전역 미들웨어
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.use('/auth', authRouter);
app.use('/spotify', spotifyRouter); // spotify 라우트 사용
app.use('/gemini', geminiRouter); // gemini 라우트 사용
app.use('/recommendation', recommendationRouter); // recommendation 라우트 사용

// ★ 프로필 업데이트 API (이게 없어서 404가 떴던 것!)
app.post('/auth/update-profile', async (req, res) => {
    const { kakao_id, nickname } = req.body;
    try {
        console.log(`📝 닉네임 변경 요청: ${nickname}`);

        // 1. DB 업데이트 수행
        const updatedUser = await userRepo.update(kakao_id, { nickname });
        
        if (!updatedUser) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        // 2. BigInt 처리 (안전을 위해 문자열로 변환)
        const userForClient = { 
            ...updatedUser, 
            kakao_id: updatedUser.kakao_id.toString() 
        };
        
        // 3. 성공 응답 보내기
        res.json(userForClient);

    } catch (error) {
        console.error("❌ 업데이트 에러:", error);
        res.status(500).json({ message: '서버 내부 오류' });
    }
});

// 404 & 에러 핸들러 (항상 마지막)
app.use(notFound);
app.use(errorHandler);

export default app;
