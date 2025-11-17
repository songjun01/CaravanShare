// client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트들을 가져옵니다.
import CaravanListPage from './pages/CaravanListPage';
// TODO: 나중에 홈페이지, 로그인 페이지 등을 추가할 수 있습니다.
// import HomePage from './pages/HomePage'; 

/**
 * @brief 최상위 App 컴포넌트
 * @description
 *   애플리케이션의 전체적인 라우팅 구조를 정의합니다.
 *   URL 경로에 따라 적절한 페이지 컴포넌트를 렌더링하는 역할을 합니다.
 */
function App() {
  return (
    // <Router>는 react-router-dom을 사용하기 위해 전체 앱을 감싸는 컴포넌트입니다.
    <Router>
      {/* <Routes>는 여러 <Route> 컴포넌트를 감싸며, 현재 URL과 일치하는 첫 번째 <Route>를 렌더링합니다. */}
      <Routes>
        {/* 
          <Route>는 특정 경로(path)와 해당 경로에서 렌더링할 컴포넌트(element)를 정의합니다.
          - path="/": 웹사이트의 루트 경로 (예: http://localhost:5173/)
          - element={<CaravanListPage />}: 루트 경로로 접속했을 때 CaravanListPage 컴포넌트를 보여줍니다.
        */}
        <Route path="/" element={<CaravanListPage />} />
        
        {/* 
          TODO: 나중에 다른 페이지 라우트를 여기에 추가할 수 있습니다.
          <Route path="/caravans" element={<CaravanListPage />} />
          <Route path="/login" element={<LoginPage />} /> 
        */}
      </Routes>
    </Router>
  );
}

export default App;
