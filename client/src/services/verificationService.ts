export type VerificationType =
  | "text"
  | "image"
  | "video"
  | "document";

export interface VerificationRequest {
  type: VerificationType;
  content: string;
  source?: string;
}

export interface Evidence {
  type: "supporting" | "contradicting" | "context";
  title: string;
  domain: string;
  description: string;
  url?: string;
}

export interface AnalysisItem {
  title: string;
  description: string;
}

export interface Verification {
  verificationId: string;
  userId?: string;

  type: VerificationType;
  content: string;
  source?: string;

  verdict: string;
  confidence: number;
  riskScore?: number;
  summary: string;

  analysis: AnalysisItem[];
  evidence: Evidence[];

  sourcesAnalyzed: number;
  processingTime: string;

  fileHash?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  imageFormat?: string;

  metadata?: {
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
  };

  signals?: {
    name: string;
    score: number;
    status: string;
    description: string;
  }[];

  createdAt?: string;
  updatedAt?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  verification?: Verification;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001";

/* =========================================================
   TEXT VERIFICATION
========================================================= */

export const createVerification = async (
  data: VerificationRequest
): Promise<VerificationResponse> => {
  const response = await fetch(
    `${API_URL}/api/verifications`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  const result: VerificationResponse =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Verification failed."
    );
  }

  return result;
};


/* =========================================================
   IMAGE VERIFICATION
========================================================= */

export const createImageVerification = async (
  file: File,
  source?: string
): Promise<VerificationResponse> => {

  const formData = new FormData();

  /*
   * Backend expects:
   * type=image
   * file=<uploaded image>
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
   * Optional source URL.
   */

  if (source?.trim()) {
    formData.append(
      "source",
      source.trim()
    );
  }

  const response = await fetch(
    `${API_URL}/api/verifications`,
    {
      method: "POST",

      /*
       * IMPORTANT:
       * Do NOT manually set Content-Type here.
       *
       * Browser automatically creates:
       *
       * multipart/form-data;
       * boundary=...
       *
       * Multer needs that boundary.
       */

      body: formData,
    }
  );

  const result: VerificationResponse =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Image verification failed."
    );
  }

  return result;
};


/* =========================================================
   GET VERIFICATION
========================================================= */

export const getVerification = async (
  verificationId: string
): Promise<Verification> => {

  const response = await fetch(
    `${API_URL}/api/verifications/${encodeURIComponent(
      verificationId
    )}`
  );

  const result: VerificationResponse =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to load verification."
    );
  }

  if (!result.verification) {
    throw new Error(
      "Verification result was not returned."
    );
  }

  return result.verification;
};