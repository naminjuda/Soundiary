import pool from '../database/db.js';

// 일기 생성
export const createDiary = async (userId, content, emotionKeyword) => {
    const sql = `
        INSERT INTO diaries (user_id, content, emotion_keyword, created_at)
        VALUES (?, ?, ?, NOW())
    `;

    try {
        const [result] = await pool.query(sql, [userId, content, emotionKeyword]);
        return result.insertId;
    } catch (error) {
        console.error("❌ DB Error (createDiary): ", error);
        throw error;
    }
};

// 사용자 ID로 일기 목록 조회
export const findDiariesByUserId = async (userId) => {
    // id, content, emotion_keyword, created_at의 정보를 가져오고
    // created_at 기준 내림차순으로 정렬
    const sql = `
        SELECT id, content, emotion_keyword, created_at
        FROM diaries
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(sql, [userId]);
    return rows;
};

// 일기 ID로 특정 일기 조회
export const findDiaryById = async (diaryId) => {
    const sql = `
        SELECT * FROM diaries WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [diaryId]);
    return rows[0]; // 없으면 undefined 반환됨
};

// 일기 ID로 일기 삭제
export const deleteDiaryById = async (diaryId, userId) => {
    const sql = `
        DELETE FROM diaries WHERE id = ? AND user_id = ?
    `;

    const [result] = await pool.query(sql, [diaryId, userId]);
    return result.affectedRows > 0; // 삭제 성공 여부 반환
};
