// server/src/models/Review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @brief Review 스키마 정의
 * @description
 *   카라반에 대한 사용자의 리뷰 정보를 저장하기 위한 Mongoose 스키마입니다.
 *   각 필드에 대한 설명은 아래와 같습니다.
 * 
 * @field {ObjectId} reviewer - 리뷰를 작성한 사용자의 ID. 'User' 모델을 참조합니다.
 * @field {ObjectId} caravan - 리뷰가 달린 카라반의 ID. 'Caravan' 모델을 참조합니다.
 * @field {Number} rating - 1점에서 5점 사이의 평점. 필수 항목입니다.
 * @field {String} content - 리뷰 내용. 필수 항목입니다.
 * @field {Date} createdAt - 리뷰 작성일. timestamps 옵션에 의해 자동으로 생성됩니다.
 * @field {Date} updatedAt - 리뷰 수정일. timestamps 옵션에 의해 자동으로 생성됩니다.
 */
const reviewSchema = new Schema({
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User', // 'User' 모델의 ObjectId를 참조합니다.
    required: true,
  },
  caravan: {
    type: Schema.Types.ObjectId,
    ref: 'Caravan', // 'Caravan' 모델의 ObjectId를 참조합니다.
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // 최소 1점
    max: 5, // 최대 5점
  },
  content: {
    type: String,
    required: true,
    trim: true, // 문자열 앞뒤의 공백을 제거합니다.
  },
}, {
  // timestamps: true 옵션은 createdAt과 updatedAt 필드를 자동으로 추가하고 관리합니다.
  timestamps: true,
});

// 'Review' 모델을 생성하고 export합니다.
// Mongoose는 모델 이름('Review')을 소문자 복수형으로 변환하여 컬렉션 이름('reviews')으로 사용합니다.
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
