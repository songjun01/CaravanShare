// server/src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * @brief JWT 인증 미들웨어
 */
// [수정 1] 함수 이름을 라우터에서 쓰는 'authenticate'로 변경
const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

      req.user = await User.findById(decoded.id).select('-password');

      // [중요] next() 호출 후에는 함수를 종료(return)해야 안전합니다.
      // 그렇지 않으면 아래 'if (!token)' 코드가 실행될 수 있습니다.
      next();
      return; 

    } catch (error) {
      console.error('Token verification failed:', error);
      // [중요] 응답을 보낸 후에는 return으로 종료해야 합니다.
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @brief 호스트 권한 확인 미들웨어
 */
const isHost = (req, res, next) => {
  if (req.user && req.user.isHost) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a host' });
  }
};

// [수정 2] 구조 분해 할당({ authenticate })으로 받을 수 있도록 객체로 내보내기
module.exports = { authenticate, isHost };