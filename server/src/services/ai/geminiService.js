const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const VERIFICATION_SCHEMA = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: [
        "Likely True",
        "Likely Misleading",
        "Likely False",
        "Insufficient Evidence",
      ],
    },

    confidence: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },

    summary: {
      type: "string",
    },

    analysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
        },
        required: ["title", "description"],
      },
    },

    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "supporting",
              "contradicting",
              "context",
            ],
          },
          title: {
            type: "string",
          },
          domain: {
            type: "string",
          },
          description: {
            type: "string",
          },
          url: {
            type: "string",
          },
        },
        required: [
          "type",
          "title",
          "domain",
          "description",
          "url",
        ],
      },
    },

    sourcesAnalyzed: {
      type: "integer",
      minimum: 0,
    },
  },

  required: [
    "verdict",
    "confidence",
    "summary",
    "analysis",
    "evidence",
    "sourcesAnalyzed",
  ],
};

const analyzeWithGemini = async ({
  content,
  source = "",
  evidence = [],
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const evidenceText =
    evidence.length > 0
      ? JSON.stringify(evidence, null, 2)
      : "No external evidence was found.";

  const prompt = `
You are the TruthLens evidence verification engine.

Your job is NOT to guess whether a claim is true.

You must evaluate the submitted claim ONLY against the evidence provided below.

IMPORTANT RULES:

1. Never invent facts.
2. Never invent sources.
3. Never invent URLs.
4. Never treat the user's claim itself as evidence.
5. If the evidence does not adequately support or contradict the claim, return "Insufficient Evidence".
6. Distinguish between:
   - evidence supporting the claim
   - evidence contradicting the claim
   - contextual information
7. Confidence represents confidence in the VERDICT, not the importance of the claim.
8. Do not give high confidence merely because many words overlap.
9. A source being Wikipedia does not automatically make a claim true.
10. If a provided source is available, evaluate it separately from external evidence.
11. Keep the explanation concise and understandable.
12. Return ONLY the requested JSON structure.

CLAIM:
${content}

USER PROVIDED SOURCE:
${source || "No source URL provided."}

AVAILABLE EVIDENCE:
${evidenceText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",

    contents: prompt,

    config: {
      responseMimeType: "application/json",
      responseSchema: VERIFICATION_SCHEMA,
      temperature: 0.1,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini invalid JSON:", text);

    throw new Error(
      "Gemini returned invalid verification data."
    );
  }
};

module.exports = {
  analyzeWithGemini,
};