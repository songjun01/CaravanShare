// server/src/routes/rating.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, isHost } = require('../middleware/auth.middleware');
const RatingController = require('../controllers/rating.controller');

// [POST] /api/v1/ratings/guest - 호스트가 게스트를 평가
router.post('/guest', authenticate, isHost, RatingController.rateGuest);

// [POST] /api/v1/ratings/host - 게스트가 호스트를 평가
router.post('/host', authenticate, RatingController.rateHost);

module.exports = router;
