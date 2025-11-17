// server/src/routes/reservations.routes.js

const express = require('express');
// Express의 Router를 생성합니다.
const router = express.Router();

// 컨트롤러와 미들웨어를 가져옵니다.
const ReservationController = require('../controllers/reservation.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @brief 예약 관련 API 라우트를 정의합니다.
 * @description
 *   - 라우터는 특정 URL 경로(endpoint)와 HTTP 메소드(GET, POST 등)의 조합을
 *     담당할 컨트롤러의 특정 함수와 연결해주는 역할을 합니다.
 *   - '/api/v1/reservations'와 같은 기본 경로(base path)는
 *     메인 서버 파일(예: server.js)에서 이 라우터 파일을 사용할 때 설정됩니다.
 */

// === 라우트 정의 ===

/**
 * @route   POST /
 * @desc    새로운 예약을 생성합니다.
 * @access  Private (인증된 사용자만 접근 가능)
 * 
 * @description
 * 1. 클라이언트가 이 엔드포인트로 POST 요청을 보냅니다.
 * 2. `authMiddleware`가 먼저 실행되어 요청 헤더의 JWT를 검증합니다.
 *    - 검증에 실패하면, 미들웨어는 401 Unauthorized 응답을 보내고 여기서 요청 처리가 끝납니다.
 *    - 검증에 성공하면, 사용자 정보를 req.user에 담고 `next()`를 호출하여 제어를 다음 함수로 넘깁니다.
 * 3. `ReservationController.createReservation` 함수가 실행되어 실제 예약 생성 로직을 처리합니다.
 */
router.post('/', authMiddleware, ReservationController.createReservation);


// TODO: 다른 예약 관련 라우트들을 추가할 수 있습니다.
// 예: GET /:id (특정 예약 조회), GET / (나의 예약 목록 조회) 등

// 설정된 라우터 객체를 export합니다.
module.exports = router;
