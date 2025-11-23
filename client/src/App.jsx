// client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// 페이지 컴포넌트들을 가져옵니다.
import CaravanListPage from './pages/CaravanListPage';
import LoginPage from './pages/LoginPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import SignupPage from './pages/SignupPage'; // SignupPage 임포트
import CaravanDetailPage from './pages/CaravanDetailPage'; // CaravanDetailPage 임포트
import HostingPage from './pages/HostingPage'; // HostingPage 임포트
import MyCaravansPage from './pages/MyCaravansPage'; // MyCaravansPage 임포트
import EditCaravanPage from './pages/EditCaravanPage'; // EditCaravanPage 임포트
import ProfilePage from './pages/ProfilePage'; // ProfilePage 임포트
import MyReservationsPage from './pages/MyReservationsPage';
// TODO: 나중에 홈페이지 등을 추가할 수 있습니다.
// import HomePage from './pages/HomePage'; 

/**
 * @brief 최상위 App 컴포넌트
 * @description
 *   애플리케이션의 전체적인 라우팅 구조를 정의합니다.
 *   URL 경로에 따라 적절한 페이지 컴포넌트를 렌더링하는 역할을 합니다.
 */
function App() {
  return (
    // AuthProvider가 Router를 감싸도록 하여, 앱의 모든 라우트에서
    // useAuth 훅을 통해 인증 상태(user, token, login, logout)에 접근할 수 있게 합니다.
    <AuthProvider>
      {/* <Router>는 react-router-dom을 사용하기 위해 전체 앱을 감싸는 컴포넌트입니다. */}
      <Router>
        {/* <Routes>는 여러 <Route> 컴포넌트를 감싸며, 현재 URL과 일치하는 첫 번째 <Route>를 렌더링합니다. */}
        <Routes>
          {/* 
            <Route>는 특정 경로(path)와 해당 경로에서 렌더링할 컴포넌트(element)를 정의합니다.
            - path="/": 웹사이트의 루트 경로 (예: http://localhost:5173/)
            - element={<CaravanListPage />}: 루트 경로로 접속했을 때 CaravanListPage 컴포넌트를 보여줍니다.
          */}
          <Route path="/" element={<CaravanListPage />} />
          
          {/* 카라반 목록 페이지 라우트 */}
          <Route path="/caravans" element={<CaravanListPage />} />

          {/* 카라반 상세 페이지 라우트 */}
          <Route path="/caravans/:id" element={<CaravanDetailPage />} />

          {/* 카라반 수정 페이지 라우트 */}
          <Route path="/caravans/:id/edit" element={<EditCaravanPage />} />

          {/* 호스트 되기 (카라반 등록) 페이지 라우트 */}
          <Route path="/hosting" element={<HostingPage />} />

          {/* 내 카라반 관리 페이지 라우트 */}
          <Route path="/my-caravans" element={<MyCaravansPage />} />

          {/* 내 예약 목록 페이지 라우트 */}
          <Route path="/my-reservations" element={<MyReservationsPage />} />

          {/* 내 프로필 관리 페이지 라우트 */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* 로그인 페이지 라우트 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 회원가입 페이지 라우트 (경로 일원화) */}
          <Route path="/signup" element={<SignupPage />} />

          {/* 소셜 로그인 성공 시 리다이렉트될 콜백 페이지 라우트 */}
          <Route path="/auth-success" element={<AuthSuccessPage />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
