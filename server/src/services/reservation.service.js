// server/src/services/reservation.service.js

const ReservationRepository = require('../repositories/reservation.repository');
const CaravanRepository = require('../repositories/caravan.repository');
const { CustomError } = require('../exceptions/custom.error'); // CustomError 임포트

class ReservationService {
  constructor(reservationRepository, caravanRepository) {
    this.reservationRepository = reservationRepository;
    this.caravanRepository = caravanRepository;
  }

  /**
   * @brief 예약 생성
   */
  async createReservation(guestId, caravanId, startDate, endDate, totalPrice) {
    // 이 메서드는 ReservationController의 createReservation에서 사용됩니다.
    // 현재는 이 서비스에서 중복 검사를 직접 수행하지 않고,
    // ReservationValidator를 통해 컨트롤러에서 검증합니다.
    // 하지만 향후 비즈니스 로직이 복잡해지면 이곳에서 처리할 수 있습니다.
    const newReservationData = {
      guest: guestId,
      caravan: caravanId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice,
      status: 'pending', // 초기 상태는 'pending'
    };
    return await this.reservationRepository.create(newReservationData);
  }

  /**
   * @brief 호스트가 예약 요청을 승인합니다.
   * @param {string} reservationId - 예약 ID
   * @param {string} hostId - 현재 로그인한 호스트의 ID
   * @returns {Object} 업데이트된 예약 객체
   */
  async approveReservation(reservationId, hostId) {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new CustomError(404, '예약을 찾을 수 없습니다.');
    }

    // 카라반의 호스트 ID와 현재 로그인한 호스트 ID가 일치하는지 확인
    const caravan = await this.caravanRepository.findById(reservation.caravan);
    
    if (!caravan || caravan.host._id.toString() !== hostId.toString()) {
      throw new CustomError(403, '이 예약에 대한 권한이 없습니다.');
    }

    if (reservation.status !== 'pending') {
      throw new CustomError(400, '대기 중인 예약만 승인할 수 있습니다.');
    }

    // 예약 상태를 'approved'로 업데이트
    reservation.status = 'approved';
    await reservation.save(); // Mongoose Document의 save() 메서드 사용

    // TODO: 게스트에게 예약 승인 알림 발송 (이메일, 메시지 등)
    // TODO: 해당 기간 동안의 카라반 가용성 업데이트 또는 중복 예약 방지 로직 강화

    return reservation;
  }

  /**
   * @brief 호스트가 예약 요청을 거절합니다.
   * @param {string} reservationId - 예약 ID
   * @param {string} hostId - 현재 로그인한 호스트의 ID
   * @returns {Object} 업데이트된 예약 객체
   */
  async rejectReservation(reservationId, hostId) {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new CustomError(404, '예약을 찾을 수 없습니다.');
    }

    // 카라반의 호스트 ID와 현재 로그인한 호스트 ID가 일치하는지 확인
    const caravan = await this.caravanRepository.findById(reservation.caravan);
    if (!caravan || caravan.host._id.toString() !== hostId.toString()) {
      throw new CustomError(403, '이 예약에 대한 권한이 없습니다.');
    }

    if (reservation.status !== 'pending') {
      throw new CustomError(400, '대기 중인 예약만 거절할 수 있습니다.');
    }

    // 예약 상태를 'rejected'로 업데이트
    reservation.status = 'rejected';
    await reservation.save(); // Mongoose Document의 save() 메서드 사용

    // TODO: 게스트에게 예약 거절 알림 발송 (이메일, 메시지 등)
    // TODO: 해당 기간 동안의 카라반 가용성 업데이트 또는 예약 슬롯 해제

    return reservation;
  }
}

module.exports = ReservationService;