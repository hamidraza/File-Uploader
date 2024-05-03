import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import SignIn from "./components/SignIn/index";
import SignUp from "./components/SignUp/index";
import Home from "./components/Home/index";
import Phone from "./components/SignIn/phone";
import ProtectedRoute from "./components/ProtectedRoute";
import FinishSignUp from "./components/SignUp/FinishSignUp"; // Import the new component

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/finishSignUp" element={<FinishSignUp />} />{" "}
          {/* New route for finish sign up */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/phone" element={<Phone />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
