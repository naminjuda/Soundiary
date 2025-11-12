import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function sign(payload, opts = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d', ...opts });
}

export function verify(token) {
  return jwt.verify(token, SECRET);
}
