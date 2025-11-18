# CaravanShare - 카라반 공유 플랫폼

카라반(캠핑카)을 소유한 사람(호스트)과 이용하고 싶은 사람(게스트)을 연결하는 공유 플랫폼입니다. 유휴 자산의 활용도를 높이고, 모두에게 합리적인 가격의 여행 경험을 제공하는 것을 목표로 합니다.

## ✨ 주요 기능 (Key Features)

- **통합 인증 시스템**:
  - **소셜 로그인**: Google, Naver, Kakao 계정을 통한 간편 로그인 기능을 제공합니다.
  - **로컬 로그인**: 이메일/비밀번호를 사용한 전통적인 회원가입 및 로그인 기능을 지원합니다.
  - **보안**: `bcryptjs`를 사용한 비밀번호 암호화 및 `JWT`를 통한 안전한 세션 관리를 구현했습니다.
- **카라반 목록 조회**:
  - 메인 페이지에서 등록된 모든 카라반의 목록을 반응형 그리드 레이아웃으로 확인할 수 있습니다.
  - 각 카라반의 이미지, 이름, 위치, 가격 등 핵심 정보를 카드 형태로 제공합니다.
- **전역 상태 관리**:
  - React Context API를 사용하여 사용자의 로그인 상태를 앱 전역에서 일관되게 관리합니다.
  - 로그인 상태에 따라 헤더 UI가 동적으로 변경되며, 로그아웃 기능을 제공합니다.

## 🛠️ 기술 스택 (Tech Stack)

### 프론트엔드 (Client)
- **Core**: React (v18), Vite
- **Routing**: React Router (v6)
- **State Management**: React Context API
- **Styling**: Tailwind CSS (v3)
- **HTTP Client**: Axios
- **Utilities**: jwt-decode

### 백엔드 (Server)
- **Core**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**:
  - Passport.js (Strategies: `local`, `google-oauth20`, `naver`, `kakao`)
  - JSON Web Token (JWT)
  - `bcryptjs` (Password Hashing)
- **Environment**: `dotenv`

## 📂 프로젝트 구조

```
app-caravan/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   │   ├── CaravanCard.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProfileDropdown.jsx
│   │   ├── context/         # React Context (전역 상태 관리)
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # 페이지 단위 컴포넌트
│   │   │   ├── AuthSuccessPage.jsx
│   │   │   ├── CaravanListPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── App.jsx          # 메인 라우터 설정
│   │   └── main.jsx         # 애플리케이션 진입점
│   ├── .env                 # 프론트엔드 환경 변수
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/          # Passport.js 전략 설정
│   │   │   └── passport.js
│   │   ├── controllers/     # 요청 처리 로직
│   │   │   └── caravan.controller.js
│   │   ├── models/          # MongoDB 스키마 모델
│   │   │   ├── caravan.model.js
│   │   │   └── user.model.js
│   │   ├── routes/          # API 라우팅
│   │   │   ├── auth.routes.js
│   │   │   ├── caravans.routes.js
│   │   │   └── index.js
│   │   ├── seed.js          # 데이터베이스 시딩 스크립트
│   │   └── server.js        # Express 서버 진입점
│   ├── .env                 # 백엔드 환경 변수
│   └── package.json
└── README.md
```

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하기 위한 단계별 안내입니다.

### 사전 요구사항
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [MongoDB](https://www.mongodb.com/try/download/community) 데이터베이스 서버

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd app-caravan
```

### 2. 백엔드 서버 설정
별도의 터미널을 열고 다음 단계를 진행하세요.

1.  **서버 디렉토리로 이동 및 의존성 설치**
    ```bash
    cd server
    npm install
    ```

2.  **환경 변수 설정 (`.env` 파일 생성)**
    `server` 디렉토리 최상단에 `.env` 파일을 생성하고, 아래 내용을 복사하여 채워넣으세요. **각 서비스의 API 키는 직접 발급받아야 합니다.**

    ```env
    # 서버 포트
    PORT=5000

    # MongoDB 연결 URI
    MONGO_URI=mongodb://localhost:27017/caravan-share

    # JWT 및 세션 비밀 키 (복잡한 임의의 문자열로 변경)
    JWT_SECRET=your_super_secret_jwt_key
    SESSION_SECRET=your_super_secret_session_key

    # 클라이언트 URL (프론트엔드 주소)
    CLIENT_URL=http://localhost:5173

    # Google OAuth 2.0 (Google Cloud Console에서 발급)
    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
    GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

    # Naver Login (네이버 개발자 센터에서 발급)
    NAVER_CLIENT_ID=YOUR_NAVER_CLIENT_ID_HERE
    NAVER_CLIENT_SECRET=YOUR_NAVER_CLIENT_SECRET_HERE

    # Kakao Login (카카오 개발자스에서 발급)
    KAKAO_CLIENT_ID=YOUR_KAKAO_CLIENT_ID_HERE
    ```

### 3. 프론트엔드 클라이언트 설정
또 다른 터미널을 열고 다음 단계를 진행하세요.

1.  **클라이언트 디렉토리로 이동 및 의존성 설치**
    ```bash
    cd client
    npm install
    ```

2.  **환경 변수 설정 (`.env` 파일 생성)**
    `client` 디렉토리 최상단에 `.env` 파일을 생성하고 아래 내용을 입력하세요.

    ```env
    # 백엔드 API 서버 주소
    VITE_API_BASE_URL=http://localhost:5000
    ```

### 4. 데이터베이스 시딩 (샘플 데이터 추가)
카라반 목록을 화면에 표시하기 위해 샘플 데이터를 추가합니다.

1.  **사용자 생성**: 먼저 웹사이트에 접속하여 **최소 한 명 이상의 사용자를 회원가입**합니다. (시딩 스크립트가 카라반의 `host`로 사용자를 지정해야 하기 때문입니다.)

2.  **시딩 스크립트 실행**: 프로젝트 루트 디렉토리(`app-caravan`)에서 다음 명령어를 실행합니다.
    ```bash
    node server/src/seed.js
    ```
    이 스크립트는 기존 카라반 데이터를 모두 삭제하고 10개의 새로운 샘플 데이터를 추가합니다.

### 5. 애플리케이션 실행

1.  **백엔드 서버 실행** (`server` 디렉토리 터미널)
    ```bash
    npm run dev
    ```
    서버가 `http://localhost:5000`에서 실행됩니다.

2.  **프론트엔드 서버 실행** (`client` 디렉토리 터미널)
    ```bash
    npm run dev
    ```
    애플리케이션이 `http://localhost:5173`에서 실행됩니다. 웹 브라우저에서 이 주소로 접속하세요.

## 📜 주요 API 엔드포인트

- **Authentication (`/api/v1/auth`)**
  - `POST /register`: 이메일/비밀번호 회원가입
  - `POST /login`: 이메일/비밀번호 로그인
  - `GET /google`: Google 소셜 로그인 시작
  - `GET /google/callback`: Google 로그인 콜백
  - `GET /naver`: Naver 소셜 로그인 시작
  - `GET /naver/callback`: Naver 로그인 콜백
  - `GET /kakao`: Kakao 소셜 로그인 시작
  - `GET /kakao/callback`: Kakao 로그인 콜백

- **Caravans (`/api/v1/caravans`)**
  - `GET /`: 모든 카라반 목록 조회
