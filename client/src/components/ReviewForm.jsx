// client/src/components/ReviewForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ReviewForm({ caravanId, reservationId, onReviewSubmit }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') {
      setError('Please write a review.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reviews`,
        {
          caravanId,
          reservationId,
          rating,
          content,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      onReviewSubmit(); // Notify parent component
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-2">리뷰 작성</h3>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="mb-4">
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
          평점
        </label>
        <select
          id="rating"
          name="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {[5, 4, 3, 2, 1].map((score) => (
            <option key={score} value={score}>
              {'★'.repeat(score)}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          리뷰 내용
        </label>
        <textarea
          id="content"
          name="content"
          rows="3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          placeholder="리뷰를 작성해주세요."
        ></textarea>
      </div>
      <div className="text-right">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isSubmitting ? '제출 중...' : '리뷰 제출'}
        </button>
      </div>
    </form>
  );
}
