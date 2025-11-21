// server/src/controllers/caravan.controller.js

const CaravanRepository = require('../repositories/caravan.repository');
const Review = require('../models/Review'); // Review 모델을 import합니다.
const mongoose = require('mongoose'); // mongoose를 import합니다.

/**
 * @brief CaravanController 클래스
 * @description 카라반 정보 조회 등과 관련된 요청을 처리하는 컨트롤러
 */
class CaravanController {
  /**
   * @brief 모든 카라반 목록을 조회하는 요청을 처리합니다. (GET /api/v1/caravans)
   * @param {Object} req - Express의 요청(request) 객체
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async getAllCaravans(req, res, next) {
    try {
      // 1. 리포지토리를 통해 모든 카라반 데이터를 조회합니다.
      const caravans = await CaravanRepository.findAll();

      // 2. 조회된 데이터를 클라이언트에게 HTTP 응답으로 보냅니다.
      res.status(200).json({
        message: 'Caravans fetched successfully',
        data: caravans
      });
    } catch (error) {
      // 3. 리포지토리에서 발생한 에러를 중앙 에러 처리 미들웨어로 전달합니다.
      console.error('Error in getAllCaravans controller:', error);
      next(error);
    }
  }

  /**
   * @brief ID로 특정 카라반을 조회하는 요청을 처리합니다. (GET /api/v1/caravans/:id)
   * @param {Object} req - Express의 요청(request) 객체 (req.params.id 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async getCaravanById(req, res, next) {
    try {
      const { id } = req.params;

      // 1. 요청된 ID가 유효한 MongoDB ObjectId 형식인지 확인합니다.
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid caravan ID format.' });
      }

      // 2. 리포지토리를 통해 ID에 해당하는 카라반과 populate된 호스트 정보를 조회합니다.
      const caravan = await CaravanRepository.findById(id);

      if (!caravan) {
        return res.status(404).json({ message: 'Caravan not found.' });
      }

      // 3. 해당 카라반에 달린 리뷰들을 조회하고, 작성자(reviewer) 정보를 populate합니다.
      const reviews = await Review.find({ caravan: id })
        .populate('reviewer', 'displayName profileImage')
        .sort({ createdAt: -1 }); // 최신순으로 정렬

      // 4. 조회된 카라반 정보와 리뷰 목록을 함께 응답합니다.
      res.status(200).json({
        message: 'Caravan and reviews fetched successfully',
        data: {
          caravan,
          reviews,
        },
      });
    } catch (error) {
      // 5. 처리 중 발생한 예기치 않은 에러를 중앙 에러 처리 미들웨어로 전달합니다.
      console.error('Error in getCaravanById controller:', error);
      next(error);
    }
  }

  /**
   * @brief 새로운 카라반을 등록합니다. (POST /api/v1/caravans)
   * @param {Object} req - Express의 요청(request) 객체 (req.body, req.files, req.user 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async createCaravan(req, res, next) {
    try {
      // 1. 텍스트 데이터와 파일 정보를 요청(request)에서 추출합니다.
      const { name, description, capacity, dailyRate, location, amenities, status } = req.body;
      const host = req.user.id; // authenticate 미들웨어를 통해 주입된 사용자 ID

      // 2. 업로드된 파일들의 전체 URL 경로를 생성합니다.
      const photos = req.files.map(file => {
        // req.protocol: 'http' 또는 'https'
        // req.get('host'): 'localhost:5000'와 같은 호스트 주소
        // 최종 URL 예시: 'http://localhost:5000/uploads/photos-1629876543210-123456789.jpg'
        return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      });

      // 3. 데이터베이스에 저장할 카라반 객체를 생성합니다.
      const newCaravanData = {
        name,
        description,
        capacity,
        dailyRate,
        location,
        amenities: Array.isArray(amenities) ? amenities : [amenities], // 편의시설이 단일 값으로 올 경우 배열로 변환
        photos,
        host,
        status: status || '사용가능', // status 필드 추가 (기본값 '사용가능')
      };

      // 4. 리포지토리를 통해 새로운 카라반을 데이터베이스에 생성합니다.
      const createdCaravan = await CaravanRepository.create(newCaravanData);

      // 5. 성공적으로 생성되었음을 클라이언트에게 알립니다. (201 Created)
      res.status(201).json({
        message: 'Caravan created successfully',
        data: createdCaravan,
      });
    } catch (error) {
      // 6. 처리 중 발생한 에러를 중앙 에러 처리 미들웨어로 전달합니다.
      console.error('Error in createCaravan controller:', error);
      next(error);
    }
  }

  /**
   * @brief 현재 로그인한 호스트의 모든 카라반을 조회합니다. (GET /api/v1/caravans/host/me)
   * @param {Object} req - Express의 요청(request) 객체 (req.user 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async getMyCaravans(req, res, next) {
    try {
      // 1. 인증 미들웨어를 통해 얻은 사용자 ID를 가져옵니다.
      const hostId = req.user._id;

      // 2. 리포지토리를 통해 해당 호스트 ID를 가진 모든 카라반을 조회합니다.
      const caravans = await CaravanRepository.findByHostId(hostId);

      // 3. 조회된 카라반 목록을 성공적으로 응답합니다.
      res.status(200).json({
        message: 'My caravans fetched successfully',
        data: caravans,
      });
    } catch (error) {
      // 4. 처리 중 발생한 에러를 중앙 에러 처리 미들웨어로 전달합니다.
      console.error('Error in getMyCaravans controller:', error);
      next(error);
    }
  }

  /**
   * @brief ID로 특정 카라반 정보를 수정합니다. (PUT /api/v1/caravans/:id)
   * @param {Object} req - Express의 요청(request) 객체 (req.params.id, req.body, req.user 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async updateCaravan(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 1. 카라반을 조회합니다.
      const caravan = await CaravanRepository.findById(id);

      if (!caravan) {
        return res.status(404).json({ message: '수정할 카라반을 찾을 수 없습니다.' });
      }

      // 2. 현재 로그인한 사용자가 해당 카라반의 호스트인지 확인합니다. (권한 검사)
      if (!caravan.host._id.equals(req.user._id)) {
        return res.status(403).json({ message: '카라반을 수정할 권한이 없습니다.' });
      }

      // 3. 업데이트할 데이터를 req.body로부터 안전하게 추출합니다.
      const updateObject = {};
      const allowedFields = ['name', 'description', 'location', 'amenities', 'status'];
      const numericFields = ['capacity', 'dailyRate'];

      // 텍스트 및 상태 필드 처리
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'amenities') {
            updateObject[field] = Array.isArray(req.body[field]) ? req.body[field] : [req.body[field]];
          } else {
            updateObject[field] = req.body[field];
          }
        }
      });

      // 숫자 필드 처리
      numericFields.forEach(field => {
        if (req.body[field] !== undefined && !isNaN(Number(req.body[field]))) {
          updateObject[field] = Number(req.body[field]);
        }
      });

      // 4. 사진 업데이트 로직
      let updatedPhotos = caravan.photos;
      // 4-1. 삭제할 사진 처리
      if (req.body.deletedPhotos) {
        const photosToDelete = Array.isArray(req.body.deletedPhotos) ? req.body.deletedPhotos : [req.body.deletedPhotos];
        updatedPhotos = updatedPhotos.filter(photoUrl => !photosToDelete.includes(photoUrl));
      }
      // 4-2. 새로 추가된 사진 처리 (req.files는 multer upload.array('newPhotos')에서 옴)
      if (req.files && req.files.length > 0) {
        const newPhotoUrls = req.files.map(file => 
          `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        );
        updatedPhotos = [...updatedPhotos, ...newPhotoUrls];
      }
      updateObject.photos = updatedPhotos;

      // 5. 리포지토리를 통해 카라반 정보를 업데이트합니다.
      const updatedCaravan = await CaravanRepository.updateById(id, updateObject);

      // 6. 성공적으로 업데이트되었음을 클라이언트에게 알립니다.
      res.status(200).json({
        message: 'Caravan updated successfully',
        data: updatedCaravan,
      });
    } catch (error) {
      console.error('Error in updateCaravan controller:', error);
      next(error);
    }
  }

  /**
   * @brief ID로 특정 카라반을 삭제합니다. (DELETE /api/v1/caravans/:id)
   * @param {Object} req - Express의 요청(request) 객체 (req.params.id, req.user 포함)
   * @param {Object} res - Express의 응답(response) 객체
   * @param {Function} next - 에러 처리를 위한 next 함수
   */
  async deleteCaravan(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 1. 카라반을 조회하여 현재 호스트 정보를 확인합니다.
      const caravan = await CaravanRepository.findById(id);

      if (!caravan) {
        return res.status(404).json({ message: '삭제할 카라반을 찾을 수 없습니다.' });
      }

      // 2. 현재 로그인한 사용자가 해당 카라반의 호스트인지 확인합니다. (권한 검사)
      console.log('Checking caravan host auth FOR DELETE:', {
        caravanHostId: caravan.host._id,
        caravanHostIdType: typeof caravan.host._id,
        userId: req.user._id,
        userIdType: typeof req.user._id,
      });
      if (!caravan.host._id.equals(req.user._id)) {
        return res.status(403).json({ message: '카라반을 삭제할 권한이 없습니다.' });
      }

      // 3. 리포지토리를 통해 카라반을 삭제합니다.
      await CaravanRepository.deleteById(id);
      
      // TODO: 관련된 사진 파일들을 파일 시스템에서 삭제하는 로직 추가 (fs.unlink)

      // 4. 성공적으로 삭제되었음을 클라이언트에게 알립니다.
      res.status(200).json({ message: 'Caravan deleted successfully' });

    } catch (error)
 {
      console.error('Error in deleteCaravan controller:', error);
      next(error);
    }
  }
}

module.exports = new CaravanController();
