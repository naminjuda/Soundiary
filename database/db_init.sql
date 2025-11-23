-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS soundiary_db
	DEFAULT CHARACTER SET utf8mb4
	DEFAULT COLLATE utf8mb4_unicode_ci;

-- 2. 생성한 데이터베이스 사용 선언
USE soundiary_db;

-- 3. 사용자 테이블 (Users) 생성
-- 카카오 로그인을 위해 kakao_id를 고유값(UNIQUE)으로 설정
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- 내부 관리용 ID
    kakao_id BIGINT NOT NULL UNIQUE,         -- 카카오 고유 ID (숫자 형태)
    nickname VARCHAR(50) NOT NULL,           -- 사용자 닉네임
    profile_image TEXT,              -- 프로필 이미지 URL (선택 사항)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 일기 및 추천 결과 테이블 (Diaries) 생성
-- 사용자가 삭제되면 작성한 일기도 같이 삭제되도록 설정 (ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS diaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                    -- users 테이블의 id 참조
    content TEXT NOT NULL,                   -- 일기 원문
    emotion_keyword VARCHAR(50),             -- Gemini가 분석한 감정 (예: 행복, 우울)
    
    -- Spotify 추천 결과 저장 컬럼
    spotify_id VARCHAR(100),                 -- trackId
    track_title VARCHAR(255),                -- 노래 제목
    track_artist VARCHAR(255),               -- 가수 이름
    track_url TEXT,                          -- 스포티파이 재생 링크
    album_cover TEXT,                        -- 앨범 커버 이미지 URL (프론트 표시용)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 작성 시간
    
    -- 외래키 설정: user_id는 users 테이블의 id와 연결됨
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
