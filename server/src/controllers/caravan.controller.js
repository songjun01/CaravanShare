// server/src/controllers/caravan.controller.js

const CaravanRepository = require('../repositories/caravan.repository');

/**
 * @brief CaravanController 클래스
 * @description 카라반 정보 조회 등과 관련된 요청을 처리하는 컨트롤러
 */
class CaravanController {
  /**
   * @brief 모든 카라반 목록을 조회하는 요청을 처리합니다. (GET /api/v1/caravans)
   * @param {Object} req - Express의 요청(request) 객체
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async getAllCaravans(req, res, next) {
    try {
      // 1. 리포지토리를 통해 모든 카라반 데이터를 조회합니다.
      const caravans = await CaravanRepository.findAll();

      // 2. 조회된 데이터를 클라이언트에게 HTTP 응답으로 보냅니다.
      res.status(200).json({
        message: 'Caravans fetched successfully',
        data: caravans
      });
    } catch (error) {
      // 3. 리포지토리에서 발생한 에러를 중앙 에러 처리 미들웨어로 전달합니다.
      console.error('Error in getAllCaravans controller:', error);
      next(error);
    }
  }
}

module.exports = new CaravanController();
