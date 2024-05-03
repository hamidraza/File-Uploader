import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

function FinishSignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = localStorage.getItem("emailForSignIn");
      if (!email) {
        email = prompt("Please provide your email for confirmation");
      }

      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          localStorage.removeItem("emailForSignIn");
          navigate("/"); // Navigate to a more appropriate page after sign-in
        })
        .catch((error) => {
          console.error("Error during finish sign-up", error);
          navigate("/signin"); // In case of error, redirect back to sign-in
        });
    }
  }, [auth, location, navigate]);

  return (
    <div>
      <h1>Finishing Sign Up...</h1>
    </div>
  );
}

export default FinishSignUp;
