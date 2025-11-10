// repositories/user.repo.js (ESM)
const mem = new Map(); // key: kakao_id string

export async function findByKakaoId(kakao_id) {
  return mem.get(String(kakao_id)) || null;
}

export async function create(user) {
  mem.set(String(user.kakao_id), user);
  return user;
}

export async function update(kakao_id, patch) {
  const cur = mem.get(String(kakao_id));
  if (!cur) return null;
  const updated = { ...cur, ...patch };
  mem.set(String(kakao_id), updated);
  return updated;
}
// DB로 교체 예정