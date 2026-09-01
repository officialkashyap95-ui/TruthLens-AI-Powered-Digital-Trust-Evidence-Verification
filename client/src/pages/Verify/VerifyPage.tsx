import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    ShieldCheck,
    X,
} from "lucide-react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import VerificationTabs, {
    type VerificationType,
} from "../../components/verification/VerificationTabs";

import TextVerifier from "../../components/verification/TextVerifier";
import FileUploader from "../../components/verification/FileUploader";
import AnalysisProgress from "../../components/verification/AnalysisProgress";
import VerificationInfo from "../../components/verification/VerificationInfo";

import {
    createVerification,
    createImageVerification,
} from "../../services/verificationService";

import "./Verify.css";

export default function VerifyPage() {
    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const [type, setType] =
        useState<VerificationType>("text");

    const [text, setText] =
        useState("");

    const [source, setSource] =
        useState("");

    const [file, setFile] =
        useState<File | null>(null);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    /*
     * Read verification type from URL.
     */
    useEffect(() => {
        const queryType =
            searchParams.get("type") as
            | VerificationType
            | null;

        if (
            queryType &&
            [
                "text",
                "image",
                "video",
                "document",
            ].includes(queryType)
        ) {
            setType(queryType);
        }
    }, [searchParams]);

    /*
     * Change verification type.
     */
    const handleTypeChange = (
        nextType: VerificationType
    ) => {
        setType(nextType);

        setFile(null);
        setText("");
        setSource("");
        setError("");
    };

    /*
     * Submit verification.
     */
    const handleSubmit = async () => {
        setError("");

        /*
         * =========================
         * TEXT VALIDATION
         * =========================
         */
        if (
            type === "text" &&
            !text.trim()
        ) {
            setError(
                "Enter content before starting the analysis."
            );

            return;
        }

        /*
         * =========================
         * FILE VALIDATION
         * =========================
         */
        if (
            type !== "text" &&
            !file
        ) {
            setError(
                `Select a ${type} before starting the analysis.`
            );

            return;
        }

        setLoading(true);

        try {
            let result;

            /*
             * =========================
             * TEXT VERIFICATION
             * =========================
             */
            if (type === "text") {
                result =
                    await createVerification({
                        type: "text",

                        content:
                            text.trim(),

                        source:
                            source.trim(),
                    });
            }

            /*
             * =========================
             * FILE VERIFICATION
             * =========================
             */
            else {
                /*
                 * At the moment the backend
                 * supports image verification.
                 *
                 * Video/document will remain
                 * unavailable until their backend
                 * services are implemented.
                 */
                if (type !== "image") {
                    throw new Error(
                        `${type.charAt(0).toUpperCase() +
                        type.slice(1)
                        } verification is coming soon.`
                    );
                }

                result =
                    await createImageVerification(
                        file!,
                        source.trim()
                    );
            }

            /*
             * =========================
             * VALIDATE RESULT
             * =========================
             */
            if (
                !result.verification
            ) {
                throw new Error(
                    "Verification was created but no result was returned."
                );
            }

            /*
             * =========================
             * GET VERIFICATION ID
             * =========================
             */
            const verificationId =
                result.verification
                    .verificationId;

            if (!verificationId) {
                throw new Error(
                    "Verification ID was not returned by the server."
                );
            }

            /*
             * =========================
             * GO TO RESULT PAGE
             * =========================
             */
            navigate(
                `/result/${verificationId}`
            );

        } catch (err) {
            console.error(
                "Verification error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while analyzing the content."
            );

            setLoading(false);
        }
    };

    return (
        <div className="verify-shell">

            {/* =========================
          HEADER
      ========================== */}

            <header className="verify-nav">

                <div className="verify-nav-inner">

                    {/* Brand */}
                    <a
                        href="/"
                        className="verify-brand"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <span className="text-sm font-bold">TL</span>
                        </div>

                        TruthLens
                    </a>

                    {/* Navigation */}
                    <nav className="verify-links">

                        <a href="/#how-it-works">
                            How It Works
                        </a>

                        <a href="/#capabilities">
                            Capabilities
                        </a>

                        <a href="/#evidence">
                            Evidence
                        </a>

                        <a href="/#about">
                            About
                        </a>

                    </nav>

                    {/* Actions */}
                    <div className="verify-nav-actions">

                        <a href="/dashboard">
                            Dashboard
                        </a>

                        <a
                            href="/verify"
                            className="verify-nav-cta"
                        >
                            Verify Content
                        </a>

                    </div>

                </div>

            </header>

            {/* =========================
          MAIN
      ========================== */}

            <main className="verify-main">

                {/* Heading */}
                <motion.div
                    className="verify-heading"
                    initial={{
                        opacity: 0,
                        y: 8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.4,
                    }}
                >

                    <span className="verify-eyebrow">
                        TRUST & EVIDENCE VERIFICATION
                    </span>

                    <h1>
                        Verify Digital Content
                    </h1>

                    <p>
                        Analyze claims, images, videos,
                        and documents using multiple
                        evidence signals to assess
                        their credibility and authenticity.
                    </p>

                </motion.div>

                {/* =========================
            WORKSPACE
        ========================== */}

                <section
                    className="verify-workspace"
                    aria-label="Verification workspace"
                >

                    <VerificationTabs
                        selected={type}
                        onChange={
                            handleTypeChange
                        }
                    />

                    <AnimatePresence mode="wait">

                        {/* Loading */}
                        {loading ? (

                            <AnalysisProgress
                                key="progress"
                                type={
                                    type.charAt(0).toUpperCase() +
                                    type.slice(1)
                                }
                            />

                        ) : (

                            <motion.div
                                key={type}
                                className="input-panel"
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -8,
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                            >

                                {/* =====================
                    TEXT
                ====================== */}

                                {type === "text" ? (

                                    <TextVerifier
                                        text={text}
                                        source={source}
                                        onTextChange={
                                            setText
                                        }
                                        onSourceChange={
                                            setSource
                                        }
                                    />

                                ) : (

                                    /* =====================
                                       FILE
                                    ====================== */

                                    <div className="file-area">

                                        {file ? (

                                            <div className="file-selected">

                                                <div className="file-symbol">
                                                    <ShieldCheck
                                                        size={22}
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {file.name}
                                                    </strong>

                                                    <small>
                                                        {file.type ||
                                                            "Uploaded file"}

                                                        {" · "}

                                                        {(
                                                            file.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}

                                                        {" MB"}
                                                    </small>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFile(null)
                                                    }
                                                    aria-label="Remove file"
                                                >
                                                    <X size={17} />
                                                </button>

                                            </div>

                                        ) : (

                                            <FileUploader
                                                type={type}
                                                file={file}
                                                onFileChange={
                                                    setFile
                                                }
                                            />

                                        )}

                                    </div>

                                )}

                                {/* Error */}
                                {error && (

                                    <p
                                        className="verify-error"
                                        role="alert"
                                    >
                                        {error}
                                    </p>

                                )}

                                {/* Analyze */}
                                <button
                                    type="button"
                                    className="analyze-button"
                                    disabled={
                                        type === "text"
                                            ? !text.trim()
                                            : !file
                                    }
                                    onClick={
                                        handleSubmit
                                    }
                                >

                                    Analyze{" "}

                                    {type
                                        .charAt(0)
                                        .toUpperCase() +
                                        type.slice(1)}

                                    <ArrowRight
                                        size={16}
                                    />

                                </button>

                            </motion.div>

                        )}

                    </AnimatePresence>

                </section>

                <VerificationInfo />

            </main>

        </div>
    );
}
