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
import { notFound, errorHandler } from './middlewares/error.js';

// [추가] __filename, __dirname 설정 (ESM 기준)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 전역 미들웨어
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ⭐️ [핵심 코드 추가] ⭐️
// 'public' 폴더를 정적 파일 제공 폴더로 설정합니다.
// 이렇게 하면 /login.html, /css/style.css, /js/index.js 등을
// 브라우저에서 '/경로'로 직접 접근할 수 있게 됩니다.
app.use(express.static(path.join(__dirname, 'public')));

// 라우팅 (API 라우터)
// API 경로는 '/api' 같은 접두사를 붙여 정적 파일 경로와 충돌하지 않게 하는 것이 좋습니다.
// (예: app.use('/api/auth', authRouter);)
// 여기서는 기존 코드를 유지합니다.
app.use('/auth', authRouter);
app.use('/spotify', spotifyRouter); // spotify 라우트 사용
app.use('/gemini', geminiRouter); // gemini 라우트 사용

// 404 & 에러 핸들러 (항상 마지막)
app.use(notFound);
app.use(errorHandler);

export default app;