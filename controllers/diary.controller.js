import * as diaryService from '../services/diaryService.js';

// 일기 작성, 결과 반환
export const createDiary = async (req, res) => {
    try {
        // const userId = req.user.id;
        // TODO: userId를 req에서 받아와주세요
        const { content } = req.body;

        if (!content) return res.status(400).json({ message: 'No content' });

        const result = await diaryService.createDiarywithTracks(userId, content);

        res.status(201).json({
            message: 'Diary created successfully',
            data: result
        });
    } catch (error) {
        console.error("❌ Error in createDiary controller:", error);
        res.status(500).json({
            message: 'Error creating diary',
        });
    }
};

// 일기 목록 조회
export const getMyDiaries = async (req, res) => {
    try {
        // const userId = req.user.id;
        // TODO: userId를 req에서 받아와주세요
        const diaries = await diaryService.getMyDiaries(userId);
        res.status(200).json(diaries);
    } catch (error) {
        console.error("❌ Error in get diary list:", error);
        res.status(500).json({
            message: 'Error retrieving diaries'
        });
    }
};

// 일기 상세 조회 (본문 + 트랙 리스트)
export const getMyDiary = async (req, res) => {
    try {
        // const userId = req.user.id;
        // TODO: userId를 req에서 받아와주세요
        const { id } = req.params;

        const diary = await diaryService.getMyDiary(id, userId); // diary_id, user_id
        res.status(200).json(diary);
    } catch (error) {
        if (error.message === 'DIARY_NOT_FOUND') {
            return res.status(404).json({ message: 'Diary not found' });
        }
        if (error.message === 'UNAUTHORIZED_ACCESS') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        console.error("❌ Error in get diary:", error);
        res.status(500).json({
            message: 'Error retrieving diary'
        });
    }
};

// 일기 삭제
export const deleteMyDiary = async (req, res) => {
    try {
        // const userId = req.user.id;
        // TODO: userId를 req에서 받아와주세요
        const { id } = req.params;

        await diaryService.removeDiary(id, userId);
        res.status(200).json({ message: 'Diary deleted successfully' });
    } catch (error) {
        console.error("❌ Error in delete diary:", error);
        res.status(500).json({
            message: 'Error deleting diary'
        });
    }
};
