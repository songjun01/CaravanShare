// server/src/services/payment.service.js

const PaymentRepository = require('../repositories/payment.repository');
const ReservationRepository = require('../repositories/reservation.repository');
const { CustomError } = require('../exceptions/custom.error');

class PaymentService {
  constructor(paymentRepository, reservationRepository) {
    this.paymentRepository = paymentRepository;
    this.reservationRepository = reservationRepository;
  }

  /**
   * @brief Process a payment for a reservation
   * @param {string} reservationId - The ID of the reservation
   * @param {string} userId - The ID of the user making the payment
   * @returns {Object} The created payment object
   */
  async processPayment(reservationId, userId) {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new CustomError(404, 'Reservation not found.');
    }

    if (reservation.guest._id.toString() !== userId.toString()) {
      throw new CustomError(403, 'You are not authorized to pay for this reservation.');
    }
    
    if (reservation.paymentStatus !== 'unpaid') {
      throw new CustomError(400, 'This reservation has already been paid for.');
    }
    
    if (reservation.status !== 'approved') {
        throw new CustomError(400, 'This reservation must be approved by the host before payment.');
    }

    // Check if payment already exists
    let payment = await this.paymentRepository.findByReservationId(reservationId);
    if (payment && payment.status === 'completed') {
      throw new CustomError(400, 'Payment has already been completed for this reservation.');
    }
    
    // Create a new payment if it doesn't exist
    if (!payment) {
        payment = await this.paymentRepository.create({
            reservation: reservationId,
            amount: reservation.totalPrice,
            status: 'pending',
        });
    }


    // Mock payment processing
    const isPaymentSuccessful = true; 

    if (isPaymentSuccessful) {
      // Update payment status
      payment.status = 'completed';
      payment.transactionId = `mock_txn_${Date.now()}`;
      await payment.save();

      // Update reservation payment status
      reservation.paymentStatus = 'paid';
      reservation.status = 'completed'; // Change status to 'completed' upon successful payment
      await reservation.save();

      return reservation;
    } else {
      payment.status = 'failed';
      await payment.save();
      throw new CustomError(400, 'Payment failed.');
    }
  }
}

module.exports = PaymentService;
