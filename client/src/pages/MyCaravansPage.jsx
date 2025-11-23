// client/src/pages/MyCaravansPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CaravanCard from '../components/CaravanCard';
import { format, differenceInDays } from 'date-fns'; // 날짜 포맷팅 및 차이 계산 임포트

/**
 * @brief '내 카라반 관리' 페이지
 * @description 로그인한 호스트가 자신이 등록한 카라반 목록을 보고 관리하는 페이지입니다.
 */
export default function MyCaravansPage() {
  const [myCaravans, setMyCaravans] = useState([]);
  const [myReservations, setMyReservations] = useState([]); // 호스트의 예약 요청 목록 상태
  const [loading, setLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(true); // 예약 로딩 상태
  const [error, setError] = useState(null);
  const { token } = useAuth(); // 인증 토큰 가져오기

  // 1. 데이터 로딩
  useEffect(() => {
    const fetchMyCaravans = async () => {
      if (!token) {
        setLoading(false);
        // setError('로그인이 필요합니다.'); // 로그인 오류는 전역으로 처리하거나 reservationsLoading에서 다룰 수 있습니다.
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans/host/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setMyCaravans(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || '카라반 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const fetchMyReservations = async () => {
      if (!token) {
        setReservationsLoading(false);
        setError('로그인이 필요합니다.'); // 토큰이 없으면 예약 목록도 가져올 수 없습니다.
        return;
      }

      try {
        setReservationsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/host`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        // 'pending' 상태의 예약을 먼저 보여주고, 그 다음 다른 상태의 예약을 보여주도록 정렬
        const sortedReservations = response.data.data.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.createdAt) - new Date(a.createdAt); // 최신순
        });
        setMyReservations(sortedReservations);
      } catch (err) {
        setError(err.response?.data?.message || '예약 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setReservationsLoading(false);
      }
    };

    fetchMyCaravans();
    fetchMyReservations();
  }, [token]); // 토큰이 변경될 때마다 데이터를 다시 불러옵니다.

  // 예약 승인 핸들러
  const handleApproveReservation = async (reservationId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/${reservationId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // 승인 후 예약 목록 새로고침 또는 상태 업데이트
      setMyReservations((prevReservations) =>
        prevReservations.map((res) =>
          res._id === reservationId ? { ...res, status: 'approved' } : res
        )
      );
      alert('예약이 성공적으로 승인되었습니다.');
    } catch (err) {
      console.error('Reservation approval error:', err.response?.data || err);
      alert(err.response?.data?.message || '예약 승인 중 오류가 발생했습니다.');
    }
  };

  // 예약 거절 핸들러
  const handleRejectReservation = async (reservationId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/${reservationId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // 거절 후 예약 목록 새로고침 또는 상태 업데이트
      setMyReservations((prevReservations) =>
        prevReservations.map((res) =>
          res._id === reservationId ? { ...res, status: 'rejected' } : res
        )
      );
      alert('예약이 성공적으로 거절되었습니다.');
    } catch (err) {
      console.error('Reservation rejection error:', err.response?.data || err);
      alert(err.response?.data?.message || '예약 거절 중 오류가 발생했습니다.');
    }
  };

  // 2. 렌더링 로직
  const renderContent = () => {
    // 로딩 중
    if (loading || reservationsLoading) {
      return <div className="text-center py-10">로딩 중...</div>;
    }
    // 에러 발생
    if (error) {
      return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    // 등록된 카라반이 없을 때 (Empty State)
    if (myCaravans.length === 0) {
      return (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-700">아직 등록된 카라반이 없습니다.</h2>
          <p className="text-gray-500 mt-2 mb-6">첫 번째 카라반을 등록하고 수익을 창출해보세요!</p>
          <Link
            to="/hosting"
            className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            첫 카라반 등록하기
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        {/* 내 카라반 목록 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">등록된 내 카라반</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myCaravans.map(caravan => (
              <CaravanCard key={caravan._id} caravan={caravan} isMyCaravan={true} />
            ))}
          </div>
        </div>

        {/* 예약 요청 목록 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">예약 요청 및 현황</h2>
          {myReservations.length === 0 ? (
            <p className="text-center text-gray-500 py-10">현재 예약 요청이 없습니다.</p>
          ) : (
            <div className="space-y-6">
              {myReservations.map((reservation) => {
                const nights = differenceInDays(new Date(reservation.endDate), new Date(reservation.startDate));
                const statusColor = {
                  pending: 'text-yellow-600',
                  approved: 'text-green-600',
                  rejected: 'text-red-600',
                  completed: 'text-blue-600',
                }[reservation.status] || 'text-gray-600';

                return (
                  <div key={reservation._id} className="flex flex-col md:flex-row items-start md:items-center bg-white shadow-md rounded-lg p-4 space-y-3 md:space-y-0 md:space-x-4">
                    <img
                      src={reservation.caravan.photos?.[0] || 'https://via.placeholder.com/150'}
                      alt={reservation.caravan.name}
                      className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">카라반: {reservation.caravan.name} ({reservation.caravan.location})</h3>
                      <p className="text-gray-700">게스트: {reservation.guest.displayName}</p>
                      <p className="text-gray-500 text-sm">
                        기간: {format(new Date(reservation.startDate), 'yyyy.MM.dd')} - {format(new Date(reservation.endDate), 'yyyy.MM.dd')} ({nights}박)
                      </p>
                      <p className="text-gray-500 text-sm">총 가격: ₩{reservation.totalPrice.toLocaleString()}</p>
                      <p className={`font-semibold ${statusColor}`}>상태: {reservation.status === 'pending' ? '대기 중' : reservation.status === 'approved' ? '승인됨' : reservation.status === 'rejected' ? '거절됨' : '알 수 없음'}</p>
                    </div>
                    {reservation.status === 'pending' && ( // 'pending' 상태일 때만 버튼 표시
                      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        <button
                          onClick={() => handleApproveReservation(reservation._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleRejectReservation(reservation._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">내 카라반 관리</h1>
        {renderContent()}
      </div>
    </Layout>
  );
}
