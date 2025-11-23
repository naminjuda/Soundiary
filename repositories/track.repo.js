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
