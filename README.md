# CaravanShare - 카라반 공유 플랫폼

카라반(캠핑카)을 소유한 사람(호스트)과 이용하고 싶은 사람(게스트)을 연결하는 공유 플랫폼입니다. 유휴 자산의 활용도를 높이고, 모두에게 합리적인 가격의 여행 경험을 제공하는 것을 목표로 합니다.

## 1. 프로젝트 개요

이 프로젝트는 순수 Python으로 설계된 도메인 모델을 기반으로, 실제 서비스 가능한 풀스택 웹 애플리케이션으로 전환한 결과물입니다. 백엔드와 프론트엔드가 분리된 모노레포 구조로 관리됩니다.

- **UI/UX 컨셉**: 깨끗하고 미니멀하며 고급스러운 디자인 (화이트 & 파스텔 톤)
- **아키텍처**: 백엔드는 계층형 아키텍처(Controller-Service-Repository)를 적용하여 유지보수성과 테스트 용이성을 확보했습니다.

## 2. 기술 스택 (Tech Stack)

### 프론트엔드 (Client)
- **Framework**: [React](https://reactjs.org/) (v18)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v3)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)

### 백엔드 (Server)
- **Framework**: [Node.js](https://nodejs.org/) / [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/) ODM)
- **Authentication**: JWT (JSON Web Token)

## 3. 프로젝트 구조

```
/
├── client/         # React 프론트엔드
│   ├── src/
│   └── package.json
├── server/         # Node.js 백엔드
│   ├── src/
│   └── package.json
└── README.md
```

## 4. 설치 및 실행 방법

### 사전 요구사항
- [Node.js](https://nodejs.org/) (v16 이상 권장)
- [MongoDB](https://www.mongodb.com/try/download/community) 데이터베이스 실행 환경

### MongoDB 실행

백엔드 서버를 실행하기 전에 MongoDB 데이터베이스 서버가 실행 중이어야 합니다. 사용하시는 운영체제와 설치 방식에 따라 다음 명령어 중 하나를 사용하여 MongoDB를 시작하세요.

-   **Windows (직접 설치한 경우):**
    ```bash
    "C:\Program Files\MongoDB\Server\[버전]\bin\mongod.exe" --dbpath="c:\data\db"
    ```
    (경로는 실제 설치 경로에 맞게 수정해야 할 수 있습니다. `c:\data\db` 폴더가 없으면 생성해야 합니다.)

-   **WSL 또는 Linux :**
    ```bash
   sudo mongod --config /etc/mongod.conf --logpath /var/log/mongodb/mongod.log --fork
    ```

-   **macOS (Homebrew 사용 시):**
    ```bash
    brew services start mongodb-community
    ```
    MongoDB가 성공적으로 시작되었는지 확인하려면, MongoDB 셸(`mongo` 또는 `mongosh`)에 접속하거나, 서버 로그를 확인하세요.

---

### 1) 백엔드 서버 실행

1.  **서버 디렉토리로 이동**
    ```bash
    cd server
    ```

2.  **필요한 라이브러리 설치**
    ```bash
    npm install
    ```

3.  **환경변수 설정**
    `server` 디렉토리 최상단에 `.env` 파일을 생성하고 아래 내용을 입력하세요. MongoDB 연결 URI와 JWT 비밀 키를 설정해야 합니다.

    ```
    # .env
    MONGO_URI=mongodb://localhost:27017/caravanshare
    JWT_SECRET=your_super_secret_jwt_key_12345
    ```

4.  **개발 서버 실행**
    `nodemon`이 설치되어 있어 코드 변경 시 자동으로 서버가 재시작됩니다.

    ```bash
    npm run dev
    ```
    서버가 `http://localhost:5000` (또는 설정된 포트)에서 실행됩니다.

---

### 2) 프론트엔드 클라이언트 실행

1.  **클라이언트 디렉토리로 이동** (별도의 터미널에서 실행)
    ```bash
    cd client
    ```

2.  **필요한 라이브러리 설치**
    ```bash
    npm install
    ```

3.  **개발 서버 실행**
    Vite 개발 서버를 시작합니다.

    ```bash
    npm run dev
    ```
    애플리케이션이 `http://localhost:5173` (또는 Vite가 지정한 포트)에서 실행됩니다. 웹 브라우저에서 이 주소로 접속하세요.
