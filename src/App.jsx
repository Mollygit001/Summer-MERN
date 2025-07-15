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
import ProtectedRoute from "./rbac/ProtectedRoute";
import ManagePayments from "./components/pages/payments/ManagePayments";
import AnalyticsDashboard from "./components/pages/links/AnalyticsDashboard";

const App = () => {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.form.userDetails);
  const [loading, setLoading] = useState(true);

  const attemptToRefreshToken = async () => {
    try {
      const res = await axios.post(`${serverEndpoint}/auth/refresh-token`, {}, {
        withCredentials: true
      });
      dispatch(setUserDetails(res.data.userDetails));
    } catch (error) {
      console.log(error)
    }
  }


  const isUserLoggedIn = async () => {
    try {
      const res = await axios.post(`${serverEndpoint}/auth/is-user-logged-in`, {}, {
        withCredentials: true,
      });
      dispatch(setUserDetails(res.data.userDetails));
    }
    catch (err) {
      if (err.res?.status === 401) {
        console.log('Token Expired! Attempting to refresh it.')
        await attemptToRefreshToken();
      } else {

        console.error("User not Logged in:", err);
        dispatch(clearUserDetails());
      }
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

    <Routes>

        //NOTE:Home route is the default route, it redirects to dashboard if user is logged in
      <Route path="/" element={userDetails ?
        <UserLayout>
          <Navigate to="/dashboard" />
        </UserLayout> :
        <Layout>
          <Home />
        </Layout>
      } />

        //NOTE:Login Route
      <Route path="/login" element={userDetails ?
        <Navigate to="/dashboard" /> :
        <Layout>
          <Login />
        </Layout>

      } />

        //NOTE:Register Route
      <Route path="/register" element={userDetails ?
        <Navigate to="/dashboard" /> :
        <Layout>
          <Register />
        </Layout>
      } />

        //NOTE:Dashboard Route
      <Route path="/dashboard" element={userDetails ?
        <UserLayout>
          <Dashboard />
        </UserLayout> :
        <Navigate to="/login" />

      } />


        //NOTE:Manage Users Route
      <Route path="/users" element={userDetails ?
        <ProtectedRoute roles={['admin']}>
          <UserLayout>
            <ManageUsers />
          </UserLayout>
        </ProtectedRoute> :
        <Navigate to="/login" />

      } />

        //NOTE:Unauthorized Access Route
      <Route path="/unauthorized" element={userDetails ?
        <UserLayout>
          <UnauthorizedAccess />
        </UserLayout> :
        <Navigate to="/login" />
      } />

      <Route path="/error" element={userDetails ?
        <UserLayout>
          <Error />
        </UserLayout> :
        <Error />
      } />

        //NOTE:Manage Payments Route
      <Route path="/manage-payment" element={userDetails ?
        <UserLayout>
          <ManagePayments />
        </UserLayout> :
        <Navigate to='/login' />
      } />

      //NOTE:Analytics Route
      <Route path="/analytics/:linkId" element={userDetails ?
        <UserLayout>
          <AnalyticsDashboard />
        </UserLayout> : <Navigate to='/login' />
      } />


    </Routes>
  );
};

export default App;