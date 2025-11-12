// import express from 'express';
// import 'dotenv/config';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { getEmotionKeywords } from './services/geminiService.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// app.use(express.json());

// app.listen(8080, function() { // 8080 port for test
//     console.log('listening on 8080');
// });

// app.get('/', function(req, res) { // index page load
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.post('/analyze-emotion', async (req, res) => {
//     try {
//         const { diaryText } = req.body;
//         // The validation is now inside the service, but we can keep a basic check here.
//         if (!diaryText) {
//             return res.status(400).send('diaryText is required');
//         }

//         const keywords = await getEmotionKeywords(diaryText);
//         res.send(keywords);
//     } catch (error) {
//         // Log the error and send a generic error message
//         console.error('Error in /analyze-emotion route:', error.message);
//         res.status(500).send('Error analyzing emotion.');
//     }
// });


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
