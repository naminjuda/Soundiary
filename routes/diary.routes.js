import express from 'express'; 
import * as diaryController from '../controllers/diary.controller.js';
import { authRequired } from '../middlewares/auth.js'; 

const router = express.Router();

router.post('/',    authRequired, diaryController.createDiary);      // 일기 작성
router.get('/',     authRequired, diaryController.getMyDiaries);     // 일기 목록 조회
router.get('/:id',  authRequired, diaryController.getMyDiary);       // 일기 상세 조회
router.delete('/:id', authRequired, diaryController.deleteMyDiary);  // 일기 삭제

export default router;
