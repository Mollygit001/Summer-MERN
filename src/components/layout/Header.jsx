/* eslint-disable no-unused-vars */
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const userDetails = useSelector((state) => state.form.userDetails);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold tracking-tight hover:opacity-90 transition duration-300">
          Affiliate<span className="text-yellow-300">++</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm sm:text-base">
          {userDetails ? (
            <>
              {/* Greeting */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-300 text-blue-900 flex items-center justify-center font-bold uppercase">
                  {userDetails.name?.charAt(0)}
                </div>
                <span className="hidden sm:inline">Welcome, {userDetails.name}!</span>
              </div>

              {/* Dashboard/Home toggle */}
              {currentPath.toLowerCase() === '/dashboard' ? (
                <Link
                  to="/"
                  className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition font-medium"
                >
                  Home
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition font-medium"
                >
                  Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1 rounded border border-white hover:bg-white hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1 rounded bg-yellow-300 text-blue-800 font-semibold hover:bg-yellow-400 transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
