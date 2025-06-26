import React from 'react';
import GetCurrentUser from './GetCurrentUser'; // Import the custom hook to get current user

const Dashboard = () => {

  const { user, loading } = GetCurrentUser();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
      });
      if (response.ok) {
        console.log("Logout successful");
        window.location.href = '/login'; // Redirect to login page after logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard!</h1>
      {
        console.log("user details", user)
      }
      {user ? (
        <p className="text-lg text-gray-700">
          You are now logged in {user.name} ({user.email}).
        </p>
      ) : (
        <p className="text-lg text-red-500">User not logged in</p>
      )}
      <button onClick={handleLogout} className='text-3xl text-red-600 font-bold bg-amber-400 px-4 py-2 rounded-4xl border-2 border-black hover:bg-amber-200 hover:text-red-400'>LogOut</button>
    </div>
  );
};

export default Dashboard;