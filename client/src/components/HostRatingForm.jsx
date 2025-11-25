// client/src/components/HostRatingForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function HostRatingForm({ reservationId, onRatingSubmit }) {
  const [rating, setRating] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/ratings/host`,
        { reservationId, rating },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      onRatingSubmit();
    } catch (err) {
      console.error('Host rating submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = {
    1: '1점: 매우 신뢰하지 못함',
    2: '2점: 신뢰하지 못함',
    3: '3점: 보통',
    4: '4점: 신뢰함',
    5: '5점: 매우 신뢰함',
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-2">호스트 신뢰도 평가</h3>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      <div className="mb-4">
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
          평점 선택
        </label>
        <select
          id="rating"
          name="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {Object.entries(ratingDescriptions).map(([score, description]) => (
            <option key={score} value={score}>
              {description}
            </option>
          ))}
        </select>
      </div>
      <div className="text-right">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isSubmitting ? '제출 중...' : '평가 제출'}
        </button>
      </div>
    </form>
  );
}
