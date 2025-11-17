// server/src/routes/caravans.routes.js

const express = require('express');
const router = express.Router();

// 컨트롤러를 가져옵니다.
const CaravanController = require('../controllers/caravan.controller');

/**
 * @route   GET /
 * @desc    모든 카라반 목록을 조회합니다.
 * @access  Public (인증 없이 누구나 접근 가능)
 */
router.get('/', CaravanController.getAllCaravans);

// 설정된 라우터 객체를 export합니다.
module.exports = router;
