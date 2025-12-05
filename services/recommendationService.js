import axios from 'axios';
import { getSpotifyToken } from './spotifyAuth.js'; // Spotify 인증 토큰 가져오기
import { getEmotionKeywords } from './geminiService.js'; // Gemini 감정 키워드 추출 함수

const mapKeywordsToQuery = (keywords) => {
    const query = keywords.join(' ') + ' mood';
    return query;
};

// 플레이리스트검색 함수
const searchPlaylists = async (query, token) => {
    try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            q: query,
            type: 'playlist',
            limit: 5
            }
        });
        return response.data.playlists.items;
    } catch (error) {
        console.error('Error searching playlists:', error);
        return [];
    }
};

// 트랙 가져오기 함수
const getTracksFromPlaylist = async (playlist_id, token) => {
    try {
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                limit: 10,
                fields: 'items(track(id, name, artists(name), external_urls, album(images)))' // 필요한 필드만 선택
            }
        });
        const items = response.data.items || [];
        return items
            .filter(item => item?.track?.id)
            .map(item => ({
                id: item.track.id,
                name: item.track.name,
                artists: item.track.artists?.map(artist => artist.name) || ['Unknown Artist'],
                album_cover: item.track.album?.images?.[0]?.url || '',
                external_urls: item.track.external_urls
            }));
    } catch (error) {
        console.error('Error getting tracks from playlist:', error);
        return [];
    }
};

export const recommendTrackFromDiary = async (diaryText) => {
    try {
        // 1. 감정 키워드 추출
        const keywords = await getEmotionKeywords(diaryText);

        // 2. 키워드를 검색 쿼리로 변환
        const searchQuery = mapKeywordsToQuery(keywords);

        // 3. Spotify 토큰 가져오기
        const token = await getSpotifyToken();

        // 4. 플레이리스트 검색
        const playlists = await searchPlaylists(searchQuery, token);

        if (!playlists || playlists.length === 0) {
            throw new Error('No playlists found for the given query.');
        }

        // 5. 각 플레이리스트에서 트랙 가져오기
        const trackPromises = playlists
            .filter(p_list => p_list != null && p_list !== undefined)
            .map(p_list => getTracksFromPlaylist(p_list.id, token));
        const tracksArrays = await Promise.all(trackPromises);

        // 6. 트랙 리스트 평탄화, 중복 제거
        const rawTracks = tracksArrays.flat();
        const validTracks = rawTracks.filter(track =>
            track != null && 
            track != undefined && 
            track.id
        );

        if (validTracks.length === 0) {
            throw new Error('No valid tracks found in the retrieved playlists.');
        }

        const uniqueTracksMap = new Map();
        validTracks.forEach(track => {
            uniqueTracksMap.set(track.id, track);
        });
        const uniqueTracks = Array.from(uniqueTracksMap.values());

        // 7. 무작위 트랙 선택
        const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
        const finalRecommendations = shuffled.slice(0, 10); // 최대 10곡 추천

        finalRecommendations.forEach((track, index) => {
            const artistNames = track.artists.join(', ');
        });

        return {
            Keywords: keywords,
            searchQuery: searchQuery,
            tracks: finalRecommendations
        };
    } catch (error) {
        console.error('Error in recommendTrackFromDiary:', error);
        throw error;
    }
};
