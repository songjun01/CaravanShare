# 프로젝트 개요

## 서비스 개념

**CaravanShare**: 카라반(캠핑카)을 소유한 사람과 이용하고 싶은 사람을 연결하는 공유 플랫폼

*   **공급자(호스트)**: 카라반을 소유하고 임대하려는 사람
*   **수요자(게스트)**: 카라반을 빌려 여행하고 싶은 사람
*   **핵심 가치**: 유휴 자산의 활용, 저렴한 여행 경험, 커뮤니티

## 핵심 요구사항

### Phase 1: MVP(최소 기능 제품)

#### 1.1 사용자 관리
*   회원가입 (호스트/게스트 구분)
*   프로필 관리 (이름, 연락처, 평가, 신원 확인)
*   인증/인가 (로그인, 권한 관리)
*   사용자 신뢰도 시스템

#### 1.2 카라반 정보 관리
*   카라반 등록 (호스트)
*   카라반 정보: 수용 인원, 편의시설, 사진, 위치
*   카라반 검색/조회 (게스트)
*   카라반 상태 관리 (사용가능, 예약됨, 정비중)

#### 1.3 예약 시스템
*   예약 신청 (게스트) - **완료**
    *   `Reservation` 모델 생성 (server/src/models/reservation.model.js)
    *   `ReservationController` (`createReservation` 함수) 구현 (server/src/controllers/reservation.controller.js)
    *   `ReservationRepository` 생성 (server/src/repositories/reservation.repository.js)
    *   `ReservationValidator` 생성 (server/src/services/reservation.validator.js)
    *   `reservations.routes.js` 라우트 정의 및 `server.js`에 등록
    *   `CaravanDetailPage.jsx`에서 '예약하기' 버튼에 API 연동 및 유효성 검사
*   예약 승인/거절 (호스트)
*   예약 날짜 관리 (캘린더)
*   중복 예약 방지

#### 1.4 결제 및 가격
*   일일 요금 설정 (호스트)
*   가격 계산 (렌탈 기간 기반)
*   선결제 시스템
*   결제 이력 조회

#### 1.5 리뷰/평가
*   거래 후 리뷰 작성
*   평점 시스템 (1-5점)
*   호스트/게스트 신뢰도 반영