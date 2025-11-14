import express from 'express';
import { getEmotionKeywords } from '../services/geminiService.js';

const router = express.Router();

// 일기 텍스트에서 감정 키워드를 추출하는 라우트
router.post('/emotion-keywords', async (req, res) => {
    try {
        const { diaryText } = req.body;

        if (!diaryText || typeof diaryText !== 'string') {
            return res.status(400).json({ error: 'Invalid diaryText provided.' });
        }

        const keywords = await getEmotionKeywords(diaryText);
        res.json({ keywords });
    } catch (error) {
        console.error('Error extracting emotion keywords:', error);
        res.status(500).json({ error: 'Failed to extract emotion keywords.' });
    }
});

export default router;
