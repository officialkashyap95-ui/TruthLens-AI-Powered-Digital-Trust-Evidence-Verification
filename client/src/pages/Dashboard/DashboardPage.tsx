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
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="dashboard-shell">
      <DashboardNavbar onHistoryClick={() => setShowHistory(true)} />

      <main className="dashboard-content">
         <WelcomeSection onHistoryClick={() => setShowHistory(true)} />
        <QuickVerification />
        <VerificationOverview />
        <RecentVerifications
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        <TrustMethod />
        <SystemStatus />
      </main>
    </div>
  );
}