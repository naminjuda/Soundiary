import { pool } from '../database/db.js';

export const createRecommendedTrack = async (trackDataList) => {
    const sql = `
        INSERT INTO recommended_tracks
        (diary_id, spotify_id, track_title, track_artist, track_url, album_cover)
        VALUES ?
    `;

    try {
        const [result] = await pool.query(sql, [trackDataList]);
        return result;
    } catch (error) {
        console.error("DB Error (createRecommendedTrack): ", error);
        throw error;
    }
};

// 일기 ID로 추천 트랙리스트 조회
export const findTracksByDiaryId = async (diaryId) => {
    const sql = `
        SELECT track_title, track_artist, album_cover
        FROM recommended_tracks
        WHERE diary_id = ? 
    `;

    const [rows] = await pool.query(sql, [diaryId]);
    return rows;
};
