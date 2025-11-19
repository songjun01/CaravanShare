// client/src/components/CaravanCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // react-router-dom에서 Link를 임포트합니다.

/**
 * @brief 개별 카라반 정보를 표시하는 재사용 가능한 카드 컴포넌트
 * @param {object} caravan - 카라반의 상세 정보 (name, dailyRate, photos, location, _id)
 */
export default function CaravanCard({ caravan }) {
    // 1박 가격을 원화(KRW) 형식으로 포맷팅하는 함수
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    };

    // caravan.photos가 배열이고 비어있지 않은지 확인하여 이미지 URL을 결정합니다.
    const imageUrl = caravan.photos && caravan.photos.length > 0 
        ? caravan.photos[0] 
        : 'https://via.placeholder.com/400x300?text=CaravanShare';

    return (
        // 카드 전체를 Link 컴포넌트로 감싸서 클릭 시 상세 페이지로 이동하도록 합니다.
        <Link to={`/caravans/${caravan._id}`} className="block">
            <div className="bg-white overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl h-full">
                {/* 카라반 이미지 */}
                <div className="h-56 w-full overflow-hidden">
                    <img 
                        className="w-full h-full object-cover" // 이미지가 컨테이너에 꽉 차도록
                        src={imageUrl} // 이미지가 없으면 placeholder 표시
                        alt={`${caravan.name} 이미지`} 
                    />
                </div>

                {/* 카라반 정보 섹션 */}
                <div className="p-4">
                    {/* 위치 정보 */}
                    <p className="text-sm text-gray-500 mb-1">{caravan.location || '위치 정보 없음'}</p>
                    
                    {/* 카라반 이름 */}
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {caravan.name || '이름 정보 없음'}
                    </h3>

                    {/* 1박 가격 */}
                    <div className="mt-4">
                        <span className="text-xl font-bold text-gray-900">
                            {formatPrice(caravan.dailyRate || 0)}
                        </span>
                        <span className="text-gray-600"> / 박</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
