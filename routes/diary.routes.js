import express from 'express';
import * as diaryController from '../controllers/diary.controller.js';
// import { verifyToken } from '?'; // TODO: 인증 미들웨어를 못찾겠어요

const router = express.Router();

router.post('/', /*verifyToken,*/ diaryController.createDiary); // 일기 작성
router.get('/', /*verifyToken,*/ diaryController.getMyDiaries); // 일기 목록 조회
router.get('/:id', /*verifyToken,*/ diaryController.getMyDiary); // 일기 상세 조회
router.delete('/:id', /*verifyToken,*/ diaryController.deleteMyDiary); // 일기 삭제

export default router;
