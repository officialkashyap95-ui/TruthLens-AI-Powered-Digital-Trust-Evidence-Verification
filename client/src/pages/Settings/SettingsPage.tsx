import { useEffect, useState } from "react";
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
import { useClerk } from "@clerk/react";

import "./Settings.css";

import {
  clearVerificationHistory,
} from "../../services/verificationService";


/* =========================================================
   SETTINGS TYPE
========================================================= */

interface SettingsState {
  saveHistory: boolean;
  showConfidence: boolean;
  showEvidence: boolean;
  verificationCompleted: boolean;
  verificationErrors: boolean;
  theme: "light" | "dark";
}


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS: SettingsState = {
  saveHistory: true,
  showConfidence: true,
  showEvidence: true,
  verificationCompleted: true,
  verificationErrors: true,
  theme: "light",
};


/* =========================================================
   LOCAL STORAGE KEY
========================================================= */

const SETTINGS_KEY = "truthlens-settings";


/* =========================================================
   SETTINGS PAGE
========================================================= */

export default function SettingsPage() {
  const { openUserProfile } = useClerk();


  /* =======================================================
     SETTINGS STATE
  ======================================================= */

  const [settings, setSettings] =
    useState<SettingsState>(
      DEFAULT_SETTINGS
    );


  /* =======================================================
     CLEAR HISTORY STATE
  ======================================================= */

  const [showClearConfirmation, setShowClearConfirmation] =
    useState(false);

  const [isClearingHistory, setIsClearingHistory] =
    useState(false);

  const [clearHistoryMessage, setClearHistoryMessage] =
    useState("");


  /* =======================================================
     LOAD LOCAL SETTINGS
  ======================================================= */

  useEffect(() => {
    const savedSettings =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (!savedSettings) {
      return;
    }

    try {
      const parsedSettings =
        JSON.parse(
          savedSettings
        ) as Partial<SettingsState>;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
      });
    } catch {
      localStorage.removeItem(
        SETTINGS_KEY
      );
    }
  }, []);


  /* =======================================================
     SAVE LOCAL SETTINGS
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    document.documentElement.setAttribute(
      "data-theme",
      settings.theme
    );
  }, [settings]);


  /* =======================================================
     UPDATE SINGLE SETTING
  ======================================================= */

  const updateSetting = <
    K extends keyof SettingsState
  >(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };


  /* =======================================================
     THEME CHANGE
  ======================================================= */

  const handleThemeChange = (
    theme: "light" | "dark"
  ) => {
    updateSetting(
      "theme",
      theme
    );
  };


  /* =======================================================
     OPEN CLEAR HISTORY CONFIRMATION
  ======================================================= */

  const handleClearHistory = () => {
    setClearHistoryMessage("");

    setShowClearConfirmation(
      true
    );
  };


  /* =======================================================
     CANCEL CLEAR HISTORY
  ======================================================= */

  const cancelClearHistory = () => {
    if (isClearingHistory) {
      return;
    }

    setShowClearConfirmation(
      false
    );
  };


  /* =======================================================
     CONFIRM CLEAR HISTORY
  ======================================================= */

  const confirmClearHistory = async () => {
    if (isClearingHistory) {
      return;
    }

    try {
      setIsClearingHistory(
        true
      );

      setClearHistoryMessage(
        ""
      );


      /* ===================================================
         DELETE FROM BACKEND
      =================================================== */

      const deletedCount =
        await clearVerificationHistory();


      /* ===================================================
         CLOSE MODAL
      =================================================== */

      setShowClearConfirmation(
        false
      );


      /* ===================================================
         SUCCESS MESSAGE
      =================================================== */

      if (deletedCount > 0) {
        setClearHistoryMessage(
          `${deletedCount} verification ${
            deletedCount === 1
              ? "record"
              : "records"
          } cleared successfully.`
        );
      } else {
        setClearHistoryMessage(
          "Verification history is already empty."
        );
      }

    } catch (error) {

      console.error(
        "Failed to clear verification history:",
        error
      );


      /* ===================================================
         ERROR MESSAGE
      =================================================== */

      setClearHistoryMessage(
        error instanceof Error
          ? error.message
          : "Failed to clear verification history."
      );

    } finally {

      setIsClearingHistory(
        false
      );
    }
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="settings-page">
      <div className="settings-container">


        {/* =================================================
           HEADER
        ================================================= */}

        <header className="settings-header">
          <div>
            <span className="settings-overline">
              WORKSPACE SETTINGS
            </span>

            <h1>
              Settings
            </h1>

            <p>
              Manage your TruthLens workspace and verification
              preferences.
            </p>
          </div>
        </header>


        {/* =================================================
           ACCOUNT
        ================================================= */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div className="settings-section-icon">
              <User size={17} />
            </div>

            <div>
              <h2>
                Account
              </h2>

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
                  <h3>
                    Profile
                  </h3>

                  <p>
                    Your account information is managed through
                    your TruthLens account.
                  </p>
                </div>

              </div>


              <button
                type="button"
                className="settings-action"
                onClick={() =>
                  openUserProfile()
                }
              >
                Manage

                <ChevronRight size={16} />
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
           VERIFICATION
        ================================================= */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div className="settings-section-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <h2>
                Verification
              </h2>

              <p>
                Control how verification results are presented.
              </p>
            </div>

          </div>


          <div className="settings-card">


            {/* ---------------------------------------------
               SAVE HISTORY
            --------------------------------------------- */}

            <div className="settings-row">

              <div className="settings-row-content">

                <div className="settings-row-icon">
                  <Database size={17} />
                </div>

                <div>
                  <h3>
                    Save verification history
                  </h3>

                  <p>
                    Keep completed verification results in your
                    history.
                  </p>
                </div>

              </div>


              <label className="settings-toggle">

                <input
                  type="checkbox"
                  checked={
                    settings.saveHistory
                  }
                  onChange={(event) =>
                    updateSetting(
                      "saveHistory",
                      event.target.checked
                    )
                  }
                />

                <span />

              </label>

            </div>


            <div className="settings-divider" />


            {/* ---------------------------------------------
               CONFIDENCE SCORE
            --------------------------------------------- */}

            <div className="settings-row">

              <div className="settings-row-content">

                <div className="settings-row-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <h3>
                    Show confidence score
                  </h3>

                  <p>
                    Display the confidence level with verification
                    results.
                  </p>
                </div>

              </div>


              <label className="settings-toggle">

                <input
                  type="checkbox"
                  checked={
                    settings.showConfidence
                  }
                  onChange={(event) =>
                    updateSetting(
                      "showConfidence",
                      event.target.checked
                    )
                  }
                />

                <span />

              </label>

            </div>


            <div className="settings-divider" />


            {/* ---------------------------------------------
               EVIDENCE
            --------------------------------------------- */}

            <div className="settings-row">

              <div className="settings-row-content">

                <div className="settings-row-icon">
                  <Eye size={17} />
                </div>

                <div>
                  <h3>
                    Show evidence details
                  </h3>

                  <p>
                    Display the evidence and signals behind a
                    verification result.
                  </p>
                </div>

              </div>


              <label className="settings-toggle">

                <input
                  type="checkbox"
                  checked={
                    settings.showEvidence
                  }
                  onChange={(event) =>
                    updateSetting(
                      "showEvidence",
                      event.target.checked
                    )
                  }
                />

                <span />

              </label>

            </div>

          </div>

        </section>


        {/* =================================================
           NOTIFICATIONS
        ================================================= */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div className="settings-section-icon">
              <Bell size={17} />
            </div>

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Choose which workspace notifications you receive.
              </p>
            </div>

          </div>


          <div className="settings-card">


            {/* ---------------------------------------------
               VERIFICATION COMPLETED
            --------------------------------------------- */}

            <div className="settings-row">

              <div className="settings-row-content">

                <div className="settings-row-icon">
                  <Bell size={17} />
                </div>

                <div>
                  <h3>
                    Verification completed
                  </h3>

                  <p>
                    Get notified when a verification is completed.
                  </p>
                </div>

              </div>


              <label className="settings-toggle">

                <input
                  type="checkbox"
                  checked={
                    settings.verificationCompleted
                  }
                  onChange={(event) =>
                    updateSetting(
                      "verificationCompleted",
                      event.target.checked
                    )
                  }
                />

                <span />

              </label>

            </div>


            <div className="settings-divider" />


            {/* ---------------------------------------------
               VERIFICATION ERRORS
            --------------------------------------------- */}

            <div className="settings-row">

              <div className="settings-row-content">

                <div className="settings-row-icon">
                  <Bell size={17} />
                </div>

                <div>
                  <h3>
                    Verification errors
                  </h3>

                  <p>
                    Get notified when a verification cannot be
                    completed.
                  </p>
                </div>

              </div>


              <label className="settings-toggle">

                <input
                  type="checkbox"
                  checked={
                    settings.verificationErrors
                  }
                  onChange={(event) =>
                    updateSetting(
                      "verificationErrors",
                      event.target.checked
                    )
                  }
                />

                <span />

              </label>

            </div>

          </div>

        </section>


        {/* =================================================
           APPEARANCE
        ================================================= */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div className="settings-section-icon">
              <Sun size={17} />
            </div>

            <div>
              <h2>
                Appearance
              </h2>

              <p>
                Choose how TruthLens looks on your device.
              </p>
            </div>

          </div>


          <div className="settings-card">

            <div className="settings-row">

              <div className="settings-row-content">

                <div className="settings-row-icon">

                  {settings.theme === "light" ? (
                    <Sun size={17} />
                  ) : (
                    <Moon size={17} />
                  )}

                </div>

                <div>
                  <h3>
                    Theme
                  </h3>

                  <p>
                    Choose your preferred interface appearance.
                  </p>
                </div>

              </div>


              <div className="theme-options">

                <button
                  type="button"
                  className={`theme-option ${
                    settings.theme === "light"
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleThemeChange(
                      "light"
                    )
                  }
                  aria-pressed={
                    settings.theme === "light"
                  }
                >

                  <Sun size={15} />

                  Light

                </button>


                <button
                  type="button"
                  className={`theme-option ${
                    settings.theme === "dark"
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleThemeChange(
                      "dark"
                    )
                  }
                  aria-pressed={
                    settings.theme === "dark"
                  }
                >

                  <Moon size={15} />

                  Dark

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
           PRIVACY & DATA
        ================================================= */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div className="settings-section-icon">
              <Lock size={17} />
            </div>

            <div>
              <h2>
                Privacy & Data
              </h2>

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
                  <h3>
                    Verification history
                  </h3>

                  <p>
                    Manage the verification records stored in your
                    workspace.
                  </p>
                </div>

              </div>


              <button
                type="button"
                className="settings-danger-button"
                onClick={
                  handleClearHistory
                }
                disabled={
                  isClearingHistory
                }
              >
                Clear history
              </button>

            </div>

          </div>


          {/* ---------------------------------------------
             RESULT MESSAGE
          --------------------------------------------- */}

          {clearHistoryMessage && (
            <p
              className={`settings-history-message ${
                clearHistoryMessage.includes(
                  "failed"
                ) ||
                clearHistoryMessage.includes(
                  "Failed"
                )
                  ? "is-error"
                  : "is-success"
              }`}
            >
              {clearHistoryMessage}
            </p>
          )}

        </section>


        {/* =================================================
           CLEAR HISTORY CONFIRMATION MODAL
        ================================================= */}

        {showClearConfirmation && (

          <div
            className="settings-confirm-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-history-title"
          >

            <div className="settings-confirm-modal">

              <div className="settings-confirm-icon">
                <Database size={19} />
              </div>


              <h2 id="clear-history-title">
                Clear verification history?
              </h2>


              <p>
                This will remove your saved verification records.
                This action cannot be undone.
              </p>


              <div className="settings-confirm-actions">

                <button
                  type="button"
                  className="settings-cancel-button"
                  onClick={
                    cancelClearHistory
                  }
                  disabled={
                    isClearingHistory
                  }
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="settings-confirm-danger"
                  onClick={
                    confirmClearHistory
                  }
                  disabled={
                    isClearingHistory
                  }
                >

                  {isClearingHistory
                    ? "Clearing..."
                    : "Clear history"}

                </button>

              </div>

            </div>

          </div>

        )}


        {/* =================================================
           FOOTER
        ================================================= */}

        <footer className="settings-footer">

          <span>
            TruthLens
          </span>

          <span>
            Digital trust & evidence verification
          </span>

        </footer>

      </div>
    </div>
  );
}