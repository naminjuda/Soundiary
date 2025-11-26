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
import diaryRouter from './routes/diary.routes.js'; // diary router 추가
import { notFound, errorHandler } from './middlewares/error.js';

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
app.use('/diary', diaryRouter); // diary 라우트 사용

// 404 & 에러 핸들러 (항상 마지막)
app.use(notFound);
app.use(errorHandler);

export default app;
