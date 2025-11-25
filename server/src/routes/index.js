// server/src/routes/index.js

const express = require('express');
const router = express.Router();

// 각 기능별 라우트 파일을 임포트합니다.
const caravanRoutes = require('./caravans.routes');
const reservationRoutes = require('./reservations.routes');
const userRoutes = require('./user.routes'); // 사용자 라우트 임포트
const reviewRoutes = require('./review.routes'); // 리뷰 라우트 임포트
const paymentRoutes = require('./payment.routes'); // 결제 라우트 임포트
const ratingRoutes = require('./rating.routes'); // 평가 라우트 임포트

/**
 * @brief API 버전 1의 메인 라우터
 * @description /api/v1 경로로 들어오는 요청을 각 기능별 라우터로 분기합니다.
 */

// /api/v1/caravans 경로의 요청은 caravanRoutes에서 처리합니다.
router.use('/caravans', caravanRoutes);

// /api/v1/reservations 경로의 요청은 reservationRoutes에서 처리합니다.
router.use('/reservations', reservationRoutes);

// /api/v1/users 경로의 요청은 userRoutes에서 처리합니다.
router.use('/users', userRoutes);

// /api/v1/reviews 경로의 요청은 reviewRoutes에서 처리합니다.
router.use('/reviews', reviewRoutes);

// /api/v1/payments 경로의 요청은 paymentRoutes에서 처리합니다.
router.use('/payments', paymentRoutes);

// /api/v1/ratings 경로의 요청은 ratingRoutes에서 처리합니다.
router.use('/ratings', ratingRoutes);


module.exports = router;
