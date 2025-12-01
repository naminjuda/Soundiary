document.addEventListener("DOMContentLoaded", () => {
    
    // [설정] 본인의 키와 주소로 확인해주세요
    const KAKAO_REST_API_KEY = '98f74e2cb38069c300b9cc21691b3bd5'; 
    const KAKAO_REDIRECT_URI = '/callback.html'; 
    const BACKEND_API_URL = 'http://localhost:3000'; 

    // ============================================================
    // 1. 로그인 페이지 로직 (index.html)
    // ============================================================
    const kakaoLoginButton = document.getElementById("kakao-login-btn");
    if (kakaoLoginButton) {
        kakaoLoginButton.addEventListener("click", () => {
            const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${window.location.origin}${KAKAO_REDIRECT_URI}`;
            window.location.href = KAKAO_AUTH_URL;
        });
    }

    // ============================================================
    // 2. 카카오 콜백 처리 로직 (callback.html)
    // ============================================================
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
            const { jwt, isNewUser, user } = data; // 백엔드에서 user 정보도 같이 줘야 함

            // 토큰과 유저 정보 저장
            localStorage.setItem('authToken', jwt);
            localStorage.setItem('user_info', JSON.stringify(user));

            console.log('로그인 성공! 신규유저 여부:', isNewUser);

            // ★★★ [핵심] 신규 유저 vs 기존 유저 갈림길 ★★★
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

    // ============================================================
    // 3. 프로필 설정 페이지 로직 (profile-setup.html)
    // ============================================================
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
                    localStorage.setItem('user_info', JSON.stringify(updatedUser)); // 정보 갱신
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

    // ============================================================
    // 4. 다이어리 페이지 로직 (diary.html)
    // ============================================================
    const diaryForm = document.getElementById("diary-form");
    if (diaryForm) { // 다이어리 페이지에 있다는 뜻
        
        // (1) 유저 닉네임 표시 로직
        const userJson = localStorage.getItem('user_info');
        if (userJson) {
            const user = JSON.parse(userJson);
            // 아까 HTML에 만든 span 태그에 닉네임 넣기
            const nicknameDisplay = document.getElementById('nickname-display');
            if (nicknameDisplay) {
                nicknameDisplay.textContent = user.nickname;
            }
        } else {
            // 로그인 안 하고 주소창으로 들어온 경우 내쫓기
            alert("로그인이 필요합니다.");
            window.location.href = "index.html";
        }

        // (2) 로그아웃 버튼 로직
        const logoutBtn = document.getElementById("logout-btn");
        if(logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.clear(); // 정보 삭제
                alert("로그아웃 되었습니다.");
                window.location.href = "index.html";
            });
        }

        // (3) 일기 저장 로직
        diaryForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const content = document.getElementById("diary-content").value;
            if (content.trim() === "") return alert("내용을 입력해주세요.");

            console.log("일기 내용:", content);
            // 추후 여기에 백엔드 전송 코드(fetch) 추가
            
            // 임시 결과 보여주기
            document.getElementById("result-area").innerHTML = `
                <div style="margin-top:20px; padding:15px; background:#f9f9f9; border-radius:5px;">
                    <h3>🎵 분석 완료</h3>
                    <p>작성하신 내용이 저장되었습니다. (음악 추천 로직 대기 중)</p>
                </div>
            `;
            document.getElementById("diary-content").value = "";
        });
    }
    const BACKEND_API_URL = 'http://localhost:3000'; // 나중에 쓸 주소

    // ============================================================
    // 4. 다이어리 페이지 로직 (diary.html)
    // ============================================================
    const diaryForm = document.getElementById("diary-form");
    
    if (diaryForm) { 
        // (1) 유저 닉네임 표시 & 로그아웃 로직 (기존 유지)
        const userJson = localStorage.getItem('user_info');
        if (userJson) {
            const user = JSON.parse(userJson);
            const nicknameDisplay = document.getElementById('nickname-display');
            if (nicknameDisplay) nicknameDisplay.textContent = user.nickname;
        } else {
            alert("로그인이 필요합니다.");
            window.location.href = "index.html";
        }
        
        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });


        // (2) ★ [핵심] 일기 저장 & 가짜 분석 결과 받기 (Mocking) ★
        diaryForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const content = document.getElementById("diary-content").value;
            if (content.trim() === "") return alert("내용을 입력해주세요.");

            // 1. 로딩 표시 (분석하는 척)
            const resultArea = document.getElementById("result-area");
            resultArea.innerHTML = `
                <div style="text-align:center; padding: 20px; color:#666;">
                    <p>🤖 AI가 일기를 읽고 감정을 분석 중입니다...</p>
                    <p>🎵 어울리는 음악을 찾고 있어요...</p>
                </div>
            `;

            // 2. 가짜 지연 시간 (1.5초 뒤에 결과 나옴)
            setTimeout(() => {
                // --- [여기서부터 가짜 데이터 생성] ---
                
                // (A) 가짜 감정 분석 결과
                const mockEmotion = "위로가 필요한 우울함 💧"; 
                
                // (B) 가짜 추천 음악 리스트
                const mockTracks = [
                    { title: "Fix You", artist: "Coldplay", url: "https://open.spotify.com/track/..." },
                    { title: "Through the Night", artist: "IU (아이유)", url: "#" },
                    { title: "Breath", artist: "Park Hyo Shin", url: "#" }
                ];

                // (C) 로컬 스토리지에 저장 (DB 저장 시뮬레이션)
                const newDiary = {
                    id: Date.now(), // 고유 ID 대신 시간사용
                    created_at: new Date().toLocaleString(),
                    content: content,
                    emotion: mockEmotion,
                    tracks: mockTracks
                };

                // 기존 저장된 일기 목록 가져와서 새 일기 추가
                const myDiaries = JSON.parse(localStorage.getItem('mock_diaries') || "[]");
                myDiaries.unshift(newDiary); // 맨 앞에 추가
                localStorage.setItem('mock_diaries', JSON.stringify(myDiaries));

                // --- [여기까지 가짜 데이터 처리 끝] ---


                // 3. 화면에 결과 보여주기 (UI 업데이트)
                let trackHtml = mockTracks.map(t => 
                    `<li><strong>${t.title}</strong> - ${t.artist}</li>`
                ).join('');

                resultArea.innerHTML = `
                    <div style="margin-top:20px; padding:20px; background:#f0f3ff; border-radius:10px; border:1px solid #dce6ff;">
                        <h3 style="color:#4a69bd;">✨ 분석 완료!</h3>
                        <p><strong>오늘의 감정:</strong> ${mockEmotion}</p>
                        <hr style="border:0; border-top:1px solid #ddd; margin:15px 0;">
                        <h4>🎧 추천 플레이리스트</h4>
                        <ul style="padding-left: 20px; line-height: 1.8;">
                            ${trackHtml}
                        </ul>
                        <p style="font-size:0.8rem; color:#888; margin-top:10px;">* 내 일기장에 저장되었습니다.</p>
                    </div>
                `;

                // 입력창 비우기
                document.getElementById("diary-content").value = "";
                alert("일기 분석 및 저장이 완료되었습니다!");

            }, 1500); // 1.5초 딜레이
        });


        // (3) ★ [핵심] 내 일기장 모달 (가짜 DB에서 불러오기) ★
        const myDiaryBtn = document.getElementById("my-diary-btn");
        const modal = document.getElementById("diary-modal");
        const closeBtn = document.querySelector(".close-btn");
        const listContainer = document.getElementById("diary-list-container");

        if (myDiaryBtn && modal) {
            // 목록 열기
            myDiaryBtn.addEventListener("click", () => {
                modal.style.display = "block";
                
                // 로컬 스토리지(가짜 DB)에서 데이터 꺼내오기
                const diaries = JSON.parse(localStorage.getItem('mock_diaries') || "[]");
                
                if (diaries.length === 0) {
                    listContainer.innerHTML = "<p style='text-align:center; padding:20px;'>아직 작성된 일기가 없습니다.</p>";
                } else {
                    // 목록 그리기 (감정과 추천곡도 같이 표시)
                    listContainer.innerHTML = diaries.map(diary => `
                        <div class="diary-item">
                            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                <span class="diary-date" style="font-weight:bold; color:#6c5ce7;">${diary.created_at}</span>
                                <span style="font-size:0.9rem; background:#eee; padding:2px 8px; border-radius:10px;">${diary.emotion}</span>
                            </div>
                            <div class="diary-text" style="margin-bottom:10px;">${diary.content}</div>
                            <div style="font-size:0.85rem; color:#666; background:#fff; padding:10px; border-radius:5px;">
                                🎵 추천곡: ${diary.tracks[0].title} - ${diary.tracks[0].artist} 등 ${diary.tracks.length}곡
                            </div>
                        </div>
                    `).join('');
                }
            });

            // 모달 닫기
            closeBtn.addEventListener("click", () => modal.style.display = "none");
            window.addEventListener("click", (e) => {
                if (e.target === modal) modal.style.display = "none";
            });
        }
    }
});