# 개발 일지

## 프로젝트 개요
- 프로젝트명: 카라반 공유 앱
- 개발 기간: 2025.11.10 - 
- 목표: 카라반(캠핑카)을 소유한 사람과 이용하고 싶은 사람을 연결하는 공유 플랫폼을 구현


## 개발 과정

### Day 1 (2025.11.10)
- **작업 내용**: 작업을 위해 프로젝트의 개요와 핵심 요구사항을 gemini CLI에 입력
- **Gemini CLI 사용 프롬프트**:
```
프로젝트 개요
서비스 개념
CaravanShare: 카라반(캠핑카)을 소유한 사람과 이용하고 싶은 사람을 연결하는 공유 플랫폼

공급자(호스트): 카라반을 소유하고 임대하려는 사람
수요자(게스트): 카라반을 빌려 여행하고 싶은 사람
핵심 가치: 유휴 자산의 활용, 저렴한 여행 경험, 커뮤니티

핵심 요구사항
Phase 1: MVP(최소 기능 제품)

1.1 사용자 관리
회원가입 (호스트/게스트 구분)
프로필 관리 (이름, 연락처, 평가, 신원 확인)
인증/인가 (로그인, 권한 관리)
사용자 신뢰도 시스템

1.2 카라반 정보 관리
카라반 등록 (호스트)
카라반 정보: 수용 인원, 편의시설, 사진, 위치
카라반 검색/조회 (게스트)
카라반 상태 관리 (사용가능, 예약됨, 정비중)

1.3 예약 시스템
예약 신청 (게스트)
예약 승인/거절 (호스트)
예약 날짜 관리 (캘린더)
중복 예약 방지

1.4 결제 및 가격
일일 요금 설정 (호스트)
가격 계산 (렌탈 기간 기반)
선결제 시스템
결제 이력 조회

1.5 리뷰/평가
거래 후 리뷰 작성
평점 시스템 (1-5점)
호스트/게스트 신뢰도 반영
```
- **결과 및 수정사항**: 프롬프트를 토대로 Gemini CLI가 GEMINI.md파일 작성
- **학습 내용**: Gemini CLI의 프로젝트 이해

---

- **작업 내용**: Gemini CLI에 프로젝트 리덱토리 구성을 알려줌
- **Gemini CLI 사용 프롬프트**:
```
your_project/
├── src/
│   ├── models/
│   ├── services/
│   ├── repositories/
│   └── exceptions/
├── tests/
├── README.md
├── DESIGN.md
└── requirements.txt
```
- **결과 및 수정사항**: 프롬프트를 토대로 Gemini CLI가 디렉토리와 파일 생성
- **학습 내용**: 프로젝트 파일 구성

---

### Day 2 (2025.11.15)

- **작업 내용**: Gemini CLI에 현재 문제가 있는 코드를 알려줌
- **Gemini CLI 사용 프롬프트**:
```
데이터 모델 (설계 과제)
현재 문제가 있는 코드 (개선 필요)



# 나쁜 설계 예시
class CaravanApp:
    def __init__(self):
        self.users = []
        self.caravans = []
        self.reservations = []
        self.reviews = []
        self.payments = []

    def create_reservation(self, user_id, caravan_id, start_date, end_date, price):
        # 복잡한 로직이 한 메서드에 집중
        user = None
        for u in self.users:
            if u['id'] == user_id:
                user = u
                break

        caravan = None
        for c in self.caravans:
            if c['id'] == caravan_id:
                caravan = c
                break

        if user is None or caravan is None:
            return False

        # 중복 예약 검사
        for r in self.reservations:
            if (
                r['caravan_id'] == caravan_id and
                ((start_date >= r['start_date'] and start_date <= r['end_date']) or
                 (end_date >= r['start_date'] and end_date <= r['end_date']))
            ):
                return False

        # 결제 처리
        if user['balance'] < price:
            return False

        user['balance'] -= price

        # 예약 생성
        reservation = {
            'id': len(self.reservations) + 1,
            'user_id': user_id,
            'caravan_id': caravan_id,
            'start_date': start_date,
            'end_date': end_date,
            'status': 'pending',
            'price': price
        }

        self.reservations.append(reservation)
        return True

    def get_caravan_info(self, caravan_id):
        # 검색이 비효율적
        for c in self.caravans:
            if c['id'] == caravan_id:
                return c
        return None



문제점 분석 (바이브코딩 관점)

1. 단일 책임 원칙 위반
CaravanApp 클래스가 모든 기능을 담당
사용자 관리, 예약, 결제 등이 섞여있음

2. 낮은 응집도
관련 데이터가 분리되어 있음
사용자의 인증 정보와 프로필이 혼재

3. 비효율적인 검색
리스트 순회로 O(n) 성능
대규모 데이터에서 성능 저하

4. 중복 코드
사용자/카라반 검색 로직 반복
중복 예약 검사 로직이 복잡함

5. 강한 결합도
결제와 예약이 직접 결합
도메인 로직이 흩어져 있음

6. 테스트 불가능
의존성이 하드코딩됨
모킹(Mocking)이 어려움
```
- **결과 및 수정사항**: 프롬프트를 토대로 Gemini CLI가 코드를 수정하여 프로젝트에 작성
- **학습 내용**: Gemini CLI의 프로젝트 이해

---

- **작업 내용**: 바이브코딩 실전 과제 1
- **Gemini CLI 사용 프롬프트**:
```
바이브코딩 실전 과제

과제 1: 깨끗한 도메인 모델 설계
목표: 책임을 분리하고 응집도 높은 클래스 구조 설계

요구사항:
User 클래스: 사용자 관련 책임만
Caravan 클래스: 카라반 정보 관리
Reservation 클래스: 예약 정보 관리
Payment 클래스: 결제 로직
Review 클래스: 리뷰/평가

설계 원칙:
단일 책임 원칙 (SRP)
개방/폐쇄 원칙 (OCP)
의존성 역전 원칙 (DIP)
```
- **결과 및 수정사항**: 프롬프트를 토대로 Gemini CLI가 과제 1을 해결
- **학습 내용**: Gemini CLI를 활용한 클래스 설계

---

- **작업 내용**: 바이브코딩 실전 과제 2
- **Gemini CLI 사용 프롬프트**:
```
과제 2: 복잡한 비즈니스 로직 분리
목표: 예약 검증 로직을 명확하게 분리

요구사항:
ReservationValidator 클래스 설계
각 검증을 별도의 메서드로 분리
각 검증이 독립적으로 테스트 가능해야 함
```
- **결과 및 수정사항**: 프롬프트를 토대로 Gemini CLI가 과제 2를 해결
- **학습 내용**: Gemini CLI를 활용한 비즈니스 로직 분리

---

- **작업 내용**: 바이브코딩 실전 과제 3
- **Gemini CLI 사용 프롬프트**:
```
과제 3: 효율적인 데이터 구조와 검색 알고리즘
목표: 성능 최적화와 가독성 있는 코드

요구사항:
ReservationRepository 클래스 설계
인덱싱을 통한 O(1) 검색 구현
날짜별 충돌 검사 최적화
```
- **결과 및 수정사항**: 프롬프트를 토대로 Gemini CLI가 과제 3을 해결
- **학습 내용**: Gemini CLI를 활용한 검색 알고리즘 구현




## 주요 도전 과제 및 해결 방법



---

 ## 바이브 코딩 활용 소감
 - 

 ## 최종 결과물 평가
 - 달성한 목표:
 - 미완성 기능:
 - 향후 개선 계획: