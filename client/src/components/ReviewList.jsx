// client/src/components/ReviewList.jsx
import React from 'react';
import { format } from 'date-fns';

/**
 * @brief 리뷰 목록을 표시하는 컴포넌트
 * @param {Array} reviews - 표시할 리뷰 객체의 배열
 */
export default function ReviewList({ reviews }) {
  // 평균 평점을 계산하는 함수
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(2); // 소수점 둘째 자리까지 표시
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="py-8">
      {/* 헤더: 평점 및 후기 개수 */}
      <h3 className="text-2xl font-semibold mb-6">
        <span className="flex items-center">
          <svg className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.24 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" /></svg>
          {averageRating} · 후기 {reviews.length}개
        </span>
      </h3>

      {/* 리뷰 카드 그리드 */}
      {reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {reviews.map((review) => (
            <div key={review._id}>
              {/* 리뷰 작성자 정보 */}
              <div className="flex items-center mb-2">
                <img
                  src={review.reviewer?.profileImage || 'https://via.placeholder.com/150'}
                  alt={review.reviewer?.displayName}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold">{review.reviewer?.displayName || '익명'}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(review.createdAt), 'yyyy년 MM월 dd일')}
                  </p>
                </div>
              </div>
              {/* 리뷰 내용 */}
              <p className="text-gray-700 line-clamp-3">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
      )}
    </div>
  );
}
