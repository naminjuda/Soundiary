// DOM이 모두 로드된 후에 스크립트 실행
document.addEventListener("DOMContentLoaded", () => {
    
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
            
            // 회원가입 성공 시 로그인 페이지(루트)로 이동
            // "login.html" -> "/" 로 수정
            window.location.href = "/"; 
        });
    }

    // --- 로그인 페이지 로직 (login.html 또는 index.html) ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // 기본 제출 동작 막기

            // [시뮬레이션]
            // 실제로는 여기서 서버에 이메일/비밀번호를 보내
            // 로그인 유효성 검사를 해야 합니다.
            // (예: fetch('/api/login', { method: 'POST', ... }))

            alert("로그인 성공! 일기장으로 이동합니다.");

            // 로그인 성공 시 메인 다이어리 페이지로 이동
            // "diary.html" -> "/diary.html" 로 수정
            window.location.href = "/diary.html";
        });
    }

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
            // 서버에서는 이 텍스트를 분석하여 감정을 파악하고,
            // 그에 맞는 음악 플레이리스트를 반환해줘야 합니다.
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
           window.location.href = "/";
        });
    }
});