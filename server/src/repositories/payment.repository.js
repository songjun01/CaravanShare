// server/src/repositories/payment.repository.js

const Payment = require('../models/payment.model');

class PaymentRepository {
  async create(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async findById(paymentId) {
    return await Payment.findById(paymentId).populate('reservation');
  }

  async findByReservationId(reservationId) {
    return await Payment.findOne({ reservation: reservationId });
  }

  async updateStatus(paymentId, status) {
    return await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );
  }
}

module.exports = new PaymentRepository();
