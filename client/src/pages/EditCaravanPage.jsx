import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';

const amenitiesList = ['샤워', '주방', '에어컨', '난방', 'TV', '오션뷰', '테라스', '바베큐 그릴', '펫 전용 침대'];

// 표시할 카라반 상태 목록 (한글)
const statusList = ['사용가능', '예약됨', '정비중'];

/**
 * @brief 호스트가 자신의 카라반 정보를 수정하는 페이지
 */
export default function EditCaravanPage() {
  const { id } = useParams(); // URL에서 카라반 ID를 가져옵니다.
  const isCreateMode = !id; // ID가 없으면 생성 모드
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // 파일 입력을 위한 ref 생성
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    dailyRate: 50000,
    location: '',
    status: '사용가능', // status 필드 (기본값 '사용가능')
  });
  const [amenities, setAmenities] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]); // 기존 사진 URL 배열
  const [newPhotos, setNewPhotos] = useState([]); // 새로 추가할 사진 파일 배열
  const [newPreviews, setNewPreviews] = useState([]); // 새로 추가할 사진 미리보기 URL 배열
  const [deletedPhotos, setDeletedPhotos] = useState([]); // 삭제할 기존 사진 URL 배열
  const [loading, setLoading] = useState(false); // 생성 모드에서는 초기 로딩이 없음
  const [error, setError] = useState('');

  // 1. 데이터 로딩 및 권한 확인 (편집 모드에서만)
  useEffect(() => {
    // 생성 모드이거나 인증 로딩 중이면 아무것도 하지 않음
    if (isCreateMode || authLoading) {
      setLoading(false); // 생성 모드일 경우 로딩 상태 해제
      return;
    }

    const fetchCaravanData = async () => {
      setLoading(true); // 편집 모드일 경우 데이터 로딩 시작
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans/${id}`);
        const caravanData = response.data.data.caravan;

        // 권한 확인: 로그인한 사용자가 호스트인지 확인 (편집 모드에서만)
        if (user?._id !== caravanData.host._id) {
          alert('카라반을 수정할 권한이 없습니다.');
          navigate('/my-caravans');
          return;
        }

        // 상태 초기화
        setFormData({
          name: caravanData.name,
          description: caravanData.description,
          capacity: caravanData.capacity,
          dailyRate: caravanData.dailyRate,
          location: caravanData.location,
          status: caravanData.status || '사용가능', // DB에서 가져온 status 값으로 설정
        });
        setAmenities(caravanData.amenities);
        setExistingPhotos(caravanData.photos); // 기존 사진 URL 상태 설정
        
      } catch (err) {
        setError('카라반 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) { // user가 로드된 후에만 데이터 가져오기
      fetchCaravanData();
    }
  }, [id, user, authLoading, navigate, isCreateMode]);

  // 2. 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. 편의시설 체크박스 변경 핸들러
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setAmenities(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
  };

  // 4. 새로 추가할 이미지 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingPhotos.length + newPhotos.length + files.length > 5) {
      alert('사진은 최대 5장까지 업로드할 수 있습니다.');
      return;
    }
    setNewPhotos(prev => [...prev, ...files]);

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setNewPreviews(prev => [...prev, ...newPreviewUrls]);
  };

  // 5. 새로 추가한 사진 삭제 핸들러
  const handleDeleteNewPhoto = (indexToDelete) => {
    URL.revokeObjectURL(newPreviews[indexToDelete]);
    setNewPhotos(prev => prev.filter((_, index) => index !== indexToDelete));
    setNewPreviews(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  // 6. 기존 사진 삭제 핸들러
  const handleDeleteExistingPhoto = (photoUrl) => {
    setExistingPhotos(prev => prev.filter(p => p !== photoUrl));
    setDeletedPhotos(prev => [...prev, photoUrl]);
  };

  // 7. 폼 제출 핸들러 (수정/생성 로직)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submissionData = new FormData();
      
      // 1. 텍스트 데이터 추가
      submissionData.append('name', formData.name);
      submissionData.append('description', formData.description);
      submissionData.append('capacity', formData.capacity);
      submissionData.append('dailyRate', formData.dailyRate);
      submissionData.append('location', formData.location);
      submissionData.append('status', formData.status); // status 추가
      
      // 2. 배열 데이터 추가
      amenities.forEach(amenity => submissionData.append('amenities', amenity));
      deletedPhotos.forEach(photoUrl => submissionData.append('deletedPhotos', photoUrl));
      
      // 3. 새로 추가된 파일 데이터 추가
      newPhotos.forEach(photoFile => submissionData.append('newPhotos', photoFile));

      let response;
      if (isCreateMode) {
        // 생성 모드: POST 요청
        response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans`, submissionData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // 편집 모드: PUT 요청
        response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans/${id}`, submissionData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      alert(isCreateMode ? '카라반이 성공적으로 등록되었습니다.' : '카라반 정보가 성공적으로 수정되었습니다.');
      navigate('/my-caravans'); // 내 카라반 목록 페이지로 이동

    } catch (err) {
      setError(err.response?.data?.message || (isCreateMode ? '카라반 등록 중 오류가 발생했습니다.' : '정보 수정 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  // 8. 카라반 삭제 핸들러
  const handleDelete = async () => {
    // 사용자에게 삭제를 재확인 받습니다.
    if (window.confirm('정말로 이 카라반을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setLoading(true);
      setError('');
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/v1/caravans/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        alert('카라반이 성공적으로 삭제되었습니다.');
        navigate('/my-caravans'); // 내 카라반 목록 페이지로 이동
      } catch (err) {
        setError(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
        setLoading(false); // 에러 발생 시 로딩 상태 해제
      }
    }
  };

  // 로딩 및 에러 처리
  if (authLoading || loading) {
    return <Layout><div className="text-center py-10">로딩 중...</div></Layout>;
  }
  if (error) {
    return <Layout><div className="text-center py-10 text-red-500">{error}</div></Layout>;
  }

  // 9. UI 렌더링
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{isCreateMode ? '새 카라반 등록' : '카라반 정보 수정'}</h1>
        
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
             {/* 카라반 상태 섹션 */}
             <div>
              <h3 className="text-sm font-medium text-gray-700">카라반 상태</h3>
              <div className="mt-2 flex items-center space-x-6">
                {statusList.map((status) => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 사진 업로드 섹션 */}
          <div>
            <h2 className="text-xl font-semibold">{isCreateMode ? '사진 등록' : '사진 수정'}</h2>
            <p className="text-sm text-gray-500 mt-1">사진은 최대 5장까지 등록할 수 있습니다.</p>
            <div className="mt-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {/* 기존 사진 렌더링 (편집 모드에서만) */}
                {!isCreateMode && existingPhotos.map((photoUrl) => (
                  <div key={photoUrl} className="relative aspect-square">
                    <img src={photoUrl} alt="기존 카라반 사진" className="w-full h-full object-cover rounded-md"/>
                    <button 
                      type="button"
                      onClick={() => handleDeleteExistingPhoto(photoUrl)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75"
                      aria-label="기존 사진 삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {/* 새로 추가된 사진 미리보기 렌더링 */}
                {newPreviews.map((preview, index) => (
                  <div key={preview} className="relative aspect-square">
                    <img src={preview} alt="새 사진 미리보기" className="w-full h-full object-cover rounded-md"/>
                    <button 
                      type="button"
                      onClick={() => handleDeleteNewPhoto(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75"
                      aria-label="새 사진 삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {/* 사진 추가 버튼 */}
                {(existingPhotos.length + newPreviews.length) < 5 && (
                  <button type="button" onClick={() => fileInputRef.current.click()} className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400 hover:border-indigo-500 hover:text-indigo-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
                  </button>
                )}
              </div>
              <input type="file" name="newPhotos" multiple accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>
            </div>
          </div>

          {/* 편의시설 섹션 */}
          <div>
            <h2 className="text-xl font-semibold">편의시설</h2>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {amenitiesList.map(item => (
                <label key={item} className="flex items-center space-x-3">
                  <input type="checkbox" value={item} checked={amenities.includes(item)} onChange={handleAmenityChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
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
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* 버튼 섹션 */}
          <div className="pt-6 space-y-4">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {loading ? (isCreateMode ? '등록 중...' : '수정 중...') : (isCreateMode ? '카라반 등록하기' : '정보 수정하기')}
            </button>
            {!isCreateMode && (
              <button type="button" disabled={loading} onClick={handleDelete} className="w-full flex justify-center py-3 px-4 border border-red-500 text-red-500 rounded-md shadow-sm text-lg font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                이 카라반 삭제하기
              </button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}
