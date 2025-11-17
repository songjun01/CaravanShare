// client/src/components/Layout.jsx

import React from 'react';
import Header from './Header'; // 방금 만든 Header 컴포넌트를 가져옵니다.

/**
 * @brief 레이아웃 컴포넌트
 * @description
 *   모든 페이지에서 공통적으로 사용될 페이지의 전체적인 뼈대(구조)를 정의합니다.
 *   주로 헤더, 푸터, 그리고 메인 컨텐츠 영역으로 구성됩니다.
 *   `{children}`은 이 레이아웃 컴포넌트 안에 렌더링될 자식 컴포넌트(각 페이지의 실제 내용)를 의미합니다.
 * 
 * @param {React.ReactNode} children - 이 컴포넌트가 감싸게 될 자식 요소들
 */
const Layout = ({ children }) => {
  return (
    // <div className="min-h-screen ...">: 전체 레이아웃을 감싸는 최상위 div
    // min-h-screen: 요소의 최소 높이를 화면 전체 높이로 설정하여, 컨텐츠가 적어도 푸터가 바닥에 붙도록 합니다.
    // flex flex-col: 자식 요소(Header, main)를 수직으로 쌓는 Flexbox 레이아웃을 적용합니다.
    // bg-gray-50: 전체 페이지의 배경색을 매우 옅은 회색(파스텔 톤)으로 지정하여 부드러운 느낌을 줍니다.
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 공통 헤더를 렌더링합니다. */}
      <Header />

      {/* 
        <main>: 페이지의 주요 컨텐츠를 담는 시맨틱 태그입니다.
        flex-grow: Header를 제외한 나머지 수직 공간을 모두 차지하도록 만듭니다.
        container mx-auto: 컨텐츠 영역의 너비를 제한하고 중앙에 정렬합니다.
        p-4 sm:p-6 lg:p-8: 화면 크기에 따라 반응형으로 패딩을 조절합니다. (모바일 -> 태블릿 -> 데스크톱)
      */}
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {/* 
          이 부분에 각 페이지의 실제 컨텐츠가 렌더링됩니다.
          예를 들어, App.js에서 <Layout><CaravanListPage /></Layout> 와 같이 사용하면,
          {children} 위치에 CaravanListPage 컴포넌트가 들어오게 됩니다.
        */}
        {children}
      </main>

      {/* 
        TODO: 나중에 웹사이트의 푸터(Footer)를 여기에 추가할 수 있습니다.
        <footer className="bg-white shadow-t text-center p-4">
          © 2025 CaravanShare. All rights reserved.
        </footer> 
      */}
    </div>
  );
};

export default Layout;
