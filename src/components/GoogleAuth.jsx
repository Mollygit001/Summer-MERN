import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { serverEndpoint } from '../config/config';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../features/form/formSlice';


const GoogleAuthButton = () => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});
  const handleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const response = await axios.post(
        `${serverEndpoint}/auth/googleauth`,
        { idToken },
        { withCredentials: true }
      );
      if (response.status === 200) {
        dispatch(setUserDetails((response.data.userDetails)));
        setErrors({});
      } else {
        setErrors({ message: 'Google registration failed. Try again.' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ message: 'Google registration failed. Try again.' });
    }
  };

  const handleError = () => {
    alert('Google sign-in failed!');
  };

  return (
    <div className="flex flex-col items-center w-full mt-6">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      {errors.message && (
        <p className="mt-2 text-sm text-red-600">{errors.message}</p>
      )}
    </div>
  );

};

export default GoogleAuthButton;
