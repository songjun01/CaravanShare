// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Context 생성
// AuthContext는 앱의 다른 컴포넌트들이 인증 상태에 접근할 수 있도록 하는 통로입니다.
const AuthContext = createContext(null);

/**
 * @brief AuthProvider 컴포넌트
 * @description
 *   - 앱의 전역적인 인증 상태(로그인한 사용자 정보, 토큰)를 관리합니다.
 *   - 로그인, 로그아웃 함수를 제공합니다.
 *   - 앱이 처음 로드될 때 localStorage에서 토큰을 확인하여 로그인 상태를 복원합니다.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // 컴포넌트가 처음 마운트될 때 실행되는 로직
    useEffect(() => {
        // localStorage에서 토큰을 가져옵니다.
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                // 토큰이 유효한지 디코딩하여 확인하고, 필요한 정보를 추출합니다.
                const { id, displayName, email, isHost, exp } = jwtDecode(storedToken);
                
                // 토큰의 만료 시간을 확인합니다.
                if (exp * 1000 > Date.now()) {
                    // 토큰이 유효하면 상태를 설정합니다.
                    setToken(storedToken);
                    setUser({ id, displayName, email, isHost });
                } else {
                    // 토큰이 만료되었으면 localStorage에서 제거합니다.
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                // 디코딩에 실패하면 (유효하지 않은 토큰), 토큰을 제거합니다.
                console.error("Invalid token:", error);
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    // 로그인 함수
    const login = (newToken) => {
        try {
            // JWT 토큰을 디코딩하여 사용자 정보를 추출합니다.
            const { id, displayName, email, isHost } = jwtDecode(newToken);
            // localStorage에 토큰을 저장하여 페이지를 새로고침해도 로그인이 유지되도록 합니다.
            localStorage.setItem('authToken', newToken);
            // 상태를 업데이트합니다.
            setToken(newToken);
            setUser({ id, displayName, email, isHost });
        } catch (error) {
            console.error("Failed to decode token on login:", error);
        }
    };

    // 로그아웃 함수
    const logout = () => {
        // localStorage에서 토큰을 제거합니다.
        localStorage.removeItem('authToken');
        // 상태를 초기화합니다.
        setToken(null);
        setUser(null);
    };

    // Context Provider를 통해 value 객체를 하위 컴포넌트에 전달합니다.
    const value = {
        user,
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * @brief useAuth 커스텀 훅
 * @description
 *   - 컴포넌트에서 AuthContext의 값(user, token, login, logout)에 쉽게 접근할 수 있도록 합니다.
 *   - 매번 useContext(AuthContext)를 쓰는 번거로움을 줄여줍니다.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
