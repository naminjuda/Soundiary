import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: './.env', override: true }); // .env 파일 로드
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

if (!client_id || !client_secret) {
  throw new Error('Spotify client ID or client secret is not defined in environment variables.');
}

// Spotify 토큰을 가져오는 함수
async function requestSpotifyToken() {
  try {
    const encodedCredentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    );

    const token = response.data.access_token;
    cachedToken = token;
    tokenExpiry = Date.now() + response.data.expires_in*1000; // 만료 시간 설정
    return token;
  } catch (error) {
    console.error('Failed to retrieve Spotify access token:', error.response?.data || error.message);
    throw error;
  }
}

// 캐시된 토큰을 반환하거나 만료되었을 경우 새 토큰을 요청하는 함수
export async function getSpotifyToken() {
  if (!cachedToken || Date.now() >= tokenExpiry) {
    return await requestSpotifyToken(); 
  }
  return cachedToken;
}
