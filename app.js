// app.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import authRouter from './routes/auth.routes.js';
import spotifyRouter from './routes/spotify.routes.js'; // spotify router 추가
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();

// 전역 미들웨어
app.use(cors());           
app.use(express.json()); 
app.use(morgan('dev'));    

// 라우팅
app.use('/auth', authRouter);
app.use('/spotify', spotifyRouter); // spotify 라우트 사용

// 404 & 에러 핸들러 (항상 마지막)
app.use(notFound);
app.use(errorHandler);

export default app;
