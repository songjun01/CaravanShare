// server/src/repositories/reservation.repository.js

const Reservation = require('../models/reservation.model');
const Caravan = require('../models/caravan.model'); // Caravan 모델 임포트

/**
 * @brief ReservationRepository 클래스
 * @description 예약 데이터에 대한 데이터베이스 접근을 추상화합니다.
 */
class ReservationRepository {
  /**
   * @brief 새로운 예약을 생성하여 데이터베이스에 저장합니다.
   * @param {Object} reservationData - 생성할 예약 데이터 객체
   * @returns {Promise<Object>} 생성된 예약 문서
   */
  async create(reservationData) {
    const reservation = new Reservation(reservationData);
    return await reservation.save();
  }

  /**
   * @brief ID를 통해 특정 예약을 조회합니다.
   * @param {String} id - 예약 ID
   * @returns {Promise<Object>} 조회된 예약 문서
   */
  async findById(id) {
    return await Reservation.findById(id).populate('guest', 'displayName email').populate('caravan', 'name location');
  }

  /**
   * @brief 특정 카라반에 대한 모든 예약을 조회합니다.
   * @param {String} caravanId - 카라반 ID
   * @returns {Promise<Array<Object>>} 해당 카라반의 모든 예약 문서 배열
   */
  async findByCaravanId(caravanId) {
    return await Reservation.find({ caravan: caravanId });
  }

  /**
   * @brief 특정 게스트의 모든 예약을 조회합니다.
   * @param {String} guestId - 게스트 ID
   * @returns {Promise<Array<Object>>} 해당 게스트의 모든 예약 문서 배열
   */
  async findByGuestId(guestId) {
    return await Reservation.find({ guest: guestId }).populate('caravan', 'name location photos');
  }

  /**
   * @brief 호스트 ID를 통해 해당 호스트의 모든 카라반에 대한 예약을 조회합니다.
   * @param {String} hostId - 호스트 ID
   * @returns {Promise<Array<Object>>} 해당 호스트의 모든 카라반 예약 문서 배열 (카라반 및 게스트 정보 populate)
   */
  async findReservationsByHostId(hostId) {
    // 1. 해당 호스트가 소유한 모든 카라반 ID를 조회합니다.
    const caravans = await Caravan.find({ host: hostId }).select('_id');
    const caravanIds = caravans.map(caravan => caravan._id);

    // 2. 조회된 카라반 ID들을 기반으로 예약을 찾고, 카라반 및 게스트 정보를 populate합니다.
    return await Reservation.find({ caravan: { $in: caravanIds } })
      .populate('caravan', 'name location photos')
      .populate('guest', 'displayName profileImage');
  }

  /**
   * @brief 특정 카라반의 승인된 모든 예약 날짜를 조회합니다.
   * @param {String} caravanId - 카라반 ID
   * @returns {Promise<Array<Object>>} startDate와 endDate를 포함하는 예약 객체 배열
   */
  async getApprovedReservationDatesForCaravan(caravanId) {
    return await Reservation.find({
      caravan: caravanId,
      status: 'approved',
    }).select('startDate endDate');
  }

  /**
   * @brief ID를 통해 특정 예약을 업데이트합니다.
   * @param {String} id - 예약 ID
   * @param {Object} updateData - 업데이트할 데이터 객체
   * @returns {Promise<Object>} 업데이트된 예약 문서
   */
  async updateById(id, updateData) {
    return await Reservation.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * @brief ID를 통해 특정 예약을 삭제합니다.
   * @param {String} id - 예약 ID
   * @returns {Promise<Object>} 삭제된 예약 문서
   */
  async deleteById(id) {
    return await Reservation.findByIdAndDelete(id);
  }
}

module.exports = new ReservationRepository();
