/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails, clearUserDetails } from "./features/form/formSlice";
import axios from "axios";
import { Home, Login, Dashboard, Register, Error, UnauthorizedAccess } from "./components/pages";
import Layout from "./components/layout/Layout";
import { serverEndpoint } from "./config/config";
import UserLayout from "./components/layout/UserLayout";
import ManageUsers from "./components/pages/users/ManageUsers";
import Spinner from "./utilities/Spinner";

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
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Layout>
      <Routes>

        //NOTE:Home route is the default route, it redirects to dashboard if user is logged in
        <Route path="/" element={userDetails ?
          <UserLayout>
            <Navigate to="/dashboard" />
          </UserLayout> :
          <Home />
        } />

        //NOTE:Login Route
        <Route path="/login" element={userDetails ?
          <Navigate to="/dashboard" /> :
          <Login />

        } />

        //NOTE:Register Route
        <Route path="/register" element={userDetails ?
          <Navigate to="/dashboard" /> :
          <Register />
        } />

        //NOTE:Dashboard Route
        <Route path="/dashboard" element={userDetails ?
          <UserLayout>
            <Dashboard />
          </UserLayout> :
          <Navigate to="/login" />

        } />


        //NOTE:Manage Users Route
        <Route path="/manage-users" element={
          userDetails && userDetails.role === "admin" ?
            <UserLayout>
              <ManageUsers />
            </UserLayout> :
            <Navigate to="/dashboard" />

        } />

        //NOTE:Unauthorized Access Route
        <Route path="/unauthorized" element={userDetails ?
          <UserLayout>
            <UnauthorizedAccess />
          </UserLayout> :
          <Navigate to="/login" />
        } />

        <Route path="/error" element={
          <UserLayout>
            <Error />
          </UserLayout>
        } />

      </Routes>
    </Layout>
  );
};

export default App;