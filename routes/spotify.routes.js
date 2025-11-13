import express from 'express';
import axios from 'axios';
import { getSpotifyToken } from '../services/spotifyAuth.js';

const router = express.Router();

// Spotify에서 트랙 정보를 가져오는 라우트
router.get('/track/:id', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        const trackId = req.params.id;
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching track from Spotify:', error);
        res.status(500).json({ error: 'Failed to fetch track from Spotify' });
    }
});

export default router;
