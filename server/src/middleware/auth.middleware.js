// server/src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * @brief JWT 인증 미들웨어
 * @description
 *   Express의 미들웨어로, API 요청이 컨트롤러에 도달하기 전에 실행됩니다.
 *   요청 헤더(Authorization)에 포함된 JWT(JSON Web Token)를 검증하여 사용자를 인증합니다.
 * 
 * @param {Object} req - Express의 요청(request) 객체
 * @param {Object} res - Express의 응답(response) 객체
 * @param {Function} next - 다음 미들웨어 또는 컨트롤러를 실행하는 함수
 */
const authMiddleware = async (req, res, next) => {
  let token;

  // 1. 요청 헤더에서 'Authorization' 필드를 확인하고, 'Bearer' 토큰이 있는지 검사합니다.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 'Bearer ' 부분을 제거하고 순수 토큰 값만 추출합니다.
      token = req.headers.authorization.split(' ')[1];

      // 2. jwt.verify()를 사용하여 토큰을 검증합니다.
      //    - 첫 번째 인자: 검증할 토큰
      //    - 두 번째 인자: 토큰을 서명할 때 사용했던 비밀 키 (환경 변수에서 가져와야 함)
      //    - 검증에 성공하면, 토큰에 담겨있던 payload(데이터)를 반환합니다.
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

      // 3. 토큰에서 얻은 사용자 ID를 사용하여 데이터베이스에서 실제 사용자 정보를 조회합니다.
      //    - '-password'는 반환할 필드에서 password를 제외하라는 의미입니다.
      req.user = await User.findById(decoded.id).select('-password');

      // 4. 사용자 정보가 성공적으로 req 객체에 추가되었으므로, 다음 미들웨어로 제어를 넘깁니다.
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // 토큰이 없는 경우
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = authMiddleware;
