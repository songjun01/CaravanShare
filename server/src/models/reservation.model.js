// server/src/models/reservation.model.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @brief Reservation 스키마 정의
 * @description 카라반 예약 정보를 저장하기 위한 데이터베이스 스키마입니다.
 * 
 * @param {mongoose.Schema.Types.ObjectId} guest - 예약을 신청한 게스트의 ID (User 모델 참조)
 * @param {mongoose.Schema.Types.ObjectId} caravan - 예약된 카라반의 ID (Caravan 모델 참조)
 * @param {Date} startDate - 예약 시작 날짜 (필수)
 * @param {Date} endDate - 예약 종료 날짜 (필수)
 * @param {Number} totalPrice - 총 결제 금액 (필수)
 * @param {String} status - 예약 상태 ('pending', 'approved', 'rejected', 'cancelled', 'completed')
 * @param {Date} createdAt - 생성 일자 (자동 생성)
 * @param {Date} updatedAt - 수정 일자 (자동 생성)
 */
const reservationSchema = new Schema({
  guest: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  caravan: {
    type: Schema.Types.ObjectId,
    ref: 'Caravan',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
}, {
  timestamps: true,
});

// 'Reservation' 모델을 생성하고 export합니다.
module.exports = mongoose.model('Reservation', reservationSchema);
