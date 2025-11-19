// server/src/routes/caravans.routes.js

const express = require('express');
const router = express.Router();

// 컨트롤러 및 미들웨어를 가져옵니다.
const CaravanController = require('../controllers/caravan.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/upload');

/**
 * @route   GET /
 * @desc    모든 카라반 목록을 조회합니다.
 * @access  Public (인증 없이 누구나 접근 가능)
 */
router.get('/', CaravanController.getAllCaravans);

/**
 * @route   POST /
 * @desc    새로운 카라반을 등록합니다.
 * @access  Private (로그인한 사용자만 접근 가능)
 */
router.post(
  '/',
  authMiddleware, // 1. JWT 토큰을 검증하여 사용자를 인증합니다.
  upload.array('photos', 5), // 2. 'photos' 필드의 이미지 파일들을 최대 5개까지 처리합니다.
  CaravanController.createCaravan // 3. 컨트롤러 함수를 실행합니다.
);

/**
 * @route   GET /:id
 * @desc    ID로 특정 카라반의 상세 정보를 조회합니다.
 * @access  Public
 */
router.get('/:id', CaravanController.getCaravanById);


// 설정된 라우터 객체를 export합니다.
module.exports = router;
