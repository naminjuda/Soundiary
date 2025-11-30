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
});