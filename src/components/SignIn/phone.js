import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Phone() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      setUpRecaptcha();
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setUpRecaptcha = () => {
    try {
      const verifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) =>
            console.log("Recaptcha resolved with response: ", response),
        },
        auth
      );
      window.recaptchaVerifier = verifier;
      verifier
        .render()
        .catch((err) =>
          setError("Failed to load reCAPTCHA, please reload the page.")
        );
    } catch (err) {
      setError("Recaptcha setup error. Please reload the page.");
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError("Please enter a phone number.");
      return;
    }
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+${phone}`,
        window.recaptchaVerifier
      );
      setVerificationId(confirmationResult.verificationId);
      console.log("OTP has been sent.");
    } catch (error) {
      console.error("Error during signInWithPhoneNumber", error);
      setError("Could not send OTP, check the phone number and try again.");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP sent to your phone.");
      return;
    }
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      console.log("User signed in successfully", userCredential.user);
      navigate("/");
    } catch (error) {
      console.error("Error during OTP verification", error);
      setError("OTP is incorrect, please try again.");
    }
  };

  return (
    <>
      {error && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-bold text-red-500">Error</h2>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError("")}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md lg:w-96">
            <form onSubmit={sendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Phone Number
                </label>
                <PhoneInput
                  country={"in"}
                  value={phone}
                  onChange={setPhone}
                  inputStyle={{ width: "100%" }}
                />
                <button
                  type="submit"
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Get OTP
                </button>
              </div>
            </form>
            {verificationId && (
              <form onSubmit={verifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="OTP here"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Verify OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </>
  );
}
