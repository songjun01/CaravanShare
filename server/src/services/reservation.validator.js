// server/src/services/reservation.validator.js

// 가상의 ReservationRepository를 가져옵니다. 실제 구현에서는 이 파일도 만들어야 합니다.
// const ReservationRepository = require('../repositories/reservation.repository');

/**
 * @brief ReservationValidator 클래스
 * @description
 *   '검증 로직 분리' 사상을 구현하는 클래스입니다.
 *   예약 생성, 수정 등 특정 비즈니스 로직이 실행되기 전에
 *   데이터의 유효성, 비즈니스 규칙의 충족 여부 등을 검증하는 책임만 담당합니다.
 *   이를 통해 서비스 로직은 순수하게 핵심 비즈니스 흐름에만 집중할 수 있습니다.
 */
class ReservationValidator {
  /**
   * @brief 새 예약 생성을 위한 데이터 유효성을 검증합니다.
   * @param {Object} reservationData - 검증할 예약 데이터 (예: { caravanId, userId, startDate, endDate })
   * @param {Object} caravan - 예약 대상 카라반 객체
   */
  async validateCreate(reservationData, caravan) {
    const { startDate, endDate } = reservationData;

    // 1. 필수 데이터 존재 여부 확인
    if (!caravan) {
      throw new Error('존재하지 않는 카라반입니다.');
    }
    if (!startDate || !endDate) {
      throw new Error('예약 시작일과 종료일은 필수입니다.');
    }

    // 2. 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      throw new Error('예약 종료일은 시작일보다 이후여야 합니다.');
    }
    if (start < new Date()) {
      throw new Error('과거 날짜로는 예약할 수 없습니다.');
    }

    // 3. 카라반 상태 및 중복 예약 검증
    if (caravan.status !== 'available') {
      throw new Error('현재 예약할 수 없는 카라반입니다.');
    }

    // TODO: 실제 구현에서는 ReservationRepository를 사용하여 해당 기간에 중복된 예약이 있는지 확인해야 합니다.
    // const existingReservation = await ReservationRepository.findOverlap(caravan._id, start, end);
    // if (existingReservation) {
    //   throw new Error('해당 날짜에는 이미 예약이 있습니다.');
    // }

    console.log('예약 데이터 유효성 검증을 통과했습니다.');
  }
}

module.exports = new ReservationValidator();
