import { useDispatch, useSelector } from "react-redux";
import { CREDIT_PACKS, PLAN_IDS, pricingList } from "../../../config/payments";
import { useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../../config/config";
import { setUserDetails } from "../../../features/form/formSlice";

function PurchaseCredit() {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.form.userDetails);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleBuyCredits = async (credits) => {
    setShowModal(false);
    try {
      const { data } = await axios.post(
        `${serverEndpoint}/payments/create-order`,
        { credits },
        { withCredentials: true }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Affiliate++',
        description: `${credits} Credits Pack`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const res = await axios.post(
              `${serverEndpoint}/payments/verify-order`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                credits
              },
              { withCredentials: true }
            );

            dispatch(setUserDetails(res.data.userDetails));
            setMessage(`${credits} credits added!`);
          } catch (error) {
            console.error(error);
            setErrors({ message: 'Unable to purchase credits, please try again' });
          }
        },
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      setErrors({ message: 'Unable to purchase credits, please try again' });
    }
  };

  const handleSubscribe = async (planKey) => {
    try {
      const { data } = await axios.post(
        `${serverEndpoint}/payments/create-subscription`,
        { plan_name: planKey },
        { withCredentials: true }
      );

      const plan = PLAN_IDS[planKey];
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        name: plan.planName,
        description: plan.description,
        subscription_id: data.subscription.id,
        handler: async (response) => {
          try {
            const res = await axios.post(
              `${serverEndpoint}/payments/verify-subscription`,
              { subscription_id: response.razorpay_subscription_id },
              { withCredentials: true }
            );

            dispatch(setUserDetails(res.data.userDetails));
            setMessage('Subscription activated');
          } catch (error) {
            console.error(error);
            setErrors({ message: 'Unable to activate subscription, please try again' });

          }
        },
        theme: { color: "#3399cc" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      setErrors({ message: 'Failed to create subscription' });
    }
  };

  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        {errors.message && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.message}
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Choose Plan</h3>
            <p className="mt-2 text-gray-600">
              Flexible options: one-time credits or recurring subscriptions.
            </p>
          </div>
          <div className="sm:text-right">
            <h3 className="text-2xl font-bold text-gray-800">Current Balance</h3>
            <p className="mt-2 text-gray-600">{userDetails.credits} Credits</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Credit Pack */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
            <h4 className="text-xl font-semibold mb-4">Credit Packs</h4>
            <ul className="text-gray-700 mb-4 space-y-2">
              {CREDIT_PACKS.map((c) => (
                <li key={c}>{c} CREDITS FOR ₹{c}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Buy Credits
            </button>
          </div>

          {/* Monthly Plan */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
            <h4 className="text-xl font-semibold mb-4">₹199/month</h4>
            <ul className="text-gray-700 mb-4 space-y-2">
              {pricingList[1].list.map((item, i) => (
                <li key={i}>{item.detail}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("UNLIMITED_MONTHLY")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Subscribe Monthly
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
            <h4 className="text-xl font-semibold mb-4">₹1990/year</h4>
            <ul className="text-gray-700 mb-4 space-y-2">
              {pricingList[2].list.map((item, i) => (
                <li key={i}>{item.detail}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("UNLIMITED_YEARLY")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Subscribe Yearly
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Buy Credits</h3>
                <button
                  className="text-gray-500 hover:text-gray-700 text-lg"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {CREDIT_PACKS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleBuyCredits(c)}
                    className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition px-4 py-2 rounded"
                  >
                    Buy {c} Credits
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PurchaseCredit;
