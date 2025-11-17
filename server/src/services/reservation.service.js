// server/src/services/reservation.service.js

// 이 서비스가 의존하는 다른 모듈들을 가져옵니다.
const CaravanRepository = require('../repositories/caravan.repository');
const ReservationValidator = require('./reservation.validator');
// const ReservationRepository = require('../repositories/reservation.repository'); // 실제 구현 시 필요

/**
 * @brief ReservationService 클래스
 * @description
 *   예약과 관련된 핵심 비즈니스 로직을 처리하는 '서비스 계층'입니다.
 *   HTTP 요청/응답과 같은 외부 세계의 상세한 내용을 알지 못하며, 순수하게 비즈니스 로직에만 집중합니다.
 *   
 *   '의존성 주입(Dependency Injection, DI)' 개념이 적용되었습니다.
 *   이 클래스는 자신이 직접 의존성 객체(validator, repository 등)를 생성하지 않습니다.
 *   대신, 생성자(constructor)를 통해 외부에서 생성된 객체를 주입받습니다.
 *   
 *   [DI의 장점]
 *   1. 결합도 감소(Decoupling): ReservationService는 ReservationValidator의 '구현'이 아닌 '인터페이스(기능)'에 의존합니다.
 *      따라서 나중에 Validator의 내부 로직이 바뀌거나 다른 Validator 구현체로 교체되어도 ReservationService 코드는 영향을 받지 않습니다.
 *   2. 테스트 용이성(Testability): 단위 테스트 시, 실제 데이터베이스에 접근하는 Repository 대신 가짜(mock) Repository 객체를 쉽게 주입할 수 있습니다.
 *      이를 통해 외부 환경에 의존하지 않는 빠르고 안정적인 테스트가 가능해집니다.
 */
class ReservationService {
  /**
   * @param {Object} dependencies - 이 서비스가 의존하는 객체들의 모음
   * @param {ReservationValidator} dependencies.validator - 예약 유효성 검증기
   * @param {CaravanRepository} dependencies.caravanRepo - 카라반 리포지토리
   */
  constructor(dependencies) {
    // 외부에서 주입된 의존성 객체들을 클래스 속성으로 저장합니다.
    this.validator = dependencies.validator;
    this.caravanRepo = dependencies.caravanRepo;
    // this.reservationRepo = dependencies.reservationRepo; // 실제 구현 시 필요
  }

  /**
   * @brief 새로운 예약을 생성하는 비즈니스 로직을 수행합니다.
   * @param {Object} reservationData - 예약 생성에 필요한 데이터
   * @returns {Promise<Object>} 생성된 예약 객체
   */
  async createReservation(reservationData) {
    const { caravanId } = reservationData;

    // 1. 리포지토리를 통해 예약할 카라반 정보를 조회합니다.
    const caravan = await this.caravanRepo.findById(caravanId);

    // 2. 주입받은 검증기(Validator)를 사용하여 데이터의 유효성을 검증합니다.
    //    - 서비스는 '어떻게' 검증하는지 모르고, 단지 검증을 위임할 뿐입니다.
    await this.validator.validateCreate(reservationData, caravan);

    // 3. 모든 검증을 통과하면, 핵심 비즈니스 로직을 수행합니다.
    //    - 예를 들어, 여기서 가격 계산, 할인 적용 등의 로직이 들어갈 수 있습니다.
    const price = (new Date(reservationData.endDate) - new Date(reservationData.startDate)) / (1000 * 60 * 60 * 24) * caravan.dailyRate;
    const finalReservationData = { ...reservationData, totalPrice: price };

    // 4. 리포지토리를 통해 최종 데이터를 데이터베이스에 저장합니다.
    //    - 서비스는 '어떻게' 저장하는지 모르고, 단지 저장을 위임할 뿐입니다.
    // const newReservation = await this.reservationRepo.create(finalReservationData);
    
    // 5. 결과물을 반환합니다. (현재는 임시 객체 반환)
    console.log('예약 서비스 로직이 성공적으로 실행되었습니다.');
    // return newReservation;
    return { ...finalReservationData, status: 'pending_approval' }; // 임시 반환 데이터
  }
}

// 서비스 인스턴스를 생성할 때, 필요한 의존성 객체들을 주입하여 생성합니다.
const reservationService = new ReservationService({
  validator: ReservationValidator,
  caravanRepo: CaravanRepository,
  // reservationRepo: ReservationRepository // 실제 구현 시 필요
});

// 생성된 서비스 인스턴스를 export 합니다.
module.exports = reservationService;
