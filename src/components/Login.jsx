import axios from 'axios';
import React, { useState } from 'react'

const Login = ({updatedDetails}) => {
  
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});

  // Validation rules
  const validate = () => {
    const newErrors = {};
    if (!form.username) {
      newErrors.username = 'username is required';
    } else if (!/^[a-zA-Z0-9_]{3,16}$/.test(form.username)) {
      newErrors.username = 'Invalid username';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const body = {
      username: form.username,
      password: form.password,
    };

    const config = {
      withCredentials: true,
    };

    try {
      const response = await axios.post('http://localhost:3000/auth/login', body, config);
      // Assuming a successful login returns a 200 status and user data
      if (response.status === 200 && response.data) {
        updatedDetails({ username: body.username, password: body.password });
        setErrors({});
        console.log("Login successful");
      } else {
        setErrors({ message: 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      console.error(error);
      setErrors({ message: 'Login failed. Please check your credentials.' });
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 border-2 w-full max-w-md mx-auto p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            <div className="mb-4 w-full">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="mb-6 w-full">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            {errors.message && (
              <p className="text-red-500 text-sm mb-4">{errors.message}</p>
            )}
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Login