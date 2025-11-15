// DOM이 모두 로드된 후에 스크립트 실행
document.addEventListener("DOMContentLoaded", () => {
    
    // [추가] 카카오 로그인 설정 (중요!)
    // -----------------------------------------------------------------
    // .env 파일의 KAKAO_REST_API_KEY 값을 여기에 넣어야 합니다.
    const KAKAO_REST_API_KEY = '98f74e2cb38069c300b9cc21691b3bd5'; // 👈 꼭! 본인의 키로 변경하세요
    
    // .env 파일의 KAKAO_REDIRECT_URI에 설정한 경로와 일치해야 합니다.
    const KAKAO_REDIRECT_URI = '/callback.html'; // 👈 꼭! 본인의 설정과 맞추세요
    
    // 백엔드(Node.js) 서버 주소
    const BACKEND_API_URL = 'http://localhost:3000'; // 👈 본인 백엔드 서버 주소
    // -----------------------------------------------------------------


    // --- 회원가입 페이지 로직 (signup.html) ---
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            // 폼의 기본 제출 동작(새로고침)을 막음
            e.preventDefault(); 

            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // 간단한 비밀번호 확인
            if (password !== confirmPassword) {
                alert("비밀번호가 일치하지 않습니다!");
                return; // 함수 종료
            }

            // [시뮬레이션]
            // 실제로는 여기서 서버로 폼 데이터를 전송해야 합니다.
            // (예: fetch('/api/signup', { method: 'POST', ... }))
            
            alert("회원가입 성공! 로그인 페이지로 이동합니다.");
            
            // 회원가입 성공 시 로그인 페이지로 이동
            window.location.href = "index.html"; 
        });
    }

    // --- 로그인 페이지 로직 (index.html) ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        // 기존 이메일 로그인 폼 로직
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // 기본 제출 동작 막기

            // [시뮬레이션]
            // 실제로는 여기서 서버에 이메일/비밀번호를 보내
            // 로그인 유효성 검사를 해야 합니다.
            // (예: fetch('/api/login', { method: 'POST', ... }))

            alert("로그인 성공! 일기장으로 이동합니다.");

            // 로그인 성공 시 메인 다이어리 페이지로 이동
            window.location.href = "diary.html";
        });

        // [추가] 카카오 로그인 버튼 (1단계 로직)
        const kakaoLoginButton = document.getElementById("kakao-login-btn");
        if (kakaoLoginButton) {
            kakaoLoginButton.addEventListener("click", () => {
                // 백엔드(kakao.client.js)가 만드는 URL과 동일한 형식
                // window.location.origin은 'http://localhost:3000' 같은 현재 주소를 의미합니다.
                const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${window.location.origin}${KAKAO_REDIRECT_URI}`;
                
                // 1단계: 사용자를 카카오 인증 URL로 이동시킴
                window.location.href = KAKAO_AUTH_URL;
            });
        }
    }


    // [추가] 카카오 콜백 페이지 로직 (callback.html)
    // -----------------------------------------------------------------
    // 2단계: 카카오로부터 리디렉션된 페이지인지 확인
    if (window.location.pathname === KAKAO_REDIRECT_URI) {
        
        // 페이지의 내용을 "로그인 처리 중..."으로 바꿉니다.
        document.body.innerHTML = `<div class="form-container"><h1>로그인 처리 중...</h1><p>잠시만 기다려주세요.</p></div>`;

        // 1. 현재 URL에서 'code' 파라미터(인가 코드)를 추출
        const params = new URL(window.location.href).searchParams;
        const code = params.get('code');

        if (!code) {
            // 코드가 없는 비정상적인 접근
            alert('로그인에 실패했습니다. (오류: 인가 코드 없음)');
            window.location.href = "/index.html"; // 로그인 페이지로 돌려보냄
        } else {
            // 2. 백엔드로 이 'code'를 전송 (3단계 시작)
            sendCodeToBackend(code);
        }
    }

    // [추가] 2단계 로직을 수행하는 함수
    async function sendCodeToBackend(code) {
        try {
            // 3단계: 백엔드의 /auth/kakao API로 POST 요청
            // (axios 대신 fetch 사용)
            const response = await fetch(`${BACKEND_API_URL}/auth/kakao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code }), // { "code": "..." } 형태로 전송
            });

            if (!response.ok) {
                // 백엔드 서버에서 오류가 발생한 경우
                throw new Error('백엔드 서버 응답에 실패했습니다.');
            }

            // 4. 백엔드로부터 최종 응답(jwt, isNewUser) 받기
            const data = await response.json(); 
            const { jwt, isNewUser } = data;

            // 5. [로그인 성공] 발급받은 JWT를 localStorage에 저장
            localStorage.setItem('authToken', jwt);

            console.log('로그인 성공! JWT:', jwt);

            // 6. 백엔드 로직에 맞춰 페이지 이동
            if (isNewUser) {
                alert('가입이 완료되었습니다! 닉네임 설정 페이지로 이동합니다.');
                // (닉네임 설정 페이지가 있다면)
                window.location.href = "/profile-setup.html"; 
            } else {
                alert('로그인되었습니다. 다이어리 페이지로 이동합니다.');
                // (기존 로그인 성공 시 이동하는 페이지)
                window.location.href = "/diary.html";
            }

        } catch (error) {
            console.error('로그인 처리 중 오류 발생:', error);
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            window.location.href = "/index.html"; // 실패 시 로그인 페이지로
        }
    }
    // -----------------------------------------------------------------


    // --- 다이어리 페이지 로직 (diary.html) ---
    const diaryForm = document.getElementById("diary-form");
    if (diaryForm) {
        diaryForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const content = document.getElementById("diary-content").value;
            if (content.trim() === "") {
                alert("일기 내용을 입력해주세요.");
                return;
            }

            // [시뮬레이션]
            // ★★★ 여기가 핵심 파트입니다! ★★★
            // 실제로는 이 'content' 데이터를 서버로 전송해야 합니다.
            // (예: fetch('/api/diary', { method: 'POST', body: JSON.stringify({ content }) }))

            console.log("저장된 일기 내용:", content);
            alert("일기가 저장되었습니다! (콘솔 확인)\n이제 음악 추천 로직이 실행됩니다.");
            
            // 추천 결과 표시 (임시)
            const resultArea = document.getElementById("result-area");
            resultArea.innerHTML = `
                <h3>당신의 일기 분석 결과 (가상)</h3>
                <p><strong>감정:</strong> 행복함 😊</p>
                <h3>추천 플레이리스트 🎶</h3>
                <div class="playlist">
                    <p>기분 좋은 날 듣는 Pop 5곡</p>
                    <ul>
                        <li>Pharrell Williams - Happy</li>
                        <li>Maroon 5 - Sunday Morning</li>
                        <li>(이하 생략)</li>
                    </ul>
                </div>
            `;
            
            // 일기장 비우기
            document.getElementById("diary-content").value = "";
        });
    }
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById("logout-btn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
           alert("로그아웃 되었습니다.");
           window.location.href = "index.html";
        });
    }
});