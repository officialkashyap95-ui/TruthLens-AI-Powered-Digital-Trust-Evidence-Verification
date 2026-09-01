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
  summary: string;

  analysis: AnalysisItem[];
  evidence: Evidence[];

  sourcesAnalyzed: number;
  processingTime: string;

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