// client/src/pages/HostingPage.jsx
import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import GuestRatingForm from '../components/GuestRatingForm';

export default function HostingPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingGuestId, setRatingGuestId] = useState(null); // For toggling the rating form

  const fetchHostReservations = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/host`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.isHost) {
      fetchHostReservations();
    }
  }, [user, token, authLoading]);
  
  const handleReservationStatus = async (reservationId, status) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/${reservationId}/${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Reservation has been ${status}.`);
      fetchHostReservations(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status} reservation.`);
    }
  };

  const handleRatingSubmit = () => {
    setRatingGuestId(null); // Close the form
    fetchHostReservations(); // Refresh data
    alert('Guest has been rated successfully.');
  };

  if (loading || authLoading) {
    return <Layout><div className="text-center py-10">Loading...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-10 text-red-500">Error: {error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">호스팅 예약 관리</h1>
        {reservations.length === 0 ? (
          <p>아직 받은 예약이 없습니다.</p>
        ) : (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카라반 / 게스트</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <Fragment key={reservation._id}>
                    <tr>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reservation.caravan?.name}</div>
                        <div className="text-sm text-gray-500">{reservation.guest?.displayName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reservation.status === 'approved' || reservation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        {reservation.status === 'pending' && (
                          <>
                            <button onClick={() => handleReservationStatus(reservation._id, 'approve')} className="text-indigo-600 hover:text-indigo-900">승인</button>
                            <button onClick={() => handleReservationStatus(reservation._id, 'reject')} className="ml-4 text-red-600 hover:text-red-900">거절</button>
                          </>
                        )}
                        {reservation.status === 'completed' && !reservation.guestRatedByHost && (
                          <button onClick={() => setRatingGuestId(ratingGuestId === reservation._id ? null : reservation._id)} className="text-blue-600 hover:text-blue-900">게스트 평가하기</button>
                        )}
                      </td>
                    </tr>
                    {ratingGuestId === reservation._id && (
                      <tr>
                        <td colSpan="4">
                          <GuestRatingForm
                            reservationId={reservation._id}
                            onRatingSubmit={handleRatingSubmit}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
