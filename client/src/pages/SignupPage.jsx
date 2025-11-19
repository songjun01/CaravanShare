// client/src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// 각 소셜 로그인 버튼에 대한 스타일과 정보를 담은 객체
const socialLogins = [
    {
        name: 'Google',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google`,
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
        ),
    },
    {
        name: 'Naver',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/naver`,
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.273 12.845H12.433V24H7.729V12.845H3.889V5.42H7.729V0H12.433V5.42H16.273V12.845Z" fill="white"/>
            </svg>
        ),
    },
    {
        name: 'Kakao',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/kakao`,
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#FEE500"/>
                <path d="M7.18005 13.59C6.21005 13.59 5.42005 12.81 5.42005 11.83C5.42005 10.85 6.21005 10.07 7.18005 10.07C8.15005 10.07 8.94005 10.85 8.94005 11.83C8.94005 12.81 8.15005 13.59 7.18005 13.59ZM16.82 13.59C15.85 13.59 15.06 12.81 15.06 11.83C15.06 10.85 15.85 10.07 16.82 10.07C17.79 10.07 18.58 10.85 18.58 11.83C18.58 12.81 17.79 13.59 16.82 13.59Z" fill="#191919"/>
            </svg>
        ),
    },
];

export default function SignupPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [userType, setUserType] = useState('guest'); // 'guest' 또는 'host'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (formData.password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`, {
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password,
                isHost: userType === 'host', // 선택된 userType에 따라 isHost 값을 설정
            });
            
            // 회원가입 성공 시, 응답으로 받은 토큰을 사용하여 로그인 처리
            const { token } = response.data;
            login(token);
            
            // 메인 페이지로 리다이렉트
            navigate('/');

        } catch (err) {
            // 서버에서 보낸 에러 메시지를 상태에 저장
            setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="absolute top-8 left-8">
                <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="ml-2">메인으로</span>
                </Link>
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    CaravanShare 계정 생성
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        로그인
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* 가입 유형 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">가입 유형</label>
                            <fieldset className="mt-2">
                                <legend className="sr-only">가입 유형 선택</legend>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`relative flex items-center justify-center p-3 border rounded-md cursor-pointer ${userType === 'guest' ? 'bg-indigo-50 border-indigo-200 z-10' : 'border-gray-200'}`}>
                                        <input type="radio" name="userType" value="guest" checked={userType === 'guest'} onChange={(e) => setUserType(e.target.value)} className="sr-only" />
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900">게스트</span>
                                            <p className="text-gray-500 text-xs">카라반을 예약하고 싶어요</p>
                                        </div>
                                    </label>
                                    <label className={`relative flex items-center justify-center p-3 border rounded-md cursor-pointer ${userType === 'host' ? 'bg-indigo-50 border-indigo-200 z-10' : 'border-gray-200'}`}>
                                        <input type="radio" name="userType" value="host" checked={userType === 'host'} onChange={(e) => setUserType(e.target.value)} className="sr-only" />
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900">호스트</span>
                                            <p className="text-gray-500 text-xs">카라반을 등록할래요</p>
                                        </div>
                                    </label>
                                </div>
                            </fieldset>
                        </div>

                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                                이름
                            </label>
                            <div className="mt-1">
                                <input
                                    id="displayName"
                                    name="displayName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                이메일 주소
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                비밀번호
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" c lassName="block text-sm font-medium text-gray-700">
                                비밀번호 확인
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? '가입하는 중...' : '계정 생성'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">또는 소셜 계정으로 가입</span></div>
                        </div>
                        <p className="mt-2 text-center text-xs text-gray-500">
                            소셜 로그인은 게스트로만 가입됩니다. <br />
                            호스트로 가입하시려면 이메일로 가입해주세요.
                        </p>
                        <div className="mt-6 space-y-3">
                            {socialLogins.map((social) => (
                                <a key={social.name} href={social.url} className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium transition-colors
                                    ${social.name === 'Naver' ? 'bg-[#03C75A] text-white hover:bg-[#03b253]' : ''}
                                    ${social.name === 'Kakao' ? 'bg-[#FEE500] text-gray-800 hover:bg-[#fddc00]' : ''}
                                    ${social.name === 'Google' ? 'bg-white text-gray-500 hover:bg-gray-50' : ''}
                                `}>
                                    {social.icon}
                                    <span className="ml-3">{social.name}로 가입</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
