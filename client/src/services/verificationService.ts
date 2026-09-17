/* =========================================================
   VERIFICATION TYPES
========================================================= */

export type VerificationType =
  | "text"
  | "image"
  | "video"
  | "document";


/* =========================================================
   VERIFICATION REQUEST
========================================================= */

export interface VerificationRequest {
  type: VerificationType;
  content: string;
  source?: string;
}


/* =========================================================
   EVIDENCE
========================================================= */

export interface Evidence {
  type:
    | "supporting"
    | "contradicting"
    | "context";

  title: string;

  domain: string;

  description: string;

  url?: string;
}


/* =========================================================
   ANALYSIS ITEM
========================================================= */

export interface AnalysisItem {
  title: string;
  description: string;
}


/* =========================================================
   IMAGE FILE INFORMATION
========================================================= */

export interface VerificationFile {
  originalName?: string;

  mimeType?: string;

  sizeBytes?: number;

  sizeMB?: number;

  format?: string;

  sha256?: string;
}


/* =========================================================
   IMAGE METADATA
========================================================= */

export interface VerificationMetadata {
  filename?: string;

  mimeType?: string;

  format?: string;

  sizeBytes?: number;

  sizeMB?: number;

  hasMetadata?: boolean;

  hasExif?: boolean;

  hasJfif?: boolean;

  hasIccProfile?: boolean;

  hasPhotoshopMetadata?: boolean;

  hasXmp?: boolean;

  cameraMake?: string;

  cameraModel?: string;

  software?: string;

  dateTime?: string;

  aiGenerator?: string;
}


/* =========================================================
   FORENSIC SIGNAL
========================================================= */

export interface VerificationSignal {
  name: string;

  category?: string;

  score: number;

  reliability?: number;

  status: string;

  description: string;
}


/* =========================================================
   VISUAL AI ANALYSIS
========================================================= */

export interface VisualAnalysis {
  available?: boolean;

  manipulationScore?:
    | number
    | null;

  aiGeneratedScore?:
    | number
    | null;

  visualAuthenticityScore?:
    | number
    | null;

  confidence?: number;

  verdict?: string;

  findings?: string[];

  manipulationIndicators?: string[];

  authenticityIndicators?: string[];

  limitations?: string[];

  evidenceQuality?: number;
}


/* =========================================================
   EVIDENCE FUSION
========================================================= */

export interface VerificationFusion {
  forensicRisk?: number;

  visualRisk?:
    | number
    | null;

  evidenceQuality?: number;

  independentSignals?: number;
}


/* =========================================================
   IMAGE PROPERTIES
========================================================= */

export interface ImageProperties {
  width?: number;

  height?: number;

  channels?: number;

  colorSpace?: string;

  depth?: string;

  hasAlpha?: boolean;

  orientation?:
    | number
    | null;

  density?:
    | number
    | null;

  format?: string;

  pages?: number;

  isAnimated?: boolean;

  megapixels?: number;
}


/* =========================================================
   MAIN VERIFICATION
========================================================= */

export interface Verification {
  verificationId: string;

  userId?: string;

  type: VerificationType;

  content: string;

  source?: string;

  /* -------------------------------------------------------
     FINAL TRUTHLENS ASSESSMENT
  ------------------------------------------------------- */

  verdict: string;

  label?: string;

  confidence: number;

  riskScore?: number;

  summary: string;

  /* -------------------------------------------------------
     EXPLAINABILITY
  ------------------------------------------------------- */

  analysis: AnalysisItem[];

  evidence: Evidence[];

  /* -------------------------------------------------------
     PROCESSING
  ------------------------------------------------------- */

  sourcesAnalyzed: number;

  processingTime: string;

  /* -------------------------------------------------------
     FLAT FILE FIELDS
  ------------------------------------------------------- */

  fileHash?: string;

  fileName?: string;

  mimeType?: string;

  fileSize?: number;

  imageFormat?: string;

  /* -------------------------------------------------------
     ACTUAL BACKEND FILE OBJECT
  ------------------------------------------------------- */

  file?: VerificationFile;

  /* -------------------------------------------------------
     IMAGE PROPERTIES
  ------------------------------------------------------- */

