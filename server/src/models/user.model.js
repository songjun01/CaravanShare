// server/src/models/user.model.js

// Mongoose 라이브러리를 가져옵니다. MongoDB 데이터베이스와의 상호작용을 쉽게 해주는 ODM(Object Data Modeling) 라이브러리입니다.
const mongoose = require('mongoose');
// Mongoose의 Schema 객체를 가져옵니다. 데이터의 구조(스키마)를 정의하는 데 사용됩니다.
const { Schema } = mongoose;

/**
 * @brief User 스키마 정의
 * @description 사용자의 정보를 저장하기 위한 데이터베이스 스키마입니다.
 * 
 * @param {String} name - 사용자 이름 (필수)
 * @param {String} email - 사용자 이메일 (필수, 고유값)
 * @param {String} password - 사용자 비밀번호 (필수)
 * @param {String} role - 사용자 역할 ('guest' 또는 'host', 기본값: 'guest')
 * @param {Date} createdAt - 생성 일자 (자동 생성)
 * @param {Date} updatedAt - 수정 일자 (자동 생성)
 */
const userSchema = new Schema({
  name: {
    type: String,
    required: true, // 필수 필드
    trim: true      // 문자열 앞뒤 공백 자동 제거
  },
  email: {
    type: String,
    required: true,
    unique: true,   // 데이터베이스 내에서 고유한 값을 가져야 함
    trim: true,
    lowercase: true // 항상 소문자로 저장
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['guest', 'host'], // 'guest' 또는 'host' 값만 허용
    default: 'guest'         // 기본값 설정
  }
}, {
  // timestamps 옵션은 createdAt과 updatedAt 필드를 자동으로 생성하고 관리해줍니다.
  timestamps: true 
});

// userSchema를 기반으로 'User'라는 이름의 모델을 생성하고 export합니다.
// 이 모델을 통해 실제 데이터베이스의 users 컬렉션과 상호작용할 수 있습니다.
module.exports = mongoose.model('User', userSchema);
