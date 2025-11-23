// server/src/exceptions/custom.error.js

/**
 * @brief CustomError 클래스
 * @description HTTP 상태 코드와 메시지를 포함하는 사용자 정의 에러 클래스입니다.
 *   Express의 에러 핸들링 미들웨어에서 이 에러를 catch하여 적절한 응답을 보낼 수 있습니다.
 */
class CustomError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = 'CustomError';
        this.statusCode = statusCode;
        // 에러 스택 트레이스를 캡처하여 디버깅에 유용하게 사용합니다.
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { CustomError };
