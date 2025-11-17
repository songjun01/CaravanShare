// client/src/components/Header.jsx

import React from 'react';

/**
 * @brief 헤더 컴포넌트
 * @description
 *   웹사이트의 최상단에 위치하며, 로고, 네비게이션 링크 등을 포함하는 공통 컴포넌트입니다.
 *   Tailwind CSS를 사용하여 '깨끗하고 미니멀하며 고급스러운' 디자인 컨셉을 적용했습니다.
 */
const Header = () => {
  return (
    // <header>: 시맨틱 HTML 태그로, 페이지나 섹션의 머리말을 나타냅니다.
    // bg-white: 배경색을 흰색으로 지정합니다.
    // shadow-md: 중간 크기의 그림자 효과를 추가하여 입체감을 줍니다.
    <header className="bg-white shadow-md">
      {/* 
        container: 컨텐츠의 최대 너비를 제한하고 중앙에 정렬합니다.
        mx-auto: 좌우 마진을 자동으로 설정하여 중앙 정렬합니다.
        px-4: 좌우 패딩을 줍니다. (1rem)
        py-5: 상하 패딩을 줍니다. (1.25rem)
        flex: Flexbox 레이아웃을 사용합니다.
        justify-between: 자식 요소들 사이의 공간을 균등하게 배분하여 양 끝에 배치합니다.
        items-center: 자식 요소들을 수직 중앙에 정렬합니다.
      */}
      <div className="container mx-auto px-4 py-5 flex justify-between items-center">
        {/* 로고 */}
        {/* 
          text-2xl: 텍스트 크기를 2xl로 지정합니다. (1.5rem)
          font-bold: 폰트를 굵게 만듭니다.
          text-gray-800: 텍스트 색상을 진한 회색으로 지정합니다.
          hover:text-blue-500: 마우스를 올렸을 때 텍스트 색상을 파스텔 톤의 파란색으로 변경합니다.
          transition-colors: 색상 변경 시 부드러운 전환 효과를 줍니다.
        */}
        <a href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-500 transition-colors">
          CaravanShare
        </a>

        {/* 네비게이션 메뉴 */}
        {/* 
          space-x-6: 자식 요소들(링크) 사이의 가로 간격을 줍니다. (1.5rem)
        */}
        <nav className="space-x-6">
          {/* 
            text-gray-600: 텍스트 색상을 중간 톤의 회색으로 지정합니다.
            hover:text-indigo-500: 마우스를 올렸을 때 색상 변경
          */}
          <a href="/caravans" className="text-gray-600 hover:text-indigo-500 transition-colors">카라반 찾기</a>
          <a href="/hosting" className="text-gray-600 hover:text-indigo-500 transition-colors">호스트 되기</a>
          <a href="/login" className="text-gray-600 hover:text-indigo-500 transition-colors">로그인</a>
          {/* 
            bg-indigo-500: 배경색을 파스텔 톤 남색으로 지정합니다.
            text-white: 텍스트 색상을 흰색으로 지정합니다.
            px-4 py-2: 좌우, 상하 패딩을 줍니다.
            rounded-full: 모서리를 완전히 둥글게 만듭니다.
            hover:bg-indigo-600: 마우스를 올렸을 때 배경색을 조금 더 진하게 변경합니다.
          */}
          <a href="/signup" className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors">회원가입</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
