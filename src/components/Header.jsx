import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ userDetails }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className='bg-blue-600 text-white p-4 text-center'>
      <h1 className='text-2xl font-bold mb-2'>My MERN App</h1>
      <nav>
        {userDetails ? (
          <>
            <span className="mx-2">Welcome, {userDetails.name}!</span>
            {currentPath === '/dashboard' || currentPath ==='/Dashboard' ? (
              <Link to="/" className="mx-2 hover:underline">Home</Link>
            ) : (
              <Link to="/dashboard" className="mx-2 hover:underline">Dashboard</Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="mx-2 hover:underline">Login</Link>
            <Link to="/register" className="mx-2 hover:underline">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
