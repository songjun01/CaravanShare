// server/src/config/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. 파일이 저장될 디렉토리 설정
const uploadDir = path.join(__dirname, '../../uploads');

// 2. 서버 시작 시 'uploads' 디렉토리가 없으면 생성
// 동기적으로 디렉토리를 확인하고 생성하여, 서버가 파일 시스템을 준비한 후 요청을 받도록 합니다.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. Multer 저장소(Storage) 설정
const storage = multer.diskStorage({
  // destination: 파일이 저장될 경로를 지정합니다.
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // filename: 저장될 파일의 이름을 지정합니다.
  filename: (req, file, cb) => {
    // 파일 이름 중복을 피하기 위해 '현재시간(timestamp)-원본파일이름' 형식으로 저장합니다.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // 원본 파일의 확장자를 가져옵니다.
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

// 4. 파일 필터(File Filter) 설정
const fileFilter = (req, file, cb) => {
  // 허용할 이미지 파일의 MIME 타입 목록입니다.
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    // 허용된 MIME 타입이면, true를 콜백하여 업로드를 계속 진행합니다.
    cb(null, true);
  } else {
    // 허용되지 않은 파일 타입이면, 에러를 콜백하여 업로드를 중단합니다.
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP are allowed.'), false);
  }
};

// 5. Multer 인스턴스 생성 및 설정 적용
const upload = multer({
  storage: storage,   // 위에서 정의한 저장소 설정을 적용합니다.
  fileFilter: fileFilter, // 위에서 정의한 파일 필터 설정을 적용합니다.
  limits: {
    fileSize: 1024 * 1024 * 5, // 파일 크기 제한: 5MB
  },
});

module.exports = upload;