  imageProperties?: ImageProperties;

  /* -------------------------------------------------------
     METADATA
  ------------------------------------------------------- */

  metadata?: VerificationMetadata;

  /* -------------------------------------------------------
     FORENSIC SIGNALS
  ------------------------------------------------------- */

  signals?: VerificationSignal[];

  /* -------------------------------------------------------
     GEMINI / VISUAL ANALYSIS
  ------------------------------------------------------- */

  visualAnalysis?: VisualAnalysis;

  /* -------------------------------------------------------
     EVIDENCE FUSION
  ------------------------------------------------------- */

  fusion?: VerificationFusion;

  /* -------------------------------------------------------
     TIMESTAMPS
  ------------------------------------------------------- */

  createdAt?: string;

  updatedAt?: string;
}


/* =========================================================
   API RESPONSE
========================================================= */

export interface VerificationResponse {
  success: boolean;

  message: string;

  verification?: Verification;

  data?: Verification;

  settings?: UserSettings;
}


/* =========================================================
   VERIFICATION HISTORY RESPONSE
========================================================= */

export interface VerificationHistoryResponse {
  success: boolean;

  message: string;

  count: number;

  verifications: Verification[];
}


/* =========================================================
   USER SETTINGS
========================================================= */

export interface UserSettings {
  userId: string;

  saveHistory: boolean;

  showConfidence: boolean;

  showEvidence: boolean;

  verificationCompleted: boolean;

  verificationErrors: boolean;

  theme: "light" | "dark";

  createdAt?: string;

  updatedAt?: string;
}


/* =========================================================
   SETTINGS RESPONSE
========================================================= */

export interface SettingsResponse {
  success: boolean;

  message: string;

  settings: UserSettings;
}


/* =========================================================
   UPDATE SETTINGS REQUEST
========================================================= */

export interface UpdateSettingsRequest {
  saveHistory?: boolean;

  showConfidence?: boolean;

  showEvidence?: boolean;

  verificationCompleted?: boolean;

  verificationErrors?: boolean;

  theme?: "light" | "dark";
}


/* =========================================================
   API URL
========================================================= */

/*
 * Local development:
 *
 * VITE_API_URL=http://localhost:5001
 *
 * Production:
 *
 * VITE_API_URL=https://truthlens-ai-powered-digital-trust-3kwt.onrender.com
 */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001";


/* =========================================================
   HELPER
========================================================= */

/*
 * Safely parse JSON.
 *
 * This prevents the frontend from crashing if the backend
 * returns HTML/text instead of JSON.
 */

const parseJsonResponse = async (
  response: Response
) => {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }
};


/* =========================================================
   NORMALIZE VERIFICATION
========================================================= */

const normalizeVerification = (
  verification: Verification
): Verification => {
  const normalized: Verification = {
    ...verification,
  };


  /* -------------------------------------------------------
     FILE
  ------------------------------------------------------- */

  if (verification.file) {
    normalized.fileHash =
      verification.file.sha256 ??
      verification.fileHash;

    normalized.fileName =
      verification.file.originalName ??
      verification.fileName;

    normalized.mimeType =
      verification.file.mimeType ??
      verification.mimeType;

    normalized.fileSize =
      verification.file.sizeBytes ??
      verification.fileSize;

    normalized.imageFormat =
      verification.file.format ??
      verification.imageFormat;
  }


  /* -------------------------------------------------------
     SOURCES
  ------------------------------------------------------- */

  normalized.sourcesAnalyzed =
    verification.sourcesAnalyzed ??
    verification.evidence?.length ??
    0;


  /* -------------------------------------------------------
     ANALYSIS
  ------------------------------------------------------- */

  normalized.analysis =
    Array.isArray(
      verification.analysis
    )
      ? verification.analysis
      : [];


  /* -------------------------------------------------------
     EVIDENCE
  ------------------------------------------------------- */

  normalized.evidence =
    Array.isArray(
      verification.evidence
    )
      ? verification.evidence
      : [];


  /* -------------------------------------------------------
     SUMMARY
  ------------------------------------------------------- */

  normalized.summary =
    verification.summary ||
    "No verification summary was provided.";


  return normalized;
};


