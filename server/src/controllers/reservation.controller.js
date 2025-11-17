// server/src/controllers/reservation.controller.js

// 비즈니스 로직을 처리하는 ReservationService를 가져옵니다.
const ReservationService = require('../services/reservation.service');

/**
 * @brief ReservationController 클래스
 * @description
 *   '컨트롤러 계층'은 HTTP 요청을 받아들이고, 그 요청을 적절한 서비스 계층의 메서드에 전달하는 '교통정리' 역할을 합니다.
 *   컨트롤러는 비즈니스 로직을 직접 수행하지 않습니다. 로직 처리는 서비스 계층에 위임합니다.
 *   또한, 서비스 계층의 처리 결과를 받아 HTTP 응답(성공, 에러 등)을 클라이언트에게 보내주는 역할을 담당합니다.
 */
class ReservationController {
  /**
   * @brief 새 예약을 생성하는 요청을 처리합니다. (POST /api/v1/reservations)
   * @param {Object} req - Express의 요청(request) 객체
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async createReservation(req, res, next) {
    try {
      // 1. HTTP 요청 본문(body)에서 예약에 필요한 데이터를 추출합니다.
      //    인증 미들웨어를 통과했다면, req.user 객체에 인증된 사용자 정보가 담겨 있습니다.
      const reservationData = {
        caravanId: req.body.caravanId,
        userId: req.user._id, // 인증된 사용자의 ID
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      };

      // 2. 데이터 처리를 서비스 계층(ReservationService)에 위임합니다.
      //    컨트롤러는 '어떻게' 예약을 생성하는지에 대한 비즈니스 로직을 알 필요가 없습니다.
      const newReservation = await ReservationService.createReservation(reservationData);

      // 3. 서비스 계층의 처리 결과를 클라이언트에게 HTTP 응답으로 보냅니다.
      //    - 201 Created: 리소스가 성공적으로 생성되었음을 의미하는 상태 코드
      res.status(201).json({
        message: 'Reservation created successfully',
        data: newReservation
      });
    } catch (error) {
      // 4. 서비스 계층에서 발생한 에러를 중앙 에러 처리 미들웨어로 전달합니다.
      console.error('Error in createReservation controller:', error);
      next(error); // next(error)는 Express의 에러 핸들러를 호출합니다.
    }
  }
}

// ReservationController의 인스턴스를 생성하여 export합니다.
module.exports = new ReservationController();
