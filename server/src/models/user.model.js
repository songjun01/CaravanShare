// server/src/models/user.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 사용자 정보를 위한 스키마 정의
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, '유효한 이메일 형식이 아닙니다.'],
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        // 'local' provider로 가입한 사용자만 비밀번호를 요구하도록 설정할 수 있으나,
        // 스키마 레벨에서는 optional로 두고, 라우터/컨트롤러 레벨에서 로직으로 처리하는 것이 더 유연합니다.
    },
    // 각 소셜 로그인 제공자별 고유 ID를 저장할 필드
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    naverId: {
        type: String,
        unique: true,
        sparse: true,
    },
    kakaoId: {
        type: String,
        unique: true,
        sparse: true,
    },
    provider: {
        type: String,
        required: true,
        enum: ['local', 'google', 'naver', 'kakao'],
    },
    introduction: {
        type: String,
        trim: true,
        default: '',
    },
    profileImage: {
        type: String,
        default: 'https://via.placeholder.com/150', // 기본 프로필 이미지
    },
    isHost: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

/**
 * @brief pre-save 훅: 비밀번호 암호화
 * @description
 *   - User 모델이 데이터베이스에 저장되기('save') 전에 실행되는 미들웨어입니다.
 *   - 사용자의 비밀번호가 변경되었거나 새로 생성되었을 때만 bcrypt를 사용하여 비밀번호를 해시합니다.
 */
userSchema.pre('save', async function (next) {
    // 'this'는 현재 저장하려는 user 문서를 가리킵니다.
    // 비밀번호 필드가 변경되지 않았으면(isModified), 다음 미들웨어로 넘어갑니다.
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // 'salt'를 생성합니다. 숫자가 높을수록 보안이 강력해지지만, 해싱 시간이 길어집니다. 10이 적당합니다.
        const salt = await bcrypt.genSalt(10);
        // 생성된 salt를 사용하여 비밀번호를 해시합니다.
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * @brief 인스턴스 메서드: 비밀번호 비교
 * @description
 *   - 로그인 시 입력된 비밀번호와 데이터베이스에 저장된 해시된 비밀번호를 비교합니다.
 * @param {string} candidatePassword - 사용자가 입력한 비밀번호
 * @returns {Promise<boolean>} - 비밀번호 일치 여부를 boolean 값으로 반환하는 Promise
 */
userSchema.methods.comparePassword = function (candidatePassword) {
    // 'this.password'는 데이터베이스에 저장된 해시된 비밀번호입니다.
    return bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;
