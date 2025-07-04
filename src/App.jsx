/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails, clearUserDetails } from "./features/form/formSlice";
import axios from "axios";
import { Home, Login, Dashboard, Register } from "./components/pages";
import Layout from "./components/layout/Layout";
import { serverEndpoint } from "./config/config";
import UserLayout from "./components/layout/UserLayout";
import ManageUsers from "./components/pages/users/ManageUsers";
import {Spinner} from "./components/common/Spinner";

const App = () => {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.form.userDetails);
  const [loading, setLoading] = useState(true);


  const isUserLoggedIn = async () => {
    try {
      const res = await axios.post(`${serverEndpoint}/auth/is-user-logged-in`, {}, {
        withCredentials: true,
      });
      dispatch(setUserDetails(res.data.userDetails));
    }
    catch (err) {
      console.error("User not Logged in:", err);
      dispatch(clearUserDetails());
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    isUserLoggedIn();
  },[]);

  if(loading){
    return <Spinner />;
  }

  return (
    <Layout userDetails={userDetails}>
      <Routes>
        <Route path="/" element={
          userDetails ?
            <UserLayout>
              <Navigate to="/Dashboard" />
            </UserLayout> :
            <Home />
        } />
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
          element={userDetails ?
            <UserLayout>
              <Dashboard />
            </UserLayout> :
            <Navigate to="/login" />
          }/>
        <Route
          path="/register"
          element={userDetails ? (
            <Navigate to="/Dashboard" />
          ) : (
            <Register />
          )}
        />

        <Route path="/manage-users" element={
          userDetails && userDetails.role === "admin" ? (
            <UserLayout>
              <ManageUsers />
            </UserLayout>
          ) : (
            <Navigate to="/Dashboard" />
          )
        } />

      </Routes>
    </Layout>
  );
};

export default App;