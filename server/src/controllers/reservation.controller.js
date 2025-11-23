// server/src/controllers/reservation.controller.js

const ReservationRepository = require('../repositories/reservation.repository');
const CaravanRepository = require('../repositories/caravan.repository');
const ReservationService = require('../services/reservation.service'); // ReservationService 임포트
const { ReservationValidator } = require('../services/reservation.validator');
const mongoose = require('mongoose');

// ReservationService 인스턴스 생성
const reservationService = new ReservationService(ReservationRepository, CaravanRepository);

/**
 * @brief ReservationController 클래스
 * @description 예약 생성, 승인, 거절 등과 관련된 요청을 처리하는 컨트롤러
 */
class ReservationController {
  /**
   * @brief 새로운 예약을 생성합니다. (POST /api/v1/reservations)
   */
  async createReservation(req, res, next) {
    try {
      const { caravanId, startDate, endDate } = req.body;
      
      // req.user가 없는 경우를 대비한 방어 코드
      if (!req.user) {
        return res.status(401).json({ message: '인증 정보가 없습니다.' });
      }
      
      const guestId = req.user._id; 

      // 1. 입력 유효성 검사
      if (!caravanId || !startDate || !endDate) {
        return res.status(400).json({ message: '필수 예약 정보가 누락되었습니다.' });
      }
      if (!mongoose.Types.ObjectId.isValid(caravanId)) {
        return res.status(400).json({ message: '유효하지 않은 카라반 ID 형식입니다.' });
      }

      // 2. 카라반 존재 여부 확인
      const caravan = await CaravanRepository.findById(caravanId);
      if (!caravan) {
        return res.status(404).json({ message: '예약하려는 카라반을 찾을 수 없습니다.' });
      }

      // 3. 날짜 유효성 및 중복 예약 검사
      const validator = new ReservationValidator(ReservationRepository);
      const isAvailable = await validator.validateReservationAvailability(
        caravanId,
        new Date(startDate),
        new Date(endDate)
      );

      if (!isAvailable) {
        return res.status(409).json({ message: '선택하신 날짜에 카라반을 예약할 수 없습니다. 이미 예약이 존재합니다.' });
      }
      
      // 4. 서비스 계층을 통해 예약 생성
      const createdReservation = await reservationService.createReservation(
        guestId,
        caravanId,
        startDate,
        endDate
      );

      // 5. 성공 응답
      res.status(201).json({
        message: 'Reservation created successfully, please proceed to payment.',
        data: createdReservation,
      });

    } catch (error) {
      console.error('Error in createReservation controller:', error);
      next(error);
    }
  }

  /**
   * @brief 호스트가 예약 요청을 승인합니다. (PATCH /api/v1/reservations/:id/approve)
   * @param {Object} req - Express의 요청(request) 객체 (req.user, req.params.id 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async approveReservation(req, res, next) {
    try {
      const { id: reservationId } = req.params;
      const hostId = req.user._id; // 인증 미들웨어에서 추가된 호스트 ID

      const updatedReservation = await reservationService.approveReservation(reservationId, hostId);

      res.status(200).json({
        message: 'Reservation approved successfully',
        data: updatedReservation,
      });
    } catch (error) {
      console.error('Error in approveReservation controller:', error);
      next(error);
    }
  }

  /**
   * @brief 호스트가 예약 요청을 거절합니다. (PATCH /api/v1/reservations/:id/reject)
   * @param {Object} req - Express의 요청(request) 객체 (req.user, req.params.id 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async rejectReservation(req, res, next) {
    try {
      const { id: reservationId } = req.params;
      const hostId = req.user._id; // 인증 미들웨어에서 추가된 호스트 ID

      const updatedReservation = await reservationService.rejectReservation(reservationId, hostId);

      res.status(200).json({
        message: 'Reservation rejected successfully',
        data: updatedReservation,
      });
    } catch (error) {
      console.error('Error in rejectReservation controller:', error);
      next(error);
    }
  }

  /**
   * @brief 호스트가 자신의 카라반에 대한 모든 예약 목록을 조회합니다. (GET /api/v1/reservations/host)
   * @param {Object} req - Express의 요청(request) 객체 (req.user 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async getReservationsForHost(req, res, next) {
    try {
      const hostId = req.user._id; // 인증 미들웨어에서 추가된 호스트 ID

      const reservations = await ReservationRepository.findReservationsByHostId(hostId);

      res.status(200).json({
        message: 'Reservations for host fetched successfully',
        data: reservations,
      });
    } catch (error) {
      console.error('Error in getReservationsForHost controller:', error);
      next(error);
    }
  }

  /**
   * @brief 특정 카라반의 예약된 날짜 목록을 조회합니다. (GET /api/v1/reservations/caravan/:id/booked-dates)
   * @param {Object} req - Express의 요청(request) 객체 (req.params.id 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async getCaravanBookedDates(req, res, next) {
    try {
      const { id: caravanId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(caravanId)) {
        return res.status(400).json({ message: '유효하지 않은 카라반 ID 형식입니다.' });
      }

      const bookedDates = await ReservationRepository.getApprovedReservationDatesForCaravan(caravanId);

      res.status(200).json({
        message: 'Booked dates fetched successfully',
        data: bookedDates,
      });
    } catch (error) {
      console.error('Error in getCaravanBookedDates controller:', error);
      next(error);
    }
  }
/**
   * @brief 게스트가 자신의 예약 목록을 조회합니다. (GET /api/v1/reservations/my-reservations)
   */
  async getReservationsForGuest(req, res, next) {
    try {
      const guestId = req.user._id;
      const reservations = await ReservationRepository.findByGuestId(guestId);
      res.status(200).json({
        message: 'Successfully fetched reservations for guest',
        data: reservations,
      });
    } catch (error) {
      console.error('Error in getReservationsForGuest controller:', error);
      next(error);
    }
  }
}

module.exports = new ReservationController();