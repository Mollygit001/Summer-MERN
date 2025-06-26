import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleAuthButton = () => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const response = await axios.post(
        'http://localhost:3000/auth/googleauth',
        { idToken },
        { withCredentials: true }
      );
      alert('Google login successful!');
      console.log(response.data);
      // Redirect or set user context here
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed.');
    }
  };

  const handleError = () => {
    alert('Google sign-in failed!');
  };

  return (
    <div>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default GoogleAuthButton;
