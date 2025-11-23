import { recommendTrackFromDiary } from './recommendationService.js';
import { createRecommendedTrack } from '../repositories/track.repo.js';

export const createDiarywithTracks = async (userId, content) => {
    const diaryId = 10;
    const recommendationResult = await recommendTrackFromDiary(content);

    const dbData = recommendationResult.tracks.map(track => [
        diaryId,
        track.id,
        track.name,
        track.artists.map(artist => artist.name).join(', '),
        track.external_urls?.spotify || null,
        track.album.images[0]?.url || null
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

    return recommendationResult;
};
