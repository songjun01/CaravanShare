// client/src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

/**
 * @brief 헤더 컴포넌트
 * @description
 *   - 웹사이트의 최상단에 위치하며, 로고, 네비게이션 링크 등을 포함하는 공통 컴포넌트입니다.
 *   - useAuth 훅을 사용하여 로그인 상태에 따라 동적으로 UI를 변경합니다.
 *   - 로그인 시: 프로필 드롭다운 메뉴 표시
 *   - 로그아웃 시: 로그인/회원가입 버튼 표시
 */
const Header = () => {
  // AuthContext로부터 user 객체를 가져와 로그인 상태를 확인합니다.
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-5 flex justify-between items-center">
        {/* 로고 */}
        <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-500 transition-colors">
          CaravanShare
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center space-x-6">
          <Link to="/caravans" className="text-gray-600 hover:text-indigo-500 transition-colors">카라반 찾기</Link>
          
          {/* '호스트 되기' 또는 '카라반 등록하기' 버튼 */}
          {user && user.isHost && (
            <Link to="/hosting" className="text-gray-600 hover:text-indigo-500 transition-colors">
              카라반 등록하기
            </Link>
          )}
          {!user && ( // 로그인하지 않은 경우에만 '호스트 되기' 버튼 표시
            <Link to="/hosting" className="text-gray-600 hover:text-indigo-500 transition-colors">
              호스트 되기
            </Link>
          )}
          
          {/* '내 카라반' 버튼: 로그인한 사용자에게만 표시 */}
          {user && (
            <Link to="/my-caravans" className="text-gray-600 hover:text-indigo-500 transition-colors">
              내 카라반
            </Link>
          )}

          {/* user 객체의 존재 여부로 로그인 상태를 판별하여 조건부 렌더링 */}
          {user ? (
            // 로그인 상태일 때: ProfileDropdown 컴포넌트를 렌더링합니다.
            <ProfileDropdown />
          ) : (
            // 로그아웃 상태일 때: 로그인, 회원가입 버튼을 렌더링합니다.
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-500 transition-colors">로그인</Link>
              <Link to="/signup" className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
