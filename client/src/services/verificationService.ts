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


  /*
   * FINAL TRUTHLENS ASSESSMENT
   */

  verdict: string;

  label?: string;

  confidence: number;

  riskScore?: number;

  summary: string;


  /*
   * EXPLAINABILITY
   */

  analysis: AnalysisItem[];

  evidence: Evidence[];


  /*
   * PROCESSING
   */

  sourcesAnalyzed: number;

  processingTime: string;


  /*
   * FLAT FILE FIELDS
   *
   * Kept for compatibility with existing UI.
   */

  fileHash?: string;

  fileName?: string;

  mimeType?: string;

  fileSize?: number;

  imageFormat?: string;


  /*
   * ACTUAL BACKEND FILE OBJECT
   */

  file?: VerificationFile;


  /*
   * IMAGE PROPERTIES
   */

  imageProperties?: ImageProperties;


  /*
   * METADATA
   */

  metadata?: VerificationMetadata;


  /*
   * FORENSIC SIGNALS
   */

  signals?: VerificationSignal[];


  /*
   * GEMINI / VISUAL ANALYSIS
   */

  visualAnalysis?: VisualAnalysis;


  /*
   * EVIDENCE FUSION
   */

  fusion?: VerificationFusion;


  /*
   * TIMESTAMPS
   */

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

  /*
   * Some backend implementations may return
   * the analysis directly as data.
   *
   * This keeps the service flexible while
   * the backend is being integrated.
   */

  data?: Verification;
}


/* =========================================================
   API URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://truthlens-ai-powered-digital-trust-3kwt.onrender.com";


/* =========================================================
   HELPER
========================================================= */

/*
 * Safely parse JSON.
 *
 * This prevents the frontend from crashing
 * if the backend returns HTML/text instead of JSON.
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

/*
 * Converts the backend TruthLens image result
 * into the frontend Verification shape.
 *
 * This is especially useful because the image
 * engine returns:
 *
 * file.sha256
 * file.originalName
 * file.format
 *
 * instead of:
 *
 * fileHash
 * fileName
 * imageFormat
 */

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
      result.verification
    ) {

      result.verification =
        normalizeVerification(
          result.verification
        );
    }


    return result;

  } catch (error) {

    console.error(
      "Text verification error:",
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

  /*
   * Validate file before sending.
   */

  if (!file) {

    throw new Error(
      "Please select an image."
    );
  }


  /*
   * Frontend safety check.
   *
   * Backend remains the authoritative validator.
   */

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


  /*
   * Backend limit is 10 MB.
   */

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


  /*
   * Backend expects:
   *
   * type=image
   * file=<image>
   */

  formData.append(
    "type",
    "image"
  );


  formData.append(
    "file",
    file
  );


  /*
   * Optional source.
   */

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
           * IMPORTANT:
           *
           * Do NOT set Content-Type manually.
           *
           * Browser automatically creates:
           *
           * multipart/form-data;
           * boundary=...
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


    /*
     * Normalize the actual backend result.
     */

    if (
      result.verification
    ) {

      result.verification =
        normalizeVerification(
          result.verification
        );
    }


    /*
     * Debugging information.
     *
     * This is useful right now because
     * we need to confirm what the backend
     * actually returns.
     */

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
   GET VERIFICATION
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


    /*
     * Backend should return:
     *
     * {
     *   success: true,
     *   verification: {...}
     * }
     */

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


    /*
     * Useful while integrating.
     */

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