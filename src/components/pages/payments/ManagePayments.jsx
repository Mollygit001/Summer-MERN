import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import axios from 'axios';
import { CREDIT_PACKS } from '../../../config/payments';
import { serverEndpoint } from '../../../config/config';
import { setUserDetails } from '../../../features/form/formSlice';

function ManagePayments() {
  const userDetails = useSelector((state) => state.form.userDetails);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();


  const handlePayment = async (credits) => {
    try {
      setLoading(true);

      const { data } = await axios.post(
        `${serverEndpoint}/payments/create-order`,
        { credits },
        { withCredentials: true }
      );

      const order = data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Affiliate++',
        description: `${credits} credits pack`,
        order_id: order.id,
        theme: { color: '#3399cc' },
        handler: async (response) => {
          try {
            const res = await axios.post(
              `${serverEndpoint}/payments/verify-order`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                credits,
              },
              { withCredentials: true }
            );
            dispatch(setUserDetails(res.data.userDetails));

            setMessage('Credits added successfully');
          } catch (error) {
            console.error(error);
            setErrors({
              message: 'Payment verification failed. If deducted, contact support.',
            });
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      setErrors({
        message: 'Unable to create order. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">Manage Payments</h2>
      <p className="mb-6 text-gray-700">
        <strong>Credit Balance:</strong> {userDetails?.credits ?? "NA"}
        
      </p>

      {/* Success and Error Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      {errors.message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.message}
        </div>
      )}

      {/* Credit Packs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CREDIT_PACKS.map((credit) => (
          <div
            key={credit}
            className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-all text-center bg-white"
          >
            <h4 className="text-lg font-bold mb-2">{credit} Credits</h4>
            <p className="text-gray-600 mb-4">Buy for ₹{credit}</p>
            <button
              className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={() => handlePayment(credit)}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ₹${credit}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManagePayments;
