import { CheckCircle2 } from "lucide-react";

export default function SystemStatus() {
  return (
    <footer className="system-status">
      <div>
        <span className="status-kicker">
          <i />
          TRUTHLENS SYSTEMS
        </span>

        <strong>
          <CheckCircle2 size={15} />
          Operational
        </strong>
      </div>

      <p>
        Verification services are currently available.
      </p>
    </footer>
  );
}