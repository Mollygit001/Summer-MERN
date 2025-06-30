/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails, clearUserDetails } from "./features/form/formSlice";
import axios from "axios";
import { Home, Login, Dashboard, Register } from "./components/pages";
import Layout from "./components/layout/Layout";

const App = () => {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.form.userDetails);


  const isUserLoggedIn = async () => {
    try {
      const res = await axios.post("http://localhost:3000/auth/is-user-logged-in", {}, {
        withCredentials: true,
      });
      dispatch(setUserDetails(res.data.userDetails));
    }
    catch (err) {
      console.error("User not Logged in:", err);
      dispatch(clearUserDetails());
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
              <Login />
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
            <Register/>
          )}
        />

      </Routes>
    </Layout>
  );
};

export default App;