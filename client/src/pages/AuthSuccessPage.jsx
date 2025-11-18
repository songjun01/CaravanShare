// client/src/pages/AuthSuccessPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth 훅 임포트

export default function AuthSuccessPage() {
    const navigate = useNavigate();
    const { login } = useAuth(); // AuthContext에서 login 함수를 가져옵니다.

    useEffect(() => {
        // 1. URL의 쿼리 파라미터에서 'token'을 추출합니다.
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            // 2. 토큰이 존재하면 localStorage에 직접 저장하는 대신,
            //    AuthContext의 login 함수를 호출하여 전역 상태를 업데이트합니다.
            login(token);
            
            // 3. 사용자 경험을 위해 잠시 후 메인 페이지로 리다이렉트합니다.
            setTimeout(() => {
                navigate('/'); // 메인 페이지로 이동
            }, 500); // 0.5초 후 이동
        } else {
            // 4. 토큰이 없으면 로그인 페이지로 리다이렉트합니다.
            console.error("인증 토큰이 없습니다.");
            navigate('/login');
        }
    }, [navigate, login]); // useEffect 의존성 배열에 login 추가

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-700">로그인 처리 중...</h1>
                <p className="text-gray-500 mt-2">잠시만 기다려주세요.</p>
            </div>
        </div>
    );
}
