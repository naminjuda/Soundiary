// repositories/user.repo.js (ESM)
// const mem = new Map(); // key: kakao_id string

// export async function findByKakaoId(kakao_id) {
//   return mem.get(String(kakao_id)) || null;
// }

// export async function create(user) {
//   mem.set(String(user.kakao_id), user);
//   return user;
// }

// export async function update(kakao_id, patch) {
//   const cur = mem.get(String(kakao_id));
//   if (!cur) return null;
//   const updated = { ...cur, ...patch };
//   mem.set(String(kakao_id), updated);
//   return updated;
// }
// DB로 교체 예정

import pool from '../database/db.js';

// ID로 사용자 찾기
export async function findByKakaoId(kakao_id) {
  try {
    const query = 'SELECT * FROM users WHERE kakao_id = ?';
    const [rows] = await pool.query(query, [kakao_id]);

    return rows[0] || null;
  } catch (error) {
    throw new Error(`DB Error (findByKakaoId): ${error.message}`);
  }
}

// 사용자 생성(회원가입)
export async function create(user) {
  try {
    // kakao_id, nickname, profile_image 필요
    const { kakao_id, nickname, profile_image } = user;
    // 닉네임이 없을 경우 기본값 생성(User_카카오id)
    const safeNickname = nickname || `User_${kakao_id}`;
    
    const query = `
      INSERT INTO users (kakao_id, nickname, profile_image)
      VALUES (?, ?, ?)
    `;
  
    const [result] = await pool.query(query, [kakao_id, safeNickname, profile_image || null]);

    return {
      id: result.insertId,
      kakao_id,
      nickname: safeNickname,
      profile_image: profile_image || null,
      item_count: 0
    };
  } catch (error) {
    throw new Error(`DB Error (create): ${error.message}`);
  }
}

// 사용자 정보 업데이트
export async function update(kakao_id, patch) {
  try {
    const updates = [];
    const values = [];
    // 닉네임과 프로필 이미지만 업데이트 구현 (개발 편의성을 위함인데 없어도 되지 않을까 싶기도 합니다.)
    if (patch.nickname) {
      updates.push('nickname = ?');
      values.push(patch.nickname);
    }
    if (patch.profile_image) {
      updates.push('profile_image = ?');
      values.push(patch.profile_image);
    }

    if (updates.length === 0) return null;

    const query = `UPDATE users SET ${updates.join(', ')} WHERE kakao_id = ?`;
    values.push(kakao_id);
    
    await pool.query(query, values);

    return await findByKakaoId(kakao_id);
  } catch (error) {
    throw new Error(`DB Error (update): ${error.message}`);
  }
}