/* =========================================================
   TEXT VERIFICATION
========================================================= */

export const createVerification = async (
  data: VerificationRequest
): Promise<VerificationResponse> => {
  try {
    const response =
      await fetch(
        `${API_URL}/api/verifications`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(data),
        }
      );


    const result =
      await parseJsonResponse(
        response
      ) as VerificationResponse | null;


    /*
     * Always log the raw response so the actual
     * server payload is visible in the browser
     * console, regardless of which check below
     * ends up failing.
     */
    console.log(
      "[TruthLens] POST /api/verifications ->",
      "status:",
      response.status,
      "body:",
      result
    );


    if (
      !response.ok ||
      !result?.success
    ) {
      throw new Error(
        result?.message ||
        `Verification failed (${response.status}).`
      );
    }


    if (
      !result.verification
    ) {
      throw new Error(
        `Server responded successfully but the "verification" field was missing from the response. Raw response: ${JSON.stringify(
          result
        )}`
      );
    }


    result.verification =
      normalizeVerification(
        result.verification
      );


    return result;

  } catch (error) {
    console.error(
      "[TruthLens] Text verification error:",
      error
    );

    throw error;
  }
};


/* =========================================================
   IMAGE VERIFICATION
========================================================= */

export const createImageVerification = async (
  file: File,
  source?: string
): Promise<VerificationResponse> => {

  /* -------------------------------------------------------
     VALIDATE FILE
  ------------------------------------------------------- */

  if (!file) {
    throw new Error(
      "Please select an image."
    );
  }


  /* -------------------------------------------------------
     ALLOWED TYPES
  ------------------------------------------------------- */

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Unsupported image type. Please upload JPG, PNG, or WEBP."
    );
  }


  /* -------------------------------------------------------
     MAX SIZE
  ------------------------------------------------------- */

  const maxSize =
    10 * 1024 * 1024;


  if (
    file.size > maxSize
  ) {
    throw new Error(
      "Image exceeds the maximum allowed size of 10 MB."
    );
  }


  /* -------------------------------------------------------
     FORM DATA
  ------------------------------------------------------- */

  const formData =
    new FormData();


  formData.append(
    "type",
    "image"
  );


  formData.append(
    "file",
    file
  );


  if (
    source?.trim()
  ) {
    formData.append(
      "source",
      source.trim()
    );
  }


  /* -------------------------------------------------------
     REQUEST
  ------------------------------------------------------- */

  try {
    console.log(
      "[TruthLens] Uploading image:",
      file.name
    );


    const response =
      await fetch(
        `${API_URL}/api/verifications`,
        {
          method: "POST",

          /*
           * Do NOT manually set Content-Type.
           *
           * The browser creates the multipart boundary.
           */

          body:
            formData,
        }
      );


    const result =
      await parseJsonResponse(
        response
      ) as VerificationResponse | null;


    if (
      !response.ok ||
      !result?.success
    ) {
      throw new Error(
        result?.message ||
        `Image verification failed (${response.status}).`
      );
    }


    if (
      result.verification
    ) {
      result.verification =
        normalizeVerification(
          result.verification
        );
    }


    console.log(
      "[TruthLens] Image verification response:",
      result
    );


    if (
      result.verification
    ) {
      console.log(
        "[TruthLens] Final verdict:",
        result.verification.verdict
      );

      console.log(
        "[TruthLens] Confidence:",
        result.verification.confidence
      );

      console.log(
        "[TruthLens] Risk:",
        result.verification.riskScore
      );

      console.log(
        "[TruthLens] Visual analysis:",
        result.verification.visualAnalysis
      );

      console.log(
        "[TruthLens] Fusion:",
        result.verification.fusion
      );
    }


    return result;

  } catch (error) {
    console.error(
      "[TruthLens] Image verification error:",
      error
    );

    throw error;
  }
};


/* =========================================================
   GET SINGLE VERIFICATION
========================================================= */

