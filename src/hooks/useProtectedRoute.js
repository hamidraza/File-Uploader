import { useEffect } from "react";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";

const useProtectedRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/signin", { replace: true });
    }
  }, [auth.currentUser]);
};

export default useProtectedRoute;
