// server/src/services/reservation.validator.js

const ReservationRepository = require('../repositories/reservation.repository');

/**
 * @brief ReservationValidator 클래스
 * @description 예약 생성 및 업데이트 시 비즈니스 로직 유효성을 검사합니다.
 */
class ReservationValidator {
  /**
   * @brief ReservationValidator의 생성자
   * @param {ReservationRepository} reservationRepository - ReservationRepository 인스턴스 (의존성 주입)
   */
  constructor(reservationRepository) {
    // 의존성 주입: ReservationRepository를 외부에서 받아와 사용합니다.
    // 이를 통해 테스트 시 실제 데이터베이스 대신 Mock 객체를 주입할 수 있어 테스트 용이성이 높아집니다.
    this.reservationRepository = reservationRepository;
  }

  /**
   * @brief 카라반의 예약 가능 여부를 검사합니다.
   * @description
   *   - 주어진 카라반 ID에 대해 선택된 시작 및 종료 날짜가 기존 예약과 겹치는지 확인합니다.
   *   - 날짜 유효성 검사 (시작 날짜가 종료 날짜보다 이전인지 등)를 포함합니다.
   * 
   * @param {string} caravanId - 예약하려는 카라반의 ID
   * @param {Date} newStartDate - 새로운 예약의 시작 날짜
   * @param {Date} newEndDate - 새로운 예약의 종료 날짜
   * @returns {Promise<boolean>} 예약 가능하면 true, 불가능하면 false
   */
  async validateReservationAvailability(caravanId, newStartDate, newEndDate) {
    // 1. 날짜 유효성 검사: 시작 날짜가 종료 날짜보다 이전이어야 합니다.
    if (newStartDate >= newEndDate) {
      return false; // 시작 날짜가 종료 날짜보다 같거나 늦으면 유효하지 않음
    }

    // 2. 현재 날짜보다 이전 날짜로 예약 시도 방지
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 부분을 초기화하여 날짜만 비교
    if (newStartDate < today) {
      return false; // 오늘 이전 날짜는 예약 불가능
    }

    // 3. 해당 카라반의 기존 예약들을 조회합니다.
    const existingReservations = await this.reservationRepository.findByCaravanId(caravanId);

    // 4. 새로운 예약 날짜가 기존 예약과 겹치는지 확인합니다.
    for (const existingReservation of existingReservations) {
      const existingStartDate = existingReservation.startDate;
      const existingEndDate = existingReservation.endDate;

      // (새로운 시작 날짜가 기존 예약 기간 안에 있거나)
      // (새로운 종료 날짜가 기존 예약 기간 안에 있거나)
      // (기존 예약이 새로운 예약 기간 전체를 포함하는 경우)
      const overlap = (
        (newStartDate < existingEndDate && newEndDate > existingStartDate)
      );

      if (overlap) {
        return false; // 겹치는 예약이 발견되면 예약 불가능
      }
    }

    return true; // 겹치는 예약이 없으면 예약 가능
  }

  // 여기에 추가적인 예약 관련 유효성 검사 메서드를 구현할 수 있습니다.
}

module.exports = { ReservationValidator };