
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// server.js가 있는 폴더의 .env를 확실히 로드
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

import http from 'http';
import app from './app.js';

const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});
