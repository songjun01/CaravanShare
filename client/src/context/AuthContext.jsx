// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

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
    const [loading, setLoading] = useState(true); // 인증 로딩 상태 추가

    // 컴포넌트가 처음 마운트될 때 실행되는 로직
    useEffect(() => {
        const bootstrapAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                try {
                    const decoded = jwtDecode(storedToken);
                    if (decoded.exp * 1000 > Date.now()) {
                        setToken(storedToken);
                        // 토큰이 유효하면, 전체 사용자 프로필을 가져옵니다.
                        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`, {
                            headers: { 'Authorization': `Bearer ${storedToken}` }
                        });
                        setUser(response.data.data);
                    } else {
                        localStorage.removeItem('authToken');
                    }
                } catch (error) {
                    console.error("Auth bootstrap error:", error);
                    localStorage.removeItem('authToken');
                }
            }
            setLoading(false); // 인증 확인 완료
        };
        bootstrapAuth();
    }, []);

    // 로그인 함수
    const login = async (newToken) => {
        try {
            // JWT 토큰을 디코딩하여 사용자 정보를 추출합니다.
            jwtDecode(newToken); // Validate token structure
            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            
            // 로그인 성공 후, 전체 사용자 프로필을 가져옵니다.
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`, {
                headers: { 'Authorization': `Bearer ${newToken}` }
            });
            setUser(response.data.data);

        } catch (error) {
            console.error("Failed to login:", error);
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
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

    // 사용자 정보 업데이트 함수
    const updateUser = (newUserData) => {
        setUser(prevUser => ({ ...prevUser, ...newUserData }));
    };

    // Context Provider를 통해 value 객체를 하위 컴포넌트에 전달합니다.
    const value = {
        user,
        token,
        loading, // 로딩 상태 추가
        login,
        logout,
        updateUser,
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
