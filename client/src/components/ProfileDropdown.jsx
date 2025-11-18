// client/src/components/ProfileDropdown.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * @brief 로그인 상태일 때 헤더에 표시될 프로필 드롭다운 컴포넌트
 * @description
 *   - 사용자의 프로필 아이콘(또는 이미지)을 표시합니다.
 *   - 아이콘에 마우스를 올리면 '로그아웃' 버튼이 포함된 드롭다운 메뉴가 나타납니다.
 *   - Tailwind CSS의 group-hover 유틸리티를 사용하여 드롭다운 효과를 구현합니다.
 */
export default function ProfileDropdown() {
    // useAuth 훅을 사용하여 사용자 정보와 로그아웃 함수를 가져옵니다.
    const { user, logout } = useAuth();

    // user 객체가 없으면 아무것도 렌더링하지 않습니다. (방어 코드)
    if (!user) {
        return null;
    }

    return (
        // 'group' 클래스를 사용하여 하위 요소에서 group-hover를 감지할 수 있도록 합니다.
        // relative 클래스는 드롭다운 메뉴의 위치 기준점이 됩니다.
        <div className="relative group">
            {/* 프로필 아이콘 버튼 */}
            <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                {/* TODO: user.profileImage가 있다면 <img> 태그로 교체할 수 있습니다. */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {/* 기본적으로 숨겨져 있고(hidden), 부모('group')에 호버 시 나타납니다(group-hover:block). */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link
                    to="#"
                    onClick={logout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                    로그아웃
                </Link>
            </div>
        </div>
    );
}