export const getVerification = async (
  verificationId: string
): Promise<Verification> => {

  if (
    !verificationId?.trim()
  ) {
    throw new Error(
      "Verification ID is missing."
    );
  }


  try {
    const response =
      await fetch(
        `${API_URL}/api/verifications/${encodeURIComponent(
          verificationId
        )}`
      );


    const result =
      await parseJsonResponse(
        response
      ) as VerificationResponse | null;


    if (
      !response.ok ||
      !result?.success
    ) {
      throw new Error(
        result?.message ||
        `Failed to load verification (${response.status}).`
      );
    }


    const verification =
      result.verification ||
      result.data;


    if (!verification) {
      throw new Error(
        "Verification result was not returned."
      );
    }


    const normalized =
      normalizeVerification(
        verification
      );


    console.log(
      "[TruthLens] Loaded verification:",
      normalized
    );


    return normalized;

  } catch (error) {
    console.error(
      "[TruthLens] Get verification error:",
      error
    );

    throw error;
  }
};


/* =========================================================
   GET VERIFICATION HISTORY
========================================================= */

export const getVerificationHistory =
  async (): Promise<Verification[]> => {
    try {
      console.log(
        "[TruthLens] Loading verification history..."
      );


      const response =
        await fetch(
          `${API_URL}/api/verifications/history`
        );


      const result =
        (await parseJsonResponse(
          response
        )) as VerificationHistoryResponse | null;


      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          `Failed to load verification history (${response.status}).`
        );
      }


      const verifications =
        Array.isArray(
          result.verifications
        )
          ? result.verifications
          : [];


      console.log(
        "[TruthLens] History records:",
        verifications.length
      );


      return verifications.map(
        normalizeVerification
      );

    } catch (error) {
      console.error(
        "[TruthLens] Get verification history error:",
        error
      );

      throw error;
    }
  };


/* =========================================================
   CLEAR VERIFICATION HISTORY
========================================================= */

export const clearVerificationHistory =
  async (): Promise<number> => {
    try {
      console.log(
        "[TruthLens] Clearing verification history..."
      );


      const response =
        await fetch(
          `${API_URL}/api/verifications/history`,
          {
            method: "DELETE",
          }
        );


      const result =
        (await parseJsonResponse(
          response
        )) as {
          success: boolean;
          message: string;
          deletedCount?: number;
        } | null;


      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          `Failed to clear verification history (${response.status}).`
        );
      }


      const deletedCount =
        result.deletedCount ?? 0;


      console.log(
        "[TruthLens] History cleared:",
        deletedCount
      );


      return deletedCount;

    } catch (error) {
      console.error(
        "[TruthLens] Clear verification history error:",
        error
      );

      throw error;
    }
  };


/* =========================================================
   GET USER SETTINGS
========================================================= */

export const getSettings =
  async (): Promise<UserSettings> => {
    try {
      console.log(
        "[TruthLens] Loading user settings..."
      );


      const response =
        await fetch(
          `${API_URL}/api/settings`
        );


      const result =
        (await parseJsonResponse(
          response
        )) as SettingsResponse | null;


      if (
        !response.ok ||
        !result?.success ||
        !result.settings
      ) {
        throw new Error(
          result?.message ||
          `Failed to load settings (${response.status}).`
        );
      }


      console.log(
        "[TruthLens] Settings loaded:",
        result.settings
      );


      return result.settings;

    } catch (error) {
      console.error(
        "[TruthLens] Get settings error:",
        error
      );

      throw error;
    }
  };


/* =========================================================
   UPDATE USER SETTINGS
========================================================= */

export const updateSettings =
  async (
    settings: UpdateSettingsRequest
  ): Promise<UserSettings> => {
    try {
      console.log(
        "[TruthLens] Updating settings:",
        settings
      );


      const response =
        await fetch(
          `${API_URL}/api/settings`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                settings
              ),
          }
        );


      const result =
        (await parseJsonResponse(
          response
        )) as SettingsResponse | null;


      if (
        !response.ok ||
        !result?.success ||
        !result.settings
      ) {
        throw new Error(
          result?.message ||
          `Failed to update settings (${response.status}).`
        );
      }


      console.log(
        "[TruthLens] Settings updated:",
        result.settings
      );


      return result.settings;

    } catch (error) {
      console.error(
        "[TruthLens] Update settings error:",
        error
      );

      throw error;
    }
  };