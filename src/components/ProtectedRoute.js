import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../config/firebaseConfig";

const ProtectedRoute = ({ redirectPath = "/signin" }) => {
  const user = auth.currentUser;
  const nav = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        nav(redirectPath, { replace: true });
      }
    });

    return unsubscribe;
  }, []);

  return <Outlet />;
};

export default ProtectedRoute;
