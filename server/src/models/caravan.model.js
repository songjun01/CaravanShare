// server/src/models/caravan.model.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @brief Caravan 스키마 정의
 * @description 카라반(캠핑카)의 정보를 저장하기 위한 데이터베이스 스키마입니다.
 * 
 * @param {mongoose.Schema.Types.ObjectId} host - 카라반을 등록한 호스트의 ID (User 모델 참조)
 * @param {String} name - 카라반 이름 (필수)
 * @param {String} description - 카라반에 대한 상세 설명
 * @param {Number} capacity - 수용 인원 (필수)
 * @param {Number} dailyRate - 1일당 렌탈 요금 (필수)
 * @param {String} location - 카라반 위치 (주소 등)
 * @param {Array<String>} amenities - 편의시설 목록 (예: ['샤워', '주방', '에어컨'])
 * @param {Array<String>} photos - 카라반 사진 URL 목록
 * @param {String} status - 카라반 상태 ('available', 'reserved', 'maintenance')
 * @param {Date} createdAt - 생성 일자 (자동 생성)
 * @param {Date} updatedAt - 수정 일자 (자동 생성)
 */
const caravanSchema = new Schema({
  host: {
    type: Schema.Types.ObjectId, // MongoDB의 ObjectId 타입을 나타냅니다.
    ref: 'User',                 // 'User' 모델을 참조합니다. 즉, 이 필드에는 User 문서의 ID가 저장됩니다.
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1 // 최소 1명 이상
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0 // 요금은 0 이상
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  amenities: {
    type: [String], // 문자열 배열
    default: []
  },
  photos: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

// 'Caravan' 모델을 생성하고 export합니다.
module.exports = mongoose.model('Caravan', caravanSchema);
