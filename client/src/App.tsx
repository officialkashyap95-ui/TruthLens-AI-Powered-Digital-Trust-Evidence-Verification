import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import SignInPage from "./pages/Auth/SignInPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/signin" element={<SignInPage />} />
    </Routes>
  );
}

export default App;