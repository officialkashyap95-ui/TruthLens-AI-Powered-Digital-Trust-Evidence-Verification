import "./Dashboard.css";

import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import WelcomeSection from "../../components/dashboard/WelcomeSection";
import QuickVerification from "../../components/dashboard/QuickVerification";
import VerificationOverview from "../../components/dashboard/VerificationOverview";
import RecentVerifications from "../../components/dashboard/RecentVerifications";
import TrustMethod from "../../components/dashboard/TrustMethod";
import SystemStatus from "../../components/dashboard/SystemStatus";

export default function DashboardPage() {
  return (
    <div className="dashboard-shell">
      <DashboardNavbar />

      <main className="dashboard-content">
        <WelcomeSection />
        <QuickVerification />
        <VerificationOverview />
        <RecentVerifications />
        <TrustMethod />
        <SystemStatus />
      </main>
    </div>
  );
}