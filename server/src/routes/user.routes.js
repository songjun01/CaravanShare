// server/src/routes/user.routes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const upload = require('../config/upload');

/**
 * @brief 사용자 프로필 관련 라우트를 정의합니다.
 * @description 모든 라우트는 /api/v1/users 경로 아래에 위치하며,
 *              authMiddleware를 통해 로그인한 사용자만 접근할 수 있습니다.
 */

// [GET] /api/v1/users/me
// 현재 로그인한 사용자의 프로필 정보를 조회합니다.
router.get('/me', authMiddleware, UserController.getProfile);

// [PUT] /api/v1/users/me
// 현재 로그인한 사용자의 프로필 정보(연락처, 자기소개, 프로필 사진)를 수정합니다.
// 'profileImage'라는 필드 이름으로 단일 파일 업로드를 처리합니다.
router.put('/me', authMiddleware, upload.single('profileImage'), UserController.updateProfile);

// [POST] /api/v1/users/verify
// 현재 로그인한 사용자의 신원 확인을 처리합니다. (모의 API)
router.post('/verify', authMiddleware, UserController.verifyIdentity);

module.exports = router;
