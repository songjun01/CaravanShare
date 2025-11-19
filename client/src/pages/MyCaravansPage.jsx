// client/src/pages/MyCaravansPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CaravanCard from '../components/CaravanCard';

/**
 * @brief '내 카라반 관리' 페이지
 * @description 로그인한 호스트가 자신이 등록한 카라반 목록을 보고 관리하는 페이지입니다.
 */
export default function MyCaravansPage() {
  const [myCaravans, setMyCaravans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // 인증 토큰 가져오기

  // 1. 데이터 로딩
  useEffect(() => {
    const fetchMyCaravans = async () => {
      // 토큰이 없으면 API 요청을 보내지 않습니다.
      if (!token) {
        setLoading(false);
        setError('로그인이 필요합니다.');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans/host/me`, {
          headers: {
            'Authorization': `Bearer ${token}`, // 요청 헤더에 인증 토큰 추가
          },
        });
        setMyCaravans(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyCaravans();
  }, [token]); // 토큰이 변경될 때마다 데이터를 다시 불러옵니다.

  // 2. 렌더링 로직
  const renderContent = () => {
    // 로딩 중
    if (loading) {
      return <div className="text-center">로딩 중...</div>;
    }
    // 에러 발생
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
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
    // 카라반 목록 표시
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {myCaravans.map(caravan => (
          <CaravanCard key={caravan._id} caravan={caravan} isMyCaravan={true} />
        ))}
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
