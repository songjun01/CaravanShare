// client/src/components/HostProfile.jsx
import React from 'react';
import { format } from 'date-fns';

/**
 * @brief 호스트의 프로필 정보를 표시하는 컴포넌트
 * @param {Object} host - 호스트 사용자 객체 (name, profileImage, introduction, createdAt)
 */
export default function HostProfile({ host }) {
  if (!host) {
    return null; // 호스트 정보가 없으면 아무것도 렌더링하지 않음
  }

  return (
    <div className="py-8">
      {/* 헤더: 프로필 사진 및 이름 */}
      <div className="flex items-center mb-6">
        <img
          src={host.profileImage || 'https://via.placeholder.com/150'}
          alt={host.displayName}
          className="w-24 h-24 rounded-full mr-6"
        />
        <div>
          <h3 className="text-2xl font-semibold">호스트: {host.displayName}님</h3>
          <p className="text-sm text-gray-500">
            회원 가입일: {format(new Date(host.createdAt), 'yyyy년 MM월')}
          </p>
        </div>
      </div>

      {/* 호스트 소개 */}
      <div className="mb-6">
        <p className="text-gray-700 whitespace-pre-line">
          {host.introduction || '호스트가 아직 자기소개를 작성하지 않았습니다.'}
        </p>
      </div>

      {/* 호스트에게 연락하기 버튼 */}
      <button className="font-semibold py-2 px-4 border border-black rounded-lg hover:bg-gray-100 transition-colors">
        호스트에게 연락하기
      </button>
    </div>
  );
}
