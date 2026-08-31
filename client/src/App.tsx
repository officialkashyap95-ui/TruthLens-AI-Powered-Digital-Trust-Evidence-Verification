import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import SignInPage from "./pages/Auth/SignInPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import VerifyPage from "./pages/Verify/VerifyPage";
import ResultPage from "./pages/Result/ResultPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/signin" element={<SignInPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="/verify" element={<VerifyPage />} />

      <Route path="/result/:verificationId" element={<ResultPage />} />
    </Routes>
  );
}

export default App;