/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../config/config';
import { motion, AnimatePresence } from 'framer-motion';

const ResetPasswordModal = ({ showModal, setShowModal }) => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter otp & password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const otpRefs = useRef([]);
  const [timer, setTimer] = useState(15 * 60);

  const handleSendOtp = async () => {
    if (!email) return setError("Please enter your email.");
    try {
      const res = await axios.post(`${serverEndpoint}/auth/sendResetPasswordToken`, { email: email });
      setStep(2);
      setError('');
      setMessage(res.data.message || "OTP sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      setMessage('');
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleResetPassword = async () => {
    if (otp.includes('') || !password || !confirmPassword) {
      return setError("All fields are required.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const res = await axios.post(`${serverEndpoint}/auth/verifyandupdate`, {
        otp: otp.join(''),
        email: email,
        resetPassword: password
      });

      setMessage(res.data.message || "Password reset successful.");
      setError('');
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
      setMessage('');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(1);
    setEmail('');
    setOtp(new Array(6).fill(''));
    setPassword('');
    setConfirmPassword('');
    setMessage('');
    setError('');
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };



  

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-center mb-4">Reset Password</h2>

            {message && <p className="text-green-600 text-sm mb-3 text-center">{message}</p>}
            {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

            {step === 1 && (
              <>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded mb-4"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={handleSendOtp}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Send OTP
                </button>
              </>
            )}

            {step === 2 && (
              <>
              <p className="text-sm text-gray-600 mb-4">
                      Expires in: <span className="font-semibold">{formatTime(timer)}</span>
                    </p>
                <label className="block text-sm font-medium mb-1">Enter OTP</label>
                <div className="flex justify-between mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      ref={(el) => (otpRefs.current[index] = el)}
                      className="w-10 h-10 text-center border rounded text-lg"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          otpRefs.current[index - 1].focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded mb-3"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded mb-4"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  onClick={handleResetPassword}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                  Reset Password
                </button>
              </>
            )}

            <button
              onClick={closeModal}
              className="w-full text-gray-500 text-sm mt-4"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResetPasswordModal;
