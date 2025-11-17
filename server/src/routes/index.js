// server/src/routes/index.js

const express = require('express');
const router = express.Router();

// 개별 라우터 파일을 가져옵니다.
const reservationRoutes = require('./reservations.routes');
const caravanRoutes = require('./caravans.routes'); 

// 특정 경로에 해당 라우터를 연결합니다.
router.use('/reservations', reservationRoutes);
router.use('/caravans', caravanRoutes);

module.exports = router;
