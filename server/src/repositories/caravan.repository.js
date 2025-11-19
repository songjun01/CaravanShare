// server/src/repositories/caravan.repository.js

// Caravan 모델을 가져옵니다. 데이터베이스와 직접 상호작용하는 Mongoose 모델입니다.
const Caravan = require('../models/caravan.model');

/**
 * @brief CaravanRepository 클래스
 * @description
 *   '리포지토리 패턴'을 구현하는 클래스입니다.
 *   데이터베이스의 Caravan 데이터에 접근하는 로직(CRUD)을 한 곳에서 중앙 집중적으로 관리합니다.
 *   이를 통해 서비스 로직(비즈니스 로직)과 데이터 접근 로직을 분리하여 코드의 유지보수성과 테스트 용이성을 높입니다.
 *   예를 들어, 나중에 데이터베이스를 MongoDB에서 다른 것으로 바꾸더라도, 이 리포지토리 클래스 내부의 코드만 수정하면 됩니다.
 *   서비스 계층의 코드는 변경할 필요가 없습니다.
 */
class CaravanRepository {
  /**
   * @brief 모든 카라반 목록을 조회합니다.
   * @returns {Promise<Array>} 카라반 문서 객체의 배열
   */
  async findAll() {
    // Mongoose의 find() 메소드를 사용하여 모든 문서를 조회합니다.
    return Caravan.find();
  }

  /**
   * @brief ID로 특정 카라반을 조회합니다.
   * @param {String} id - 조회할 카라반의 ID
   * @returns {Promise<Object|null>} 카라반 문서 객체 또는 null
   */
  async findById(id) {
    // Mongoose의 findById() 메소드를 사용하고, populate()를 체이닝하여 연관된 호스트 정보를 함께 로드합니다.
    // 'host' 필드를 참조하여 'User' 컬렉션에서 해당 문서를 찾습니다.
    // 두 번째 인자로 'displayName profileImage introduction createdAt'을 전달하여, 필요한 필드만 선택적으로 가져옵니다.
    return Caravan.findById(id).populate('host', 'displayName profileImage introduction createdAt');
  }

  /**
   * @brief 호스트 ID로 카라반 목록을 조회합니다.
   * @param {String} hostId - 조회할 호스트의 ID
   * @returns {Promise<Array>} 해당 호스트의 카라반 문서 객체 배열
   */
  async findByHostId(hostId) {
    // Mongoose의 find() 메소드에 host 필드를 기준으로 쿼리합니다.
    return Caravan.find({ host: hostId });
  }

  /**
   * @brief ID로 특정 카라반을 업데이트합니다.
   * @param {String} id - 업데이트할 카라반의 ID
   * @param {Object} updateData - 업데이트할 카라반의 데이터
   * @returns {Promise<Object>} 업데이트된 카라반 문서 객체
   */
  async updateById(id, updateData) {
    // findByIdAndUpdate 메소드를 사용하여 문서를 찾아 업데이트합니다.
    // { new: true } 옵션은 업데이트된 문서를 반환하도록 합니다.
    return Caravan.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * @brief ID로 특정 카라반을 삭제합니다.
   * @param {String} id - 삭제할 카라반의 ID
   * @returns {Promise<Object>} 삭제된 카라반 문서 객체
   */
  async deleteById(id) {
    // findByIdAndDelete 메소드를 사용하여 문서를 찾아 삭제합니다.
    return Caravan.findByIdAndDelete(id);
  }

  /**
   * @brief 새로운 카라반을 생성합니다.
   * @param {Object} caravanData - 생성할 카라반의 데이터
   * @returns {Promise<Object>} 생성된 카라반 문서 객체
   */
  async create(caravanData) {
    // Mongoose의 create() 메소드를 사용하여 새로운 문서를 생성하고 저장합니다.
    return Caravan.create(caravanData);
  }

  /**
   * @brief 특정 카라반의 정보를 수정합니다.
   * @param {String} id - 수정할 카라반의 ID
   * @param {Object} caravanData - 수정할 정보
   * @returns {Promise<Object|null>} 수정된 카라반 문서 객체
   */
  async update(id, caravanData) {
    // findByIdAndUpdate 메소드는 ID로 문서를 찾아 업데이트합니다.
    // { new: true } 옵션은 업데이트된 후의 문서를 반환하도록 설정합니다.
    return Caravan.findByIdAndUpdate(id, caravanData, { new: true });
  }

  /**
   * @brief 특정 카라반을 삭제합니다.
   * @param {String} id - 삭제할 카라반의 ID
   * @returns {Promise<Object|null>} 삭제된 카라반 문서 객체
   */
  async delete(id) {
    return Caravan.findByIdAndDelete(id);
  }
}

// CaravanRepository 클래스의 인스턴스를 생성하여 export합니다.
// 이를 통해 애플리케이션 전체에서 단일 인스턴스를 공유(싱글톤 패턴)하여 사용할 수 있습니다.
module.exports = new CaravanRepository();
