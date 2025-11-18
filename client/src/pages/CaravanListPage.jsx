// client/src/pages/CaravanListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // HTTP 통신을 위한 axios 라이브러리
import Layout from '../components/Layout'; // 공통 레이아웃 컴포넌트
import CaravanCard from '../components/CaravanCard'; // 외부 CaravanCard 컴포넌트 임포트

/**
 * @brief 카라반 목록 페이지 컴포넌트
 * @description 백엔드 API에서 카라반 목록을 가져와 화면에 렌더링합니다.
 */
const CaravanListPage = () => {
  // React Hooks를 사용하여 컴포넌트의 상태를 관리합니다.
  const [caravans, setCaravans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect Hook: 컴포넌트가 처음 렌더링될 때 API 요청을 보냅니다.
  useEffect(() => {
    const fetchCaravans = async () => {
      try {
        // API 엔드포인트 URL을 환경 변수에서 가져옵니다.
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans`;
        
        const response = await axios.get(apiUrl);
        
        // 백엔드 응답 구조에 따라 `response.data.data`로 접근하여 상태를 업데이트합니다.
        setCaravans(response.data.data);
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaravans();
  }, []); // 컴포넌트가 마운트될 때 한 번만 실행됩니다.

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return <Layout><div className="text-center text-xl p-8">목록을 불러오는 중...</div></Layout>;
  }

  // 에러 발생 시 표시할 UI
  if (error) {
    return <Layout><div className="text-center text-xl text-red-500 p-8">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">마음에 드는 카라반을 찾아보세요</h1>
        
        {/* 반응형 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* caravans 배열을 순회하며 각 카라반에 대한 CaravanCard 컴포넌트를 렌더링합니다. */}
          {caravans.map(caravan => (
            <CaravanCard key={caravan._id} caravan={caravan} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CaravanListPage;
