// client/src/components/TrustIndicator.jsx
import React from 'react';

/**
 * @brief 사용자 신뢰도 점수를 시각적으로 표시하는 컴포넌트
 * @param {number} score - 사용자의 신뢰도 점수 (0 ~ 100)
 */
export default function TrustIndicator({ score }) {
  // 점수 구간에 따른 색상 및 등급 결정
  let barColorClass = 'bg-gray-400';
  let textColorClass = 'text-gray-700';
  let levelText = '정보 없음';
  let levelDescription = '신뢰도 점수를 확인해보세요.';

  if (score >= 0 && score <= 40) {
    barColorClass = 'bg-red-500';
    textColorClass = 'text-red-700';
    levelText = '뉴비';
    levelDescription = '아직 활동이 적은 사용자입니다.';
  } else if (score > 40 && score <= 70) {
    barColorClass = 'bg-yellow-500';
    textColorClass = 'text-yellow-700';
    levelText = '일반 멤버';
    levelDescription = '꾸준히 활동하는 사용자입니다.';
  } else if (score > 70 && score <= 90) {
    barColorClass = 'bg-blue-500';
    textColorClass = 'text-blue-700';
    levelText = '신뢰 멤버';
    levelDescription = '신뢰할 수 있는 활동을 보여줍니다.';
  } else if (score > 90 && score <= 100) {
    barColorClass = 'bg-green-500';
    textColorClass = 'text-green-700';
    levelText = '슈퍼 멤버';
    levelDescription = '매우 신뢰할 수 있는 최우수 사용자입니다.';
  }

  // 게이지 바의 너비 계산
  const barWidth = `${score}%`;

  return (
    <div className="w-full relative mb-2"> {/* 최상위 div에 relative 추가 */}
      {/* 게이지 바 및 점수 텍스트 컨테이너 */}
      <div className="w-full bg-gray-200 rounded-full h-4 relative flex items-center justify-center">
        {/* 게이지 바 */}
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass} absolute left-0 top-0`}
          style={{ width: barWidth }}
        ></div>
        {/* 점수 텍스트 (게이지 바 위에 표시) */}
        <span className="relative z-10 text-xs font-bold text-white">
          {score}점
        </span>
      </div>

      {/* 등급 정보 */}
      <div className="mt-4"> {/* flex 속성 제거, mt-4 유지 */}
        <span className={`block text-sm font-semibold ${textColorClass}`}>{levelText}</span>
        <span className="block text-xs text-gray-500 mt-1">{levelDescription}</span>
      </div>
    </div>
  );
}
