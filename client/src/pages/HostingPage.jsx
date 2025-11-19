// client/src/pages/HostingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';

const amenitiesList = ['샤워', '주방', '에어컨', '난방', 'TV', '오션뷰', '테라스', '바베큐 그릴', '펫 전용 침대'];

/**
 * @brief 호스트가 되어 자신의 카라반을 등록하는 페이지
 */
export default function HostingPage() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 1. 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    dailyRate: 50000,
    location: '',
  });
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. 비로그인 및 권한 체크 로직
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
      } else if (!user.isHost) {
        alert('호스트만 접근할 수 있는 페이지입니다.');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  // 3. 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. 편의시설 체크박스 변경 핸들러
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAmenities(prev => [...prev, value]);
    } else {
      setAmenities(prev => prev.filter(item => item !== value));
    }
  };

  // 5. 이미지 파일 변경 핸들러 및 미리보기 생성
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      alert('사진은 최대 5장까지 업로드할 수 있습니다.');
      return;
    }
    setPhotos(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = (indexToDelete) => {
    // URL.revokeObjectURL을 호출하여 메모리 누수를 방지합니다.
    URL.revokeObjectURL(previews[indexToDelete]);

    setPhotos(prev => prev.filter((_, index) => index !== indexToDelete));
    setPreviews(prev => prev.filter((_, index) => index !== indexToDelete));
  };


  // 6. 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('description', formData.description);
    submissionData.append('capacity', formData.capacity);
    submissionData.append('dailyRate', formData.dailyRate);
    submissionData.append('location', formData.location);
    amenities.forEach(amenity => submissionData.append('amenities', amenity));
    photos.forEach(photo => submissionData.append('photos', photo));

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans`, submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      alert('카라반이 성공적으로 등록되었습니다!');
      navigate(`/caravans/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  // 7. UI 렌더링
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">당신의 카라반을 등록하세요</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">기본 정보</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">카라반 이름</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">위치</label>
              <input type="text" name="location" id="location" required value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">최대 수용 인원</label>
                <input type="number" name="capacity" id="capacity" min="1" required value={formData.capacity} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700">1박 가격 (원)</label>
                <input type="number" name="dailyRate" id="dailyRate" min="10000" step="1000" required value={formData.dailyRate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
            </div>
          </div>

          {/* 사진 업로드 섹션 */}
          <div>
            <h2 className="text-xl font-semibold">사진 등록</h2>
            <div className="mt-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={preview} alt="미리보기" className="w-full h-full object-cover rounded-md"/>
                    <button 
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button type="button" onClick={() => fileInputRef.current.click()} className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400 hover:border-indigo-500 hover:text-indigo-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
                  </button>
                )}
              </div>
              <input type="file" name="photos" multiple accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>
            </div>
          </div>

          {/* 편의시설 섹션 */}
          <div>
            <h2 className="text-xl font-semibold">편의시설</h2>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {amenitiesList.map(item => (
                <label key={item} className="flex items-center space-x-3">
                  <input type="checkbox" value={item} onChange={handleAmenityChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                  <span className="text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 상세 설명 섹션 */}
          <div>
            <label htmlFor="description" className="block text-xl font-semibold text-gray-900">상세 설명</label>
            <textarea name="description" id="description" rows="6" required value={formData.description} onChange={handleChange} className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* 제출 버튼 */}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {loading ? '등록 중...' : '내 카라반 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
