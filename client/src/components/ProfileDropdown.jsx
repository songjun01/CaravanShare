// client/src/components/ProfileDropdown.jsx
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * @brief 로그인 상태일 때 헤더에 표시될 프로필 드롭다운 컴포넌트
 * @description
 *   - 사용자의 프로필 아이콘(또는 이미지)을 표시합니다.
 *   - 아이콘에 마우스를 올리면 '로그아웃' 버튼이 포함된 드롭다운 메뉴가 나타납니다.
 *   - 마우스가 잠시 벗어나도 메뉴가 바로 사라지지 않도록 setTimeout을 이용한 지연 로직을 추가했습니다.
 */
export default function ProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const timerRef = useRef(null);

    if (!user) {
        return null;
    }

    const handleMouseEnter = () => {
        clearTimeout(timerRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 200); // 200ms 지연
    };

    return (
        <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* 프로필 아이콘 버튼 */}
            <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            <div 
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
            >
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
