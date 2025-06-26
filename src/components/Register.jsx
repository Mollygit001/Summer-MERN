import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()

    const validate = () => {
        const newErrors = {}
        if (!form.name.trim()) newErrors.name = 'Name is required'
        if (!form.email.trim()) newErrors.email = 'Email is required'

        if (form.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
            newErrors.email = 'Invalid email address'
        if (!form.password) newErrors.password = 'Password is required'
        if (form.password.length < 6)
            newErrors.password = 'Password must be at least 6 characters'
        if (form.password !== form.confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match'
        return newErrors
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value })
        setErrors({ ...errors, [e.target.id]: undefined })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        const body = {
            email: form.email,
            password: form.password,
            name: form.name
        }

        try {
            const response = await axios.post(
                'http://localhost:3000/auth/register',
                body,
                { withCredentials: true }
            )
            if (response.status === 201 || response.status === 200) {
                setErrors({})
                navigate('/dashboard') // Redirect to dashboard on successful registration
            } else {
                setErrors({ message: 'Registration failed. Please try again.' })
            }
        } catch (error) {
            setErrors({
                message:
                    error.response?.data?.message ||
                    'Registration failed. Please try again.',
            })
        }

    }
    // 👉 Google login handler
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            const response = await axios.post(
                'http://localhost:3000/auth/googleauth',
                { idToken },
                { withCredentials: true }
            );
            if (response.status === 200) {
                navigate('/dashboard');
            } else {
                setErrors({ message: 'Google registration failed. Try again.' });
            }
        } catch (err) {
            console.error(err);
            setErrors({ message: 'Google registration failed. Try again.' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
                {errors.message && (
                    <div className="mb-4 text-red-600 text-center">{errors.message}</div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={form.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter your Name"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter your email"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={form.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter your password"
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Confirm your password"
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Register
                    </button>
                </form>
                {/* 🧩 Google Auth Button */}
                <div className="mt-6">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() =>
                            setErrors({ message: 'Google login failed. Try again.' })
                        }
                    />
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register