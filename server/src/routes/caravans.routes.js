// server/src/routes/caravans.routes.js

const express = require('express');
const router = express.Router();

// 컨트롤러 및 미들웨어를 가져옵니다.
const CaravanController = require('../controllers/caravan.controller');

// [수정됨] auth.middleware.js에서 { authenticate } 객체 형태로 내보냈으므로,
// 받는 쪽에서도 구조 분해 할당 { } 을 사용하여 'authenticate' 함수만 쏙 빼와야 합니다.
const { authenticate } = require('../middleware/auth.middleware');

const upload = require('../config/upload');

/**
 * @route   GET /
 * @desc    모든 카라반 목록을 조회합니다.
 * @access  Public (인증 없이 누구나 접근 가능)
 */
router.get('/', CaravanController.getAllCaravans);

/**
 * @route   GET /host/me
 * @desc    현재 로그인한 호스트의 모든 카라반을 조회합니다.
 * @access  Private (로그인한 사용자만 접근 가능)
 */
// [수정됨] authMiddleware -> authenticate 로 변수명 변경
router.get('/host/me', authenticate, CaravanController.getMyCaravans);

/**
 * @route   POST /
 * @desc    새로운 카라반을 등록합니다.
 * @access  Private (로그인한 사용자만 접근 가능)
 */
router.post(
  '/',
  authenticate, // [수정됨] authMiddleware -> authenticate
  upload.array('newPhotos', 5), 
  CaravanController.createCaravan 
);

/**
 * @route   PUT /:id
 * @desc    특정 카라반의 정보를 수정합니다.
 * @access  Private (해당 카라반의 호스트만 접근 가능)
 */
// [수정됨] authMiddleware -> authenticate
router.put('/:id', authenticate, upload.array('newPhotos', 5), CaravanController.updateCaravan);

/**
 * @route   DELETE /:id
 * @desc    특정 카라반을 삭제합니다.
 * @access  Private (해당 카라반의 호스트만 접근 가능)
 */
// [수정됨] authMiddleware -> authenticate
router.delete('/:id', authenticate, CaravanController.deleteCaravan);

/**
 * @route   GET /:id
 * @desc    ID로 특정 카라반의 상세 정보를 조회합니다.
 * @access  Public
 */
router.get('/:id', CaravanController.getCaravanById);

module.exports = router;