import express from 'express';
import axios from 'axios';
import { getSpotifyToken } from '../services/spotifyAuth.js';

const router = express.Router();

// Spotify에서 앨범 정보를 가져오는 라우트
router.get('/album/:id', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        const albumId = req.params.id;
        const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching album from Spotify:', error);
        res.status(500).json({ error: 'Failed to fetch album from Spotify' });
    }
});

export default router;
