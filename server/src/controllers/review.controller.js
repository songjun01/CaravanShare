// server/src/controllers/review.controller.js

const Review = require('../models/Review');
const Caravan = require('../models/caravan.model'); // Caravan 모델 임포트

/**
 * @brief ReviewController 클래스
 * @description 리뷰 생성 등과 관련된 요청을 처리하는 컨트롤러
 */
class ReviewController {
  /**
   * @brief 새로운 리뷰를 생성합니다. (POST /api/v1/reviews)
   * @param {Object} req - Express의 요청(request) 객체 (req.user, req.body 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async createReview(req, res, next) {
    try {
      const { caravanId, rating, content } = req.body;
      const reviewer = req.user.id; // 리뷰 작성자는 현재 로그인한 사용자

      // 1. 리뷰 대상 카라반을 조회하여 reviewee(카라반 호스트)를 결정합니다.
      const caravan = await Caravan.findById(caravanId);
      if (!caravan) {
        return res.status(404).json({ message: '리뷰할 카라반을 찾을 수 없습니다.' });
      }
      const reviewee = caravan.host; // 카라반의 호스트가 리뷰를 받는 대상

      // 2. 새로운 리뷰 객체를 생성합니다.
      const newReview = new Review({
        reviewer,
        reviewee,
        caravan: caravanId,
        rating,
        content,
      });

      // 3. 리뷰를 데이터베이스에 저장합니다. (이 과정에서 post('save') 훅이 실행될 수 있습니다.)
      await newReview.save();

      // 4. 성공적으로 생성된 리뷰를 반환합니다.
      res.status(201).json({
        message: 'Review created successfully',
        data: newReview,
      });
    } catch (error) {
      console.error('Error in createReview controller:', error);
      next(error);
    }
  }
}

module.exports = new ReviewController();
