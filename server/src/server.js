// server/src/server.js

// 1. 기본 모듈 및 환경 변수 설정
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// .env 파일의 환경 변수를 로드합니다.
dotenv.config();

// 2. Express 애플리케이션 생성 및 미들웨어 설정
const app = express();

// CORS(Cross-Origin Resource Sharing)를 활성화합니다.
// 클라이언트(React)와 서버(Express)가 다른 포트에서 실행되므로, 브라우저에서 API 요청을 허용하기 위해 필요합니다.
app.use(cors());

// 들어오는 요청의 본문(body)을 JSON 형식으로 파싱합니다.
app.use(express.json());

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
