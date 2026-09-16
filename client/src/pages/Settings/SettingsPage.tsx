
import {
  Bell,
  ChevronRight,
  Database,
  Eye,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";

import "./Settings.css";

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <header className="settings-header">
          <div>
            <span className="settings-overline">
              WORKSPACE SETTINGS
            </span>

            <h1>Settings</h1>

            <p>
              Manage your TruthLens workspace and verification
              preferences.
            </p>
          </div>
        </header>

        {/* Account */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-section-icon">
              <User size={17} />
            </div>

            <div>
              <h2>Account</h2>
              <p>
                Manage your TruthLens account and profile.
              </p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <User size={17} />
                </div>

                <div>
                  <h3>Profile</h3>
                  <p>
                    Your account information is managed through
                    your TruthLens account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="settings-action"
              >
                Manage
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Verification */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-section-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <h2>Verification</h2>
              <p>
                Control how verification results are presented.
              </p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <Database size={17} />
                </div>

                <div>
                  <h3>Save verification history</h3>
                  <p>
                    Keep completed verification results in your
                    history.
                  </p>
                </div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span />
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <h3>Show confidence score</h3>
                  <p>
                    Display the confidence level with verification
                    results.
                  </p>
                </div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span />
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <Eye size={17} />
                </div>

                <div>
                  <h3>Show evidence details</h3>
                  <p>
                    Display the evidence and signals behind a
                    verification result.
                  </p>
                </div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span />
              </label>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-section-icon">
              <Bell size={17} />
            </div>

            <div>
              <h2>Notifications</h2>
              <p>
                Choose which workspace notifications you receive.
              </p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <Bell size={17} />
                </div>

                <div>
                  <h3>Verification completed</h3>
                  <p>
                    Get notified when a verification is completed.
                  </p>
                </div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span />
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <Bell size={17} />
                </div>

                <div>
                  <h3>Verification errors</h3>
                  <p>
                    Get notified when a verification cannot be
                    completed.
                  </p>
                </div>
              </div>

              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span />
              </label>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-section-icon">
              <Sun size={17} />
            </div>

            <div>
              <h2>Appearance</h2>
              <p>
                Choose how TruthLens looks on your device.
              </p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <Sun size={17} />
                </div>

                <div>
                  <h3>Theme</h3>
                  <p>
                    Choose your preferred interface appearance.
                  </p>
                </div>
              </div>

              <div className="theme-options">
                <button
                  type="button"
                  className="theme-option is-selected"
                >
                  <Sun size={15} />
                  Light
                </button>

                <button
                  type="button"
                  className="theme-option"
                >
                  <Moon size={15} />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Data */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-section-icon">
              <Lock size={17} />
            </div>

            <div>
              <h2>Privacy & Data</h2>
              <p>
                Manage your stored verification information.
              </p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-content">
                <div className="settings-row-icon">
                  <Database size={17} />
                </div>

                <div>
                  <h3>Verification history</h3>
                  <p>
                    Manage the verification records stored in your
                    workspace.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="settings-danger-button"
              >
                Clear history
              </button>
            </div>
          </div>
        </section>

        <footer className="settings-footer">
          <span>TruthLens</span>
          <span>Digital trust & evidence verification</span>
        </footer>
      </div>
    </div>
  );
}

