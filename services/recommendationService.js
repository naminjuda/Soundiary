import axios from 'axios';
import { getSpotifyToken } from './spotifyAuth.js'; // Spotify 인증 토큰 가져오기
import { getEmotionKeywords } from './geminiService.js'; // Gemini 감정 키워드 추출 함수

const mapKeywordsToQuery = (keywords) => {
    const query = keywords.join(' ') + ' mood';
    return query;
};

// 플레이리스트검색 함수
const searchPlaylists = async (query, token) => {
    const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            q: query,
            type: 'playlist',
            limit: 5
        }
    });
    return response.data.playlists.items;
};

// 트랙 가져오기 함수
const getTracksFromPlaylist = async (playlist_id, token) => {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            limit: 10,
            fields: 'items(track(id, name, artists(name), album(name, images)))' // 필요한 필드만 선택
        }
    });
    return response.data.items.map(item => item.track).filter(track => track != null);
};

export const recommendTrackFromDiary = async (diaryText) => {
    try {
        // 1. 감정 키워드 추출
        console.log("키워드 추출"); // 디버그 로그
        const keywords = await getEmotionKeywords(diaryText);
        console.log("키워드: ", keywords); // 디버그 로그

        // 2. 키워드를 검색 쿼리로 변환
        const searchQuery = mapKeywordsToQuery(keywords);
        console.log("검색 쿼리: ", searchQuery); // 디버그 로그

        // 3. Spotify 토큰 가져오기
        const token = await getSpotifyToken();

        // 4. 플레이리스트 검색
        console.log("플레이리스트 검색"); // 디버그 로그
        const playlists = await searchPlaylists(searchQuery, token);

        if (!playlists || playlists.length === 0) {
            throw new Error('No playlists found for the given query.');
        }

        // 5. 각 플레이리스트에서 트랙 가져오기
        console.log("플레이리스트 트랙 패치");
        const trackPromises = playlists.map(p_list => getTracksFromPlaylist(p_list.id, token));
        const tracksArrays = await Promise.all(trackPromises);

        // 6. 트랙 리스트 평탄화, 중복 제거
        const allTracks = tracksArrays.flat();
        const uniqueTracks = Array.from(new Map(allTracks.map(track => [track.id, track])).values());

        // 7. 무작위 트랙 선택
        const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
        const finalRecommendations = shuffled.slice(0, 10); // 최대 10곡 추천

        console.log("\n========================================");
        console.log(`[${keywords.join(', ')}] 추천 트랙 리스트`);
        console.log("========================================");
        finalRecommendations.forEach((track, index) => {
            const artistNames = track.artists.map(a => a.name).join(', ');
            console.log(`${index + 1}. ${track.name} - ${artistNames}`);
        });
        console.log("========================================\n");

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
