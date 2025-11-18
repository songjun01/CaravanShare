// server/src/config/passport.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/user.model');

module.exports = () => {
    // LocalStrategy 설정 (이메일/비밀번호 로그인)
    passport.use(new LocalStrategy({
        usernameField: 'email', // 'username' 필드 대신 'email'을 사용하도록 설정
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            // 1. 입력된 이메일로 사용자를 찾습니다.
            const user = await User.findOne({ email: email.toLowerCase() });

            // 2. 사용자가 없으면 에러 메시지와 함께 인증 실패 처리
            if (!user) {
                return done(null, false, { message: '존재하지 않는 이메일입니다.' });
            }

            // 3. 소셜 로그인으로 가입한 사용자가 비밀번호 없이 로그인을 시도하는 경우
            if (!user.password) {
                return done(null, false, { message: `${user.provider} 계정으로 가입된 이메일입니다. 소셜 로그인을 이용해주세요.` });
            }

            // 4. 사용자가 있다면, 입력된 비밀번호와 DB의 해시된 비밀번호를 비교합니다.
            const isMatch = await user.comparePassword(password);

            // 5. 비밀번호가 일치하면 사용자 정보를 반환하여 인증 성공 처리
            if (isMatch) {
                return done(null, user);
            } else {
                // 6. 비밀번호가 일치하지 않으면 에러 메시지와 함께 인증 실패 처리
                return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
        } catch (error) {
            return done(error);
        }
    }));

    // Google 전략 설정
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/auth/google/callback', // 구글 인증 후 리다이렉트될 URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ googleId: profile.id });
            if (existingUser) {
                return done(null, existingUser);
            }

            const email = profile.emails && profile.emails[0].value;
            if (!email) {
                return done(new Error('Email not provided by Google.'), null);
            }
            const usernameFromEmail = email.split('@')[0];

            const newUser = await new User({
                email: email,
                displayName: profile.displayName || usernameFromEmail,
                googleId: profile.id,
                provider: 'google',
            }).save();
            done(null, newUser);
        } catch (error) {
            done(error);
        }
    }));

    // Naver 전략 설정
    passport.use(new NaverStrategy({
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: '/api/v1/auth/naver/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ naverId: profile.id });
            if (existingUser) {
                return done(null, existingUser);
            }

            const email = profile.emails && profile.emails[0].value;
            if (!email) {
                return done(new Error('Email not provided by Naver.'), null);
            }
            const usernameFromEmail = email.split('@')[0];

            const newUser = await new User({
                email: email,
                displayName: profile.displayName || profile.nickname || usernameFromEmail,
                naverId: profile.id,
                provider: 'naver',
            }).save();
            done(null, newUser);
        } catch (error) {
            done(error);
        }
    }));

    // Kakao 전략 설정
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        callbackURL: '/api/v1/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ kakaoId: profile.id });
            if (existingUser) {
                return done(null, existingUser);
            }

            const email = profile._json && profile._json.kakao_account && profile._json.kakao_account.email;
            if (!email) {
                return done(new Error('Email not provided by Kakao.'), null);
            }
            const usernameFromEmail = email.split('@')[0];

            const newUser = await new User({
                email: email,
                displayName: profile.displayName || profile.username || (profile._json && profile._json.properties.nickname) || usernameFromEmail,
                kakaoId: profile.id,
                provider: 'kakao',
            }).save();
            done(null, newUser);
        } catch (error) {
            done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};
