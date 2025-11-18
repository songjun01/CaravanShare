// server/src/routes/auth.routes.js

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // User 모델 임포트

const router = express.Router();

// JWT 생성 함수
const generateToken = (user) => {
    // JWT 페이로드에 displayName도 포함하여 프론트엔드에서 활용할 수 있도록 합니다.
    return jwt.sign({ id: user.id, email: user.email, displayName: user.displayName }, process.env.JWT_SECRET, {
        expiresIn: '1h', // 토큰 유효 시간: 1시간
    });
};

// [POST] /api/v1/auth/register (로컬 회원가입)
router.post('/register', async (req, res, next) => {
    const { displayName, email, password } = req.body;

    try {
        // 1. 이메일 중복 확인
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            // 409 Conflict: 요청이 서버의 현재 상태와 충돌될 때 사용
            return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
        }

        // 2. 새 사용자 생성
        const newUser = new User({
            displayName,
            email,
            password,
            provider: 'local', // provider를 'local'로 명시
        });

        // 3. 사용자 저장 (이 과정에서 pre-save 훅이 비밀번호를 해시합니다)
        await newUser.save();

        // 4. 회원가입 성공 후 바로 로그인 처리를 위해 JWT 발급
        const token = generateToken(newUser);
        res.status(201).json({ token }); // 201 Created: 요청이 성공적으로 처리되어 리소스가 생성됨

    } catch (error) {
        // Mongoose 유효성 검사 오류 처리
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        next(error); // 그 외의 에러는 중앙 에러 핸들러로 전달
    }
});

// [POST] /api/v1/auth/login (로컬 로그인)
router.post('/login', (req, res, next) => {
    // passport-local 전략을 사용하여 인증을 시도합니다.
    passport.authenticate('local', { session: false }, (err, user, info) => {
        // 1. 서버 에러 처리
        if (err) {
            return next(err);
        }
        // 2. 유저 정보가 없거나 (인증 실패)
        if (!user) {
            // 401 Unauthorized: 인증 실패
            return res.status(401).json({ message: info.message });
        }

        // 3. 인증 성공 시, JWT를 생성하여 클라이언트에 전달
        const token = generateToken(user);
        return res.json({ token });

    })(req, res, next);
});


// --- 소셜 로그인 라우트 ---

// Google 로그인 시작 라우트
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google 로그인 콜백 처리 라우트
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    }
);

// Naver 로그인 시작 라우트
router.get('/naver', passport.authenticate('naver', { authType: 'reprompt' }));

// Naver 로그인 콜백 처리 라우트
router.get('/naver/callback',
    passport.authenticate('naver', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    }
);

// Kakao 로그인 시작 라우트
router.get('/kakao', passport.authenticate('kakao'));

// Kakao 로그인 콜백 처리 라우트
router.get('/kakao/callback',
    passport.authenticate('kakao', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    }
);

module.exports = router;
