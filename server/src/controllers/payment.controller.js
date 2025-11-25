// server/src/controllers/payment.controller.js

const PaymentService = require('../services/payment.service');
const PaymentRepository = require('../repositories/payment.repository');
const ReservationRepository = require('../repositories/reservation.repository');

const paymentService = new PaymentService(PaymentRepository, ReservationRepository);

class PaymentController {
  constructor() {
    // 클래스 메서드를 bind 처리하여 this 문제 방지
    this.processPayment = this.processPayment.bind(this);
  }

  /**
   * @brief Process a payment for a reservation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async processPayment(req, res, next) {
    try {
      const { reservationId } = req.body;
      const userId = req.user._id;

      if (!reservationId) {
        return res.status(400).json({ message: 'Reservation ID is required.' });
      }

      const updatedReservation = await paymentService.processPayment(reservationId, userId);

      res.status(200).json({
        message: 'Payment processed successfully',
        data: updatedReservation,
      });
    } catch (error) {
      console.error('Error in processPayment controller:', error);
      next(error);
    }
  }
}

// 클래스 인스턴스를 export
module.exports = new PaymentController();
