document.addEventListener("DOMContentLoaded", () => {
    
    const KAKAO_REST_API_KEY = '98f74e2cb38069c300b9cc21691b3bd5'; 
    const KAKAO_REDIRECT_URI = '/callback.html'; 
    const BACKEND_API_URL = 'http://localhost:3000'; 

    const kakaoLoginButton = document.getElementById("kakao-login-btn");
    if (kakaoLoginButton) {
        kakaoLoginButton.addEventListener("click", () => {
            const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${window.location.origin}${KAKAO_REDIRECT_URI}`;
            window.location.href = KAKAO_AUTH_URL;
        });
    }

    if (window.location.pathname === KAKAO_REDIRECT_URI) {
        document.body.innerHTML = `<div class="form-container"><h1>로그인 처리 중...</h1><p>잠시만 기다려주세요.</p></div>`;
        const params = new URL(window.location.href).searchParams;
        const code = params.get('code');
        if (!code) {
            alert('잘못된 접근입니다.');
            window.location.href = "/index.html";
        } else {
            sendCodeToBackend(code);
        }
    }

    async function sendCodeToBackend(code) {
        try {
            const response = await fetch(`${BACKEND_API_URL}/auth/kakao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code }),
            });
            if (!response.ok) throw new Error('서버 응답 실패');
            const data = await response.json(); 
            const { jwt, isNewUser, user } = data; 
            localStorage.setItem('authToken', jwt);
            localStorage.setItem('user_info', JSON.stringify(user));
            if (isNewUser) {
                alert('가입을 환영합니다! 닉네임을 설정해주세요.');
                window.location.href = "/profile-setup.html"; 
            } else {
                alert(`${user.nickname}님, 환영합니다!`);
                window.location.href = "/diary.html";
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            alert('로그인에 실패했습니다.');
            window.location.href = "/index.html";
        }
    }

    const saveProfileBtn = document.getElementById("save-profile-btn");
    if (saveProfileBtn) {
        const userJson = localStorage.getItem('user_info');
        if (userJson) {
            const user = JSON.parse(userJson);
            if (user.profile_image) document.getElementById('profileImage').src = user.profile_image;
            if (user.nickname) document.getElementById('nicknameInput').value = user.nickname;
        } else {
            alert("로그인 정보가 없습니다.");
            window.location.href = "index.html";
        }
        saveProfileBtn.addEventListener("click", async () => {
            const newNickname = document.getElementById("nicknameInput").value;
            if (!newNickname.trim()) return alert("닉네임을 입력해주세요!");
            try {
                const user = JSON.parse(localStorage.getItem('user_info'));
                const response = await fetch(`${BACKEND_API_URL}/auth/update-profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kakao_id: user.kakao_id, nickname: newNickname })
                });
                if (response.ok) {
                    const updatedUser = await response.json();
                    localStorage.setItem('user_info', JSON.stringify(updatedUser)); 
                    alert("설정이 완료되었습니다!");
                    window.location.href = "diary.html"; 
                } else {
                    alert("저장 실패");
                }
            } catch (e) {
                console.error(e);
                alert("서버 에러");
            }
        });
    }

    const diaryForm = document.getElementById("diary-form");
    if (diaryForm) { 
        const userJson = localStorage.getItem('user_info');
        if (userJson) {
            const user = JSON.parse(userJson);
            const nicknameDisplay = document.getElementById('nickname-display');
            if (nicknameDisplay) nicknameDisplay.textContent = user.nickname;
        } else {
            alert("로그인이 필요합니다.");
            window.location.href = "index.html";
        }
        const logoutBtn = document.getElementById("logout-btn");
        if(logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.clear();
                window.location.href = "index.html";
            });
        }
        diaryForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const content = document.getElementById("diary-content").value;
            if (content.trim() === "") return alert("내용을 입력해주세요.");

            const resultArea = document.getElementById("result-area");
            resultArea.innerHTML = `<div style="text-align:center; padding:30px; color:#666;"><p>🤖 AI가 일기를 읽고 있어요...</p><p>🎵 어울리는 음악을 고르는 중입니다...</p></div>`;

            const authToken = localStorage.getItem('authToken');

            try {
                const response = await fetch(`${BACKEND_API_URL}/diary`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ content: content })
                });

                if (!response.ok) throw new Error('서버 응답 실패');

                const { savedDiary, track } = await response.json();

                resultArea.innerHTML = `
                    <div style="margin-top:20px; padding:20px; background:#f0f3ff; border-radius:10px; border:1px solid #dce6ff;">
                        <h3 style="color:#4a69bd;">✨ 분석 완료!</h3>
                        <p><strong>오늘의 감정:</strong> ${savedDiary.emotion_keyword}</p>
                        <hr style="border:0; border-top:1px solid #ddd; margin:15px 0;">
                        <h4>🎧 추천 음악</h4>
                        <div class="music-box" style="display: flex; align-items: center; gap: 15px;">
                            <img src="${track.album_cover || 'https://placehold.co/80x80?text=No+Cover'}" alt="${track.name}" width="80" height="80" style="border-radius: 8px;">
                            <div class="music-info">
                                <p style="font-size:1.1rem; margin:0;">🎵 <strong>${track.name}</strong></p>
                                <p style="font-size:0.9rem; margin:5px 0 0;">- ${track.artists.join(', ')}</p>
                            </div>
                        </div>
                        <p style="font-size:0.8rem; color:#888; margin-top:10px;">* 내 일기장에 저장되었습니다.</p>
                    </div>`;
                document.getElementById("diary-content").value = "";
                alert("일기가 저장되었습니다!");
            } catch (error) {
                console.error('Error during diary submission:', error);
                resultArea.innerHTML = `<div style="text-align:center; padding:30px; color:red;"><p>오류가 발생했습니다: ${error.message}</p></div>`;
                alert("일기 저장에 실패했습니다.");
            }
        });
    }

    if (window.location.pathname.includes('mypage.html')) {
        const userJson = localStorage.getItem('user_info');
        
        if (userJson) {
            const user = JSON.parse(userJson);
            if(user.profile_image) document.getElementById('my-profile-img').src = user.profile_image;
            if(user.nickname) document.getElementById('my-nickname').textContent = user.nickname;
        }

        const listWrapper = document.getElementById('diary-list-wrapper');
        const authToken = localStorage.getItem('authToken');

        const modal = document.getElementById('diary-modal');
        const closeModalBtn = document.getElementById('close-modal');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        async function fetchDiaries() {
            try {
                const response = await fetch(`${BACKEND_API_URL}/diary`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` } 
                });

                if (!response.ok) throw new Error('서버 응답 실패');
                const diaries = await response.json();

                if (diaries.length === 0) {
                    listWrapper.innerHTML = `
                        <div style="text-align:center; padding:40px; color:#aaa;">
                            <p>아직 작성된 일기가 없어요 텅!</p>
                            <a href="diary.html" style="color:#6c5ce7; text-decoration:none;">일기 쓰러 가기</a>
                        </div>`;
                } else {
                    diaries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    listWrapper.innerHTML = diaries.map(diary => `
                        <div class="diary-card" data-id="${diary.id}" style="cursor: pointer;">
                            <div class="card-header">
                                <span class="card-date">${new Date(diary.created_at).toLocaleDateString()}</span>
                                <span class="card-emotion">${Array.isArray(diary.emotion_keyword) ? diary.emotion_keyword.join(', ') : diary.emotion_keyword }</span>
                            </div>
                            <div class="card-content" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${diary.content}
                            </div>
                    
                            ${diary.track_title ? `
                            <div class="music-box">
                                <div class="music-icon">🎧</div>
                                <div class="music-info">
                                    <span class="music-title">${diary.track_title}</span>
                                    <span class="music-artist">${diary.track_artist.map(a => a.name).join(', ')}</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    `).join('');

                    document.querySelectorAll('.diary-card').forEach(card => {
                        card.addEventListener('click', async () => {
                            const diaryId = card.getAttribute('data-id');
                            await openDiaryDetail(diaryId);
                        });
                    });
                } 
            } catch (error) {
                console.error('Error fetching diaries:', error);
                listWrapper.innerHTML = `<div style="text-align:center; padding:40px; color:red;"><p>일기를 불러오는데 실패했습니다: ${error.message}</p></div>`;
            }
        }
        async function openDiaryDetail(id) {
            try {
                const response = await fetch(`${BACKEND_API_URL}/diary/${id}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if(!response.ok) throw new Error('상세 정보를 불러올 수 없습니다.');
                
                const diary = await response.json();
                
                document.getElementById('modal-date').textContent = new Date(diary.created_at).toLocaleDateString() + "의 기록";
                const emotionText = Array.isArray(diary.emotion_keyword) ? diary.emotion_keyword.join(', ') : diary.emotion_keyword;
                document.getElementById('modal-emotion').textContent = emotionText;
                document.getElementById('modal-text').textContent = diary.content;

                const musicBox = document.getElementById('modal-music-box');
                const albumCoverImg = document.getElementById('modal-album-cover');
                
                let firstTrack = null;
                if (Array.isArray(diary.tracks) && diary.tracks.length > 0) {
                    firstTrack = diary.tracks[0];
                }

                if (firstTrack) {
                    musicBox.style.display = 'flex';
                    
                    const coverSrc = firstTrack.album_cover ? firstTrack.album_cover : 'https://placehold.co/80x80?text=No+Cover';
                    
                    albumCoverImg.src = coverSrc;
                    
                    albumCoverImg.onerror = function() {
                        this.src = 'https://placehold.co/80x80?text=No+Image';
                    };

                    document.getElementById('modal-track-title').textContent = firstTrack.track_title || "제목 없음";
                    
                    let artistName = firstTrack.track_artist;
                    if (Array.isArray(artistName)) {
                        artistName = artistName.map(a => a.name || a).join(', ');
                    }
                    document.getElementById('modal-track-artist').textContent = artistName || "알 수 없는 가수";

                } else if (diary.track_title) {
                    musicBox.style.display = 'flex';
                    albumCoverImg.src = 'https://placehold.co/80x80?text=Old+Data';
                    document.getElementById('modal-track-title').textContent = diary.track_title;
                    document.getElementById('modal-track-artist').textContent = diary.track_artist || "알 수 없는 가수";
                } else {
                    musicBox.style.display = 'none';
                }

                modal.style.display = 'flex';

            } catch (error) {
                console.error(error);
                alert("일기 상세 정보를 가져오는 데 실패했습니다.");
            }
        }

        fetchDiaries();
    }
});