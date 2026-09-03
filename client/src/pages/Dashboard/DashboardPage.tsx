import { useState } from "react";

import "./Dashboard.css";

import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import WelcomeSection from "../../components/dashboard/WelcomeSection";
import QuickVerification from "../../components/dashboard/QuickVerification";
import VerificationOverview from "../../components/dashboard/VerificationOverview";
import RecentVerifications from "../../components/dashboard/RecentVerifications";
import TrustMethod from "../../components/dashboard/TrustMethod";
import SystemStatus from "../../components/dashboard/SystemStatus";

export default function DashboardPage() {
  /* =========================================================
     HISTORY MODAL STATE

     This state is kept here so BOTH:
     
     1. Navbar → History
     2. Recent Verifications → View all history

     can open the exact same modal.
  ========================================================= */

  const [
    showHistory,
    setShowHistory,
  ] = useState(false);

  const openHistory = () => {
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  return (
    <div className="dashboard-shell">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <DashboardNavbar
        onHistoryClick={openHistory}
      />

      <main className="dashboard-content">

        <WelcomeSection
          onOpenHistory={openHistory}
        />

        <QuickVerification />

        <VerificationOverview />

        <RecentVerifications
          isHistoryOpen={showHistory}
          onHistoryOpen={openHistory}
          onHistoryClose={closeHistory}
        />

        <TrustMethod />

        <SystemStatus />

      </main>
    </div>
  );
}
