/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Layout from "./Layout";
import Dashboard from "./components/Dashboard";
import axios from "axios";
import Register from "./components/Register";
const App = () => {
  const [userDetails, setUserDetails] = useState(null);

  const updateUserDetails = (updatedDetails) => {
    setUserDetails(updatedDetails);
  };


  const isUserLoggedIn = async () => {
    try {
      const res = await axios.post("http://localhost:3000/auth/is-user-logged-in", {}, {
        withCredentials: true,
      });
      updateUserDetails(res.data.userDetails);
    }
    catch (err) {
      console.error("User not Logged in:", err);
      setUserDetails(null);
    }
  }

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  return (
    <Layout userDetails={userDetails}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            userDetails ? (
              <Navigate to="/Dashboard" />
            ) : (
              <Login updatedDetails={updateUserDetails} />
            )
          }
        />
        <Route
          path="/Dashboard"
          element={userDetails ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/register"
          element={userDetails ? (
            <Navigate to="/Dashboard" />
          ) : (
            <Register />
          )}
        />

      </Routes>
    </Layout>
  );
};

export default App;