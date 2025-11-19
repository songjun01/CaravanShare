// server/src/routes/review.routes.js

const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @brief 리뷰 관련 API 라우트를 정의합니다.
 * @description 모든 라우트는 /api/v1/reviews 경로 아래에 위치하며,
 *              authMiddleware를 통해 로그인한 사용자만 접근할 수 있습니다.
 */

// [POST] /api/v1/reviews
// 새로운 리뷰를 생성합니다.
router.post('/', authMiddleware, ReviewController.createReview);

// TODO: 다른 리뷰 관련 라우트들을 추가할 수 있습니다.
// 예: GET /caravan/:caravanId (특정 카라반의 리뷰 조회) 등

module.exports = router;
