import express from 'express';
import { recommendTrackFromDiary } from '../services/recommendationService.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { diaryText } = req.body;
        if (!diaryText) {
            return res.status(400).json({ error: 'Diary text is required.' });
        }

        const result = await recommendTrackFromDiary(diaryText);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create recommendation.' });
    }
});

export default router;
