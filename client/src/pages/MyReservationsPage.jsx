// client/src/pages/MyReservationsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchReservations = async () => {
    if (!token) {
      setLoading(false);
      setError('Please log in to see your reservations.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/my-reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setReservations(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response ? `${err.response.status} - ${err.response.data.message}` : err.message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [token]);

  const handlePayment = async (reservationId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/payments`,
        { reservationId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      alert('Payment successful!');
      // Refresh the reservations list
      fetchReservations();
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.response?.data?.message || 'Payment failed.');
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">예약 확인 중</span>;
      case 'approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">예약 승인</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">예약 거부</span>;
      case 'completed':
          return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">예약 완료</span>;
      case 'cancelled':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">예약 취소</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const renderPaymentStatus = (status) => {
    switch (status) {
        case 'unpaid':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">미결제</span>;
        case 'paid':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">결제 완료</span>;
        default:
            return <span>{status}</span>;
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-10">Loading reservations...</div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }
    if (reservations.length === 0) {
      return <div className="text-center py-10">You have no reservations.</div>;
    }
    return (
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카라반</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 금액</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 상태</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 상태</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">액션</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={reservation.caravan?.photos[0] || 'https://via.placeholder.com/150'} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reservation.caravan?.name}</div>
                            <div className="text-sm text-gray-500">{reservation.caravan?.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₩{reservation.totalPrice.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(reservation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderPaymentStatus(reservation.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {reservation.status === 'approved' && reservation.paymentStatus === 'unpaid' && (
                          <button
                            onClick={() => handlePayment(reservation._id)}
                            className="text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-2 px-4 rounded"
                          >
                            결제하기
                          </button>
                        )}
                        <Link to={`/caravans/${reservation.caravan?._id}`} className="text-indigo-600 hover:text-indigo-900 ml-4">카라반 보기</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">내 예약</h1>
        {renderContent()}
      </main>
    </div>
  );
}
