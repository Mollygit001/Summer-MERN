import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { serverEndpoint } from "../../../config/config";

function formatDate(isoDateString) {
  if (!isoDateString) return '';
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Invalid date:', isoDateString, error);
    return '';
  }
}

function Subscription() {
  const userDetails = useSelector((state) => state.form.userDetails);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const subscription = userDetails.subscription;

  const handleCancel = async () => {
    try {
      const response = await axios.post(
        `${serverEndpoint}/payments/cancel-subscription`,
        { subscription_id: subscription?.id },
        { withCredentials: true }
      );
      console.log(response);
      setMessage("Subscription cancelled. It may take up to 5 minutes to reflect the status.");
    } catch (error) {
      console.error(error);
      setErrors({ message: "Unable to cancel subscription. Please try again." });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {errors.message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {errors.message}
        </div>
      )}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Summary</h3>
        <hr className="mb-4" />

        <div className="space-y-3 text-gray-700">
          <div>
            <strong>Start Date:</strong> {formatDate(subscription.start)}
          </div>
          <div>
            <strong>End Date:</strong> {formatDate(subscription.end)}
          </div>
          <div>
            <strong>Last Payment Date:</strong> {formatDate(subscription.lastBillDate)}
          </div>
          <div>
            <strong>Next Payment Date:</strong> {formatDate(subscription.nextBillDate)}
          </div>
          <div>
            <strong>Total Payments Made:</strong> {subscription.paymentsMade}
          </div>
          <div>
            <strong>Payments Remaining:</strong> {subscription.paymentsRemaining}
          </div>
        </div>

        <hr className="my-6" />

        <div className="text-center">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition w-1/2"
            onClick={handleCancel}
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

export default Subscription;
