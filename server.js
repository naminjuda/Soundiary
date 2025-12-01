// server.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { testConnection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await testConnection(); // ✅ 여기서 DB 연결 테스트
    http.createServer(app).listen(PORT, () => {
      console.log(`✅ Server listening at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect DB:', err);
    process.exit(1);
  }
}

start();
