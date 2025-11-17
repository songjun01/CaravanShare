// client/src/pages/CaravanListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // HTTP 통신을 위한 axios 라이브러리
import Layout from '../components/Layout'; // 공통 레이아웃 컴포넌트

// 개별 카라반 정보를 표시하는 카드 컴포넌트
const CaravanCard = ({ caravan }) => (
  // transition-transform, hover:scale-105, hover:shadow-xl: 마우스를 올렸을 때 부드럽게 확대되고 그림자가 커지는 효과
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl">
    {/* 
      w-full h-56 object-cover: 이미지의 너비를 카드의 100%로, 높이를 고정값으로 설정합니다.
      object-cover는 이미지 비율을 유지하면서 영역을 꽉 채웁니다.
    */}
    <img src={caravan.photos[0] || 'https://via.placeholder.com/400x250'} alt={caravan.name} className="w-full h-56 object-cover" />
    
    <div className="p-5">
      {/* 
        flex justify-between items-start: 이름과 가격을 양 끝에 배치합니다.
      */}
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{caravan.name}</h3>
        <p className="text-lg font-semibold text-indigo-500 whitespace-nowrap">₩{caravan.dailyRate.toLocaleString()}/일</p>
      </div>
      <p className="text-gray-600 mb-4">{caravan.location}</p>
      <div className="flex items-center text-sm text-gray-500">
        {/* SVG 아이콘 예시 */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
        </svg>
        <span>최대 {caravan.capacity}인</span>
      </div>
    </div>
  </div>
);

/**
 * @brief 카라반 목록 페이지 컴포넌트
 * @description 백엔드 API에서 카라반 목록을 가져와 화면에 렌더링합니다.
 */
const CaravanListPage = () => {
  // React Hooks를 사용하여 컴포넌트의 상태를 관리합니다.
  // 1. caravans: API로부터 받아온 카라반 데이터 배열
  const [caravans, setCaravans] = useState([]);
  // 2. loading: 데이터 로딩 중인지 여부 (로딩 스피너 표시 등에 사용)
  const [loading, setLoading] = useState(true);
  // 3. error: API 요청 중 발생한 에러 메시지
  const [error, setError] = useState(null);

  // useEffect Hook: 컴포넌트가 처음 렌더링될 때 API 요청을 보냅니다.
  useEffect(() => {
    const fetchCaravans = async () => {
      try {
        // API 엔드포인트 URL. 실제 환경에서는 .env 파일 등으로 관리하는 것이 좋습니다.
        const apiUrl = 'http://localhost:5000/api/v1/caravans'; // 백엔드 서버 주소
        
        // axios를 사용하여 GET 요청을 보냅니다.
        const response = await axios.get(apiUrl);
        
        // 요청이 성공하면 받아온 데이터를 caravans 상태에 저장합니다.
        setCaravans(response.data.data); // 백엔드 응답 구조에 따라 `response.data.data`로 접근
      } catch (err) {
        // 에러가 발생하면 에러 메시지를 error 상태에 저장합니다.
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        // 성공/실패 여부와 관계없이 로딩 상태를 false로 변경합니다.
        setLoading(false);
      }
    };

    fetchCaravans();
  }, []); // 두 번째 인자로 빈 배열 `[]`을 전달하면, 컴포넌트가 마운트될 때 한 번만 실행됩니다.

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return <Layout><div className="text-center text-xl">로딩 중...</div></Layout>;
  }

  // 에러 발생 시 표시할 UI
  if (error) {
    return <Layout><div className="text-center text-xl text-red-500">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">마음에 드는 카라반을 찾아보세요</h1>
        
        {/* 
          grid: CSS Grid 레이아웃을 사용합니다.
          grid-cols-1: 기본(모바일)에서는 1열로 표시합니다.
          sm:grid-cols-2: small 스크린 이상(태블릿)에서는 2열로 표시합니다.
          lg:grid-cols-3: large 스크린 이상(데스크톱)에서는 3열로 표시합니다.
          gap-8: 그리드 아이템(카드) 사이의 간격을 줍니다.
          이것이 Tailwind CSS를 사용한 반응형 웹 디자인의 핵심입니다.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
