import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  getAuth,
  sendSignInLinkToEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth();
  const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: "http://localhost:3000/finishSignUp?cartId=1234",
    // This must be true.
    handleCodeInApp: true,
  };

  const signUpWithEmailLink = async (event) => {
    event.preventDefault();
    setLoading(true);
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        // The link was successfully sent. Inform the user.
        window.localStorage.setItem("emailForSignIn", email); // Save the email locally to complete the sign-in process when they return.
        alert(
          "An email was sent to " +
            email +
            ". Click the link in the email to complete the registration."
        );
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error sending email link: ", error);
        setError(error.message);
        setLoading(false);
      });
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
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
        <div className="flex min-h-full flex-1">
          <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              <div>
                <img
                  className="h-10 w-auto"
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                  alt="Your Company"
                />
                <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                  Create a new Account
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Already a member?{" "}
                  <Link
                    to="/"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Sign In
                  </Link>
                </p>
              </div>

              <form onSubmit={signUpWithEmailLink} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? "Sending link..." : "Send Verification Link"}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
            alt=""
          />
        </div>
      </div>
    </>
  );
}
