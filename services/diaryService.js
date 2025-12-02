import { recommendTrackFromDiary } from './recommendationService.js';
import { createRecommendedTrack } from '../repositories/track.repo.js';
import { createDiary } from '../repositories/diary.repo.js';
import * as diaryRepo from '../repositories/diary.repo.js';
import * as trackRepo from '../repositories/track.repo.js';

export const createDiarywithTracks = async (userId, content) => {
    const recommendationResult = await recommendTrackFromDiary(content);

    const emotionKeyword = recommendationResult.Keywords.join(', ');

    console.log("Saving diary to DB...");
    const diaryId = await createDiary(userId, content, emotionKeyword);
    console.log(`✅Diary saved with ID: ${diaryId}`);

    const dbData = recommendationResult.tracks.map(track => [
        diaryId,
        track.id,
        track.name,
        track.artists.join(', '),
        track.external_urls?.spotify || null,
        track.album?.images?.[0]?.url || null
    ]);

    if (dbData.length > 0) {
        try {
            await createRecommendedTrack(dbData);
            console.log(`✅Tracks saved to DB for diary ID: ${diaryId}`);
        } catch (error) {
            console.error("❌ Error saving tracks to DB:", error);
            throw error;
        }
    }

    return {
        savedDiary: {
            diary_id: diaryId,
            content,
            emotion_keyword: recommendationResult.Keywords
        },
        track: recommendationResult.tracks[0] || null
    }
};

// 일기 목록 조회
export const getMyDiaries = async (userId) => {
    return await diaryRepo.findDiariesByUserId(userId);
};

// 일기 상세 조회 (본문 + 트랙 리스트)
export const getMyDiary = async (diaryId, userId) => {
    const diary = await diaryRepo.findDiaryById(diaryId);
    
    if (!diary) throw new Error('DIARY_NOT_FOUND');
    if (diary.user_id !== userId) throw new Error('UNAUTHORIZED_ACCESS');
    
    const tracks = await trackRepo.findTracksByDiaryId(diaryId);
    return {
        ...diary, // 전개구문: 객체의 내용물을 펼침
        tracks: tracks
    };
};

// 일기 삭제
export const removeDiary = async (diaryId, userId) => {
    const isDeleted = await diaryRepo.deleteDiaryById(diaryId, userId);
    if (!isDeleted) throw new Error('DELETE_FAILED');
    return true;
};
