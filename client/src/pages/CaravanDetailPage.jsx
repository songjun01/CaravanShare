// client/src/pages/CaravanDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header'; // Layout 대신 Header를 직접 임포트
import DatePicker from 'react-datepicker'; // react-datepicker 임포트
import 'react-datepicker/dist/react-datepicker.css'; // datepicker CSS 임포트
import { differenceInDays, eachDayOfInterval } from 'date-fns'; // date-fns에서 날짜 차이 계산 함수, 각 날짜 추출 함수 임포트
import ReviewList from '../components/ReviewList'; // ReviewList 컴포넌트 임포트
import HostProfile from '../components/HostProfile'; // HostProfile 컴포넌트 임포트
import { useAuth } from '../context/AuthContext'; // useAuth 훅 임포트

/**
 * @brief 카라반 상세 정보 페이지
 * @description
 *   - URL 파라미터로 받은 카라반 ID를 사용하여 특정 카라반의 상세 정보를 표시합니다.
 *   - 에어비앤비 스타일의 레이아웃을 가집니다.
 *   - 데이터 로딩, 에러 상태에 따른 UI 변화를 처리합니다.
 */
export default function CaravanDetailPage() {
  // 1. 상태 관리
  const { id } = useParams();
  const { user, token, loading: authLoading } = useAuth(); // 사용자 정보와 JWT 토큰, 인증 로딩 상태를 가져옵니다.
  const [caravan, setCaravan] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null); // 체크인 날짜 상태
  const [endDate, setEndDate] = useState(null); // 체크아웃 날짜 상태
  const [bookedDates, setBookedDates] = useState([]); // 예약된 날짜 목록 상태
  const [reservationDetails, setReservationDetails] = useState(null); // 예약 상세 정보 상태

  // 평균 평점을 계산하는 함수
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(2); // 소수점 둘째 자리까지 표시
  };

  const averageRating = calculateAverageRating();

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setReservationDetails(null);
  };

  // 총 가격 계산
  const numberOfNights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const subtotal = caravan ? caravan.dailyRate * numberOfNights : 0;
  const serviceFee = Math.round(subtotal * 0.1); // 10% 서비스 수수료
  const totalPrice = subtotal + serviceFee;

  // 예약하기 버튼 클릭 핸들러
  const handleReservation = async () => {
    if (!user) {
      alert('로그인 후 예약할 수 있습니다.');
      // navigate('/login'); // 로그인 페이지로 리다이렉트할 수도 있습니다.
      return;
    }

    if (!startDate || !endDate || numberOfNights <= 0) {
      alert('체크인/체크아웃 날짜를 정확히 선택해주세요.');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations`,
        {
          caravanId: caravan._id,
          startDate: startDate.toISOString(), // ISO 문자열 형식으로 전송
          endDate: endDate.toISOString(),     // ISO 문자열 형식으로 전송
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setReservationDetails(response.data.data);
      alert('예약 요청이 완료되었습니다. 결제를 진행해주세요.');
    } catch (err) {
      console.error('Reservation error:', err.response?.data || err);
      alert(err.response?.data?.message || '예약 요청 중 오류가 발생했습니다.');
    }
  };

  // DatePicker를 위한 커스텀 입력 컴포넌트
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => {
    const [checkin, checkout] = value.split(' - ');
    return (
      <div className="border rounded-lg p-2 mb-4 cursor-pointer" onClick={onClick} ref={ref}>
        <div className="grid grid-cols-2 gap-px">
          <div className="pr-2 border-r">
            <label className="block text-xs font-semibold">체크인</label>
            <div className="text-sm">{checkin || '날짜 추가'}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold pl-2">체크아웃</label>
            <div className="text-sm pl-2">{checkout || '날짜 추가'}</div>
          </div>
        </div>
      </div>
    );
  });

    const handlePayment = async () => {
    if (!reservationDetails) {
      alert('예약 정보가 없습니다.');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/payments`,
        {
          reservationId: reservationDetails._id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      alert('결제가 성공적으로 완료되었습니다. 예약이 확정되었습니다.');
      // 상태 초기화
      setStartDate(null);
      setEndDate(null);
      setReservationDetails(null);
      // 예약된 날짜 목록 다시 가져오기
      fetchBookedDates();
    } catch (err) {
      console.error('Payment error:', err.response?.data || err);
      alert(err.response?.data?.message || '결제 중 오류가 발생했습니다.');
    }
  };

  // 2. 데이터 로딩
  const fetchBookedDates = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/caravan/${id}/booked-dates`);
        const dates = response.data.data.flatMap(reservation => {
          return eachDayOfInterval({
            start: new Date(reservation.startDate),
            end: new Date(reservation.endDate),
          });
        });
        setBookedDates(dates);
      } catch (err) {
        console.error('Failed to fetch booked dates:', err);
        setBookedDates([]); 
      }
    };

  useEffect(() => {
    const fetchCaravan = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans/${id}`);
        setCaravan(response.data.data.caravan);
        setReviews(response.data.data.reviews);
        setError(null);
      } catch (err) {
        setError(err.response ? `${err.response.status} - ${err.response.data.message}` : err.message);
        setCaravan(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaravan();
    fetchBookedDates(); // 예약된 날짜도 함께 가져옵니다.
  }, [id]);

  // 3. 조건부 렌더링
  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-10">로딩 중...</div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-500">에러가 발생했습니다: {error}</div>;
    }
    if (!caravan) {
      return <div className="text-center py-10">카라반 정보를 찾을 수 없습니다.</div>;
    }

    // 4. 상세 페이지 UI 렌더링
    return (
      <>
        {/* --- 상단: 카라반 이름 및 기본 정보 --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{caravan.name}</h1>
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.24 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" /></svg>
                {averageRating}
              </span>
              <span className="mx-2">·</span>
              <span>후기 {reviews.length}개</span>
              <span className="mx-2">·</span>
              <span>{caravan.location}</span>
            </div>
          </div>
        </div>

        {/* --- 이미지 갤러리 --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[500px] rounded-xl overflow-hidden">
            {/* 큰 이미지 (왼쪽) */}
            <div className="md:col-span-2 md:row-span-2">
              <img src={caravan.photos?.[0] || 'https://via.placeholder.com/800x600?text=Main+Image'} alt={`${caravan.name}의 대표 이미지`} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
            </div>
            {/* 작은 이미지들 (오른쪽) */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="hidden md:block">
                <img src={caravan.photos?.[i] || `https://via.placeholder.com/400x300?text=Sub+Image+${i}`} alt={`${caravan.name}의 서브 이미지 ${i}`} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* --- 메인 컨텐츠 (정보 영역 + 예약 위젯) --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-8">
            {/* 왼쪽 컬럼: 정보 영역 */}
            <div className="lg:col-span-2">
              <div className="pb-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">호스트: {caravan.host?.displayName || '아무개'}님</h2>
                    <p className="text-gray-500">
                      최대 인원 {caravan.capacity}명 · 침실 {caravan.bedrooms || 1}개 · 침대 {caravan.beds || 1}개 · 욕실 {caravan.bathrooms || 1}개
                    </p>
                  </div>
                  <img className="w-14 h-14 rounded-full" src={caravan.host?.profileImageUrl || 'https://via.placeholder.com/150'} alt="호스트 프로필 이미지" />
                </div>
              </div>
              <div className="py-6 border-b">
                <h3 className="text-xl font-semibold mb-4">숙소 편의시설</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {caravan.amenities && caravan.amenities.length > 0 ? caravan.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span>{amenity}</span>
                    </div>
                  )) : <p className="text-gray-500">제공되는 편의시설 정보가 없습니다.</p>}
                </div>
              </div>
              <div className="py-6">
                <h3 className="text-xl font-semibold mb-4">숙소 설명</h3>
                <p className="text-gray-700 whitespace-pre-line">{caravan.description || '숙소 설명이 없습니다.'}</p>
              </div>

              {/* --- 리뷰 섹션 --- */}
              <div className="border-t">
                <ReviewList reviews={reviews} />
              </div>

              {/* --- 호스트 소개 섹션 --- */}
              <div className="border-t">
                <HostProfile host={caravan.host} />
              </div>
            </div>
            {/* 오른쪽 컬럼: 예약 위젯 또는 상태 표시 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="p-6 border rounded-xl shadow-lg bg-white">
                  {user?.isHost === true ? (
                    <div className="text-center py-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        호스트는 카라반을 예약할 수 없습니다.
                      </h3>
                    </div>
                  ) : caravan.status === '사용가능' ? (
                    <>
                      {/* --- 예약 위젯 --- */}
                      <div className="flex items-baseline mb-4">
                        <span className="text-2xl font-bold">₩{caravan.dailyRate.toLocaleString()}</span>
                        <span className="text-gray-600 ml-1">/ 박</span>
                      </div>
                      {/* 날짜 선택 */}
                      <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        minDate={new Date()}
                        monthsShown={2}
                        customInput={<CustomDateInput />}
                        dateFormat="yyyy/MM/dd"
                        popperPlacement="bottom-end"
                        excludeDates={bookedDates} // 예약된 날짜 비활성화
                      />
                      {/* 인원 선택 */}
                      <div className="border rounded-lg p-2">
                        <div className="mt-2 pt-2">
                          <label htmlFor="guests" className="block text-xs font-semibold">인원</label>
                          <select id="guests" className="w-full border-none focus:ring-0 p-0">
                            {[...Array(caravan.capacity)].map((_, i) => (
                              <option key={i} value={i + 1}>게스트 {i + 1}명</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {reservationDetails ? (
                        <button onClick={handlePayment} className="w-full mt-4 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors">
                          결제 진행
                        </button>
                      ) : (
                        <button onClick={handleReservation} className="w-full mt-4 bg-[#524be7] text-white font-bold py-3 rounded-lg hover:bg-[#4a43d9] transition-colors">
                          예약하기
                        </button>
                      )}
                      <p className="text-center text-sm text-gray-500 mt-3">예약 확정 전에는 요금이 청구되지 않습니다.</p>
                      {/* 가격 계산 */}
                      {startDate && endDate && differenceInDays(endDate, startDate) > 0 && (
                        <div className="mt-6 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>₩{caravan.dailyRate.toLocaleString()} x {differenceInDays(endDate, startDate)}박</span>
                            <span>₩{(caravan.dailyRate * differenceInDays(endDate, startDate)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>서비스 수수료</span>
                            <span>₩{Math.round(caravan.dailyRate * differenceInDays(endDate, startDate) * 0.1).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t mt-2">
                            <span>총 합계</span>
                            <span>₩{Math.round(caravan.dailyRate * differenceInDays(endDate, startDate) * 1.1).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* --- 예약 불가 상태 표시 --- */}
                      <div className="text-center py-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {caravan.status === '예약됨' ? '현재 예약된 카라반입니다' : '현재 정비중인 카라반입니다'}
                        </h3>
                        <p className="text-gray-600">
                          {caravan.status === '예약됨' 
                            ? '다른 날짜를 선택하시거나 다른 카라반을 찾아보세요.' 
                            : '더 나은 서비스를 위해 잠시 정비 중입니다. 양해 부탁드립니다.'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
