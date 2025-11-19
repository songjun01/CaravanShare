// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import TrustIndicator from '../components/TrustIndicator'; // TrustIndicator 컴포넌트 임포트

/**
 * @brief '내 프로필' 페이지
 * @description 로그인한 사용자가 자신의 프로필 정보를 확인하고 수정하는 페이지입니다.
 */
export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [contact, setContact] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. 데이터 로딩
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        setError('로그인이 필요합니다.');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setProfile(response.data.data);
        setContact(response.data.data.contact || '');
        setIntroduction(response.data.data.introduction || '');
      } catch (err) {
        setError('프로필 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // 2. 정보 저장 핸들러 (자기소개만 수정)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`,
        { introduction }, // 자기소개만 보냅니다.
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setProfile(response.data.data);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      alert('프로필 업데이트에 실패했습니다.');
    }
  };

  // 3. 연락처 인증 및 저장 핸들러 (최초 1회만)
  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!contact) {
      alert('연락처를 입력해주세요.');
      return;
    }
    if (!window.confirm('입력하신 연락처로 인증을 진행하고 저장하시겠습니까? (최초 1회만 가능)')) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me`,
        { contact }, // 연락처만 보냅니다.
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setProfile(response.data.data); // 업데이트된 프로필 정보로 상태 변경
      alert('연락처가 성공적으로 인증 및 저장되었습니다.');
    } catch (err) {
      alert(err.response?.data?.message || '연락처 인증 및 저장에 실패했습니다.');
    }
  };

  // 4. 신원 인증 핸들러
  const handleVerify = async () => {
    if (!window.confirm('신원 인증을 진행하시겠습니까? (모의 인증)')) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/verify`,
        {}, // body는 비어있음
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setProfile(response.data.data); // 업데이트된 프로필 정보로 상태 변경
      alert('신원 인증이 완료되었습니다.');
    } catch (err) {
      alert('신원 인증 처리 중 오류가 발생했습니다.');
    }
  };

  // 5. 렌더링 로직
  if (loading) return <Layout><div className="text-center py-10">로딩 중...</div></Layout>;
  if (error) return <Layout><div className="text-center py-10 text-red-500">{error}</div></Layout>;
  if (!profile) return <Layout><div className="text-center py-10">프로필 정보가 없습니다.</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">프로필 관리</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* 상단 프로필 섹션 */}
          <div className="flex items-center mb-6">
            <img 
              className="h-20 w-20 rounded-full object-cover"
              src={profile.profileImage} 
              alt="프로필 사진"
            />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800">{profile.displayName}</h2>
              <p className="text-yellow-500 font-semibold">★ {profile.rating.toFixed(1)}</p>
              
              {/* 신뢰도 점수 표시 */}
              <div className="mt-4 mb-4"> {/* mb-4 추가 */}
                <TrustIndicator score={profile.trustScore} />
                <p className="text-xs text-gray-500 mt-4">
                  신뢰도 점수를 높이려면: <br/>
                  - 신원 인증을 완료하세요 (+20점) <br/>
                  - 좋은 리뷰를 많이 받으세요 <br/>
                  - 활발하게 활동하세요
                </p>
              </div>
            </div>
          </div>

          {/* 폼 섹션 */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* 이메일 (수정 불가) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
              <input type="email" id="email" value={profile.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
            </div>

            {/* 연락처 (수정 가능 / 불가) */}
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">연락처</label>
              <input 
                type="text" 
                id="contact" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                placeholder="연락처를 입력하세요" 
                disabled={!!profile.contact} // profile.contact가 있으면 비활성화
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm ${profile.contact ? 'bg-gray-100' : 'focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'}`}
              />
              {profile.contact && (
                <p className="mt-1 text-sm text-gray-500">연락처는 최초 1회 인증 후 수정할 수 없습니다.</p>
              )}
            </div>

            {/* 자기소개 (수정 가능) */}
            <div>
              <label htmlFor="introduction" className="block text-sm font-medium text-gray-700">자기소개</label>
              <textarea id="introduction" value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows="4" placeholder="자신을 소개해주세요" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>

            {/* 신원 확인 섹션 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">신원 확인</h3>
              {profile.isVerified ? (
                <div className="flex items-center text-blue-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>신원 인증됨</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">안전한 거래를 위해 본인 인증이 필요합니다.</p>
                  <button type="button" onClick={handleVerify} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    인증하기
                  </button>
                </div>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="text-right">
              {!profile.contact && ( // 연락처가 비어있을 때만 '연락처 인증 및 저장' 버튼 표시
                <button type="button" onClick={handleSaveContact} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 mr-2">
                  연락처 인증 및 저장
                </button>
              )}
              <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                자기소개 저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
