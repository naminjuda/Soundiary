import { verify } from '../services/jwt.service.js';
import * as userRepo from '../repositories/user.repo.js';

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized: no token' });
    }

    let payload;
    try {
      payload = verify(token);
    } catch (err) {
      console.error('❌ JWT verify error:', err);
      return res.status(401).json({ message: 'Unauthorized: invalid token' });
    }

    if (!payload.kakao_id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // DB에서 실제 유저 찾기
    const user = await userRepo.findByKakaoId(payload.kakao_id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 컨트롤러에서 쓸 수 있도록 req.user에 붙여줌
    req.user = {
      id: user.id,                // diaries.user_id에 쓸 PK
      kakao_id: user.kakao_id,
      nickname: user.nickname,
    };

    return next();
  } catch (err) {
    console.error('authRequired middleware error:', err);
    return res.status(500).json({ message: 'Auth middleware error' });
  }
}
