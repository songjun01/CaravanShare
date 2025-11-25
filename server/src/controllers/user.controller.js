// server/src/controllers/user.controller.js

const User = require('../models/user.model');

/**
 * @brief UserController 클래스
 * @description 사용자 프로필 조회, 수정 등과 관련된 요청을 처리하는 컨트롤러
 */
class UserController {
  /**
   * @brief 현재 로그인한 사용자의 프로필 정보를 조회합니다. (GET /api/v1/users/me)
   * @param {Object} req - Express의 요청(request) 객체 (req.user 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async getProfile(req, res, next) {
    try {
      // authMiddleware를 통해 주입된 req.user 객체에는 토큰의 payload만 들어있습니다.
      // DB에서 최신 사용자 정보를 조회하여 반환합니다.
      const user = await User.findById(req.user.id).select('-password'); // 비밀번호 제외
      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      res.status(200).json({
        message: 'Profile fetched successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error in getProfile controller:', error);
      next(error);
    }
  }

  /**
   * @brief 현재 로그인한 사용자의 프로필 정보를 수정합니다. (PUT /api/v1/users/me)
   * @description 클라이언트가 보낸 데이터 중, 서버에서 수정을 허용한 필드만 선택적으로 업데이트합니다.
   * @param {Object} req - Express의 요청(request) 객체 (req.user, req.body 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { contact, introduction, displayName } = req.body;

      // 1. DB에서 현재 사용자 정보를 조회하여 수정 전 상태를 확인합니다.
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      // 2. 보안: 클라이언트가 어떤 데이터를 보내든, 서버에서 허용한 필드만 추출하여 업데이트 객체를 생성합니다.
      const updateData = {};
      
      if (displayName) {
        updateData.displayName = displayName;
      }
      
      // 2-1. 자기소개는 언제든지 수정 가능합니다.
      if (introduction !== undefined) {
        updateData.introduction = introduction;
      }

      // 2-2. 연락처(contact)는 기존 값이 없는 경우에만 최초 1회 설정 가능합니다.
      if (contact && !currentUser.contact) {
        updateData.contact = contact;
      }
      
      // 2-3. 프로필 이미지가 업로드된 경우, 파일 경로를 저장합니다.
      if (req.file) {
        // 클라이언트에서 접근할 수 있는 경로로 변환하여 저장합니다.
        // 예: 'uploads/photos-1616161616-12345.png'
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      // 3. DB에서 사용자를 찾아 업데이트합니다. { new: true } 옵션으로 업데이트된 문서를 반환받습니다.
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

      if (!updatedUser) {
        // 이 경우는 거의 발생하지 않지만, 방어 코드로 남겨둡니다.
        return res.status(404).json({ message: '업데이트할 사용자를 찾을 수 없습니다.' });
      }

      // 4. 성공적으로 업데이트된 사용자 정보를 반환합니다.
      res.status(200).json({
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Error in updateProfile controller:', error);
      next(error);
    }
  }

  /**
   * @brief 현재 로그인한 사용자의 신원을 확인 처리합니다. (POST /api/v1/users/verify)
   * @description 실제 인증 로직 대신, 호출 시 isVerified 필드를 true로 설정하는 모의(Mock) API입니다.
   * @param {Object} req - Express의 요청(request) 객체 (req.user 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async verifyIdentity(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: '인증할 사용자를 찾을 수 없습니다.' });
      }

      // 이미 인증된 사용자는 점수를 다시 추가하지 않습니다.
      if (user.isVerified) {
        return res.status(200).json({
          message: '이미 신원이 확인된 사용자입니다.',
          data: user,
        });
      }

      // 신원 확인 처리 및 보너스 점수 적용
      user.isVerified = true;
      await user.applyVerificationBonus();
      
      // 비밀번호를 제외하고 사용자 정보를 반환합니다.
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(200).json({
        message: 'Identity verified successfully and trust score updated.',
        data: userResponse,
      });
    } catch (error) {
      console.error('Error in verifyIdentity controller:', error);
      next(error);
    }
  }
}

module.exports = new UserController();
