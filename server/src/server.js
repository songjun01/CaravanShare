// server/src/server.js

// 1. 기본 모듈 및 환경 변수 설정
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session'); // express-session 추가
const passport = require('passport');       // passport 추가
const passportConfig = require('./config/passport'); // Passport 설정 로드
const authRoutes = require('./routes/auth.routes'); // 인증 라우트 로드

// .env 파일의 환경 변수를 로드합니다.
dotenv.config();

// 2. Express 애플리케이션 생성 및 미들웨어 설정
const app = express();

// CORS(Cross-Origin Resource Sharing)를 활성화합니다.
// 클라이언트(React)와 서버(Express)가 다른 포트에서 실행되므로, 브라우저에서 API 요청을 허용하기 위해 필요합니다.
app.use(cors());

// 들어오는 요청의 본문(body)을 JSON 형식으로 파싱합니다.
app.use(express.json());

// Express 세션 설정 (Passport가 내부적으로 사용)
app.use(session({
    secret: process.env.SESSION_SECRET, // 세션 암호화를 위한 키
    resave: false, // 요청이 들어올 때마다 세션을 다시 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션을 저장소에 저장할지 여부
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1일 (세션 쿠키 유효 기간)
        secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 쿠키 전송 (배포 환경에서 true)
        httpOnly: true, // 클라이언트 스크립트에서 쿠키 접근 불가
    }
}));

// Passport 미들웨어 초기화
app.use(passport.initialize());
app.use(passport.session()); // Passport 세션 사용 (serializeUser, deserializeUser 필요)
passportConfig(); // Passport 전략 설정 실행

// 3. 데이터베이스 연결
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file.');
  process.exit(1); // 환경 변수가 없으면 프로세스를 종료합니다.
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// 4. API 라우트 설정
const apiRoutes = require('./routes'); // routes/index.js 파일을 가져옵니다.
app.use('/api/v1', apiRoutes); // 모든 API 경로는 /api/v1 접두사를 갖게 됩니다.

// 소셜 로그인 인증 라우트 연결
app.use('/api/v1/auth', authRoutes);

// 기본 루트 경로 핸들러 (서버 동작 확인용)
app.get('/', (req, res) => {
  res.send('CaravanShare API Server is running!');
});

// 5. 중앙 에러 처리 미들웨어
// 라우터 또는 컨트롤러에서 next(error)로 전달된 에러를 여기서 처리합니다.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'An unexpected error occurred.',
    // 개발 환경에서만 스택 트레이스를 보여주는 것이 좋습니다.
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 6. 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
