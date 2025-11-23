// server/src/routes/reservations.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, isHost } = require('../middleware/auth.middleware'); // isHost 미들웨어 추가 임포트

// [핵심] 위에서 만든 컨트롤러를 구조 분해 할당({ })으로 가져옵니다.
const { createReservation, approveReservation, rejectReservation, getReservationsForHost, getCaravanBookedDates, getReservationsForGuest } = require('../controllers/reservation.controller'); // getCaravanBookedDates 추가 임포트

// 디버깅용: 서버 실행 시 이 로그가 undefined가 아니어야 합니다.
// 만약 [Function: createReservation] 이라고 뜨면 성공입니다.
console.log('Loading Reservation Controller:', createReservation); 

/**
 * @brief 예약 관련 라우트 정의
 * - POST /api/v1/reservations: 새로운 예약 생성 (인증 필요)
 * - PATCH /api/v1/reservations/:id/approve: 예약 승인 (호스트 인증 필요)
 * - PATCH /api/v1/reservations/:id/reject: 예약 거절 (호스트 인증 필요)
 * - GET /api/v1/reservations/host: 호스트의 모든 카라반 예약 목록 조회 (호스트 인증 필요)
 * - GET /api/v1/reservations/caravan/:id/booked-dates: 특정 카라반의 예약된 날짜 목록 조회
 */

// 새로운 예약 생성 라우트
router.post('/', authenticate, createReservation);

// 게스트의 모든 예약 목록 조회 라우트
router.get('/my-reservations', authenticate, getReservationsForGuest);

// 예약 승인 라우트 (호스트만 가능)
router.patch('/:id/approve', authenticate, isHost, approveReservation);

// 예약 거절 라우트 (호스트만 가능)
router.patch('/:id/reject', authenticate, isHost, rejectReservation);

// 호스트의 모든 카라반 예약 목록 조회 라우트
router.get('/host', authenticate, isHost, getReservationsForHost);

// 특정 카라반의 예약된 날짜 목록 조회 라우트 (인증 불필요)
router.get('/caravan/:id/booked-dates', getCaravanBookedDates);

module.exports = router;