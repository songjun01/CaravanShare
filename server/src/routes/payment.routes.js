// server/src/routes/payment.routes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller'); // 클래스 인스턴스
const { authenticate } = require('../middleware/auth.middleware'); // 기존 isLoggedIn 대신 authenticate 사용


// 결제 처리 라우트
router.post('/', authenticate, paymentController.processPayment);

module.exports = router;
