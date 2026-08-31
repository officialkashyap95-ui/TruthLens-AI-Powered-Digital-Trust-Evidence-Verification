const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateVerificationId = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `TL-${year}-${randomNumber}`;
};

const analyzeContent = async ({ type, content }) => {
  const startTime = Date.now();

  if (type !== "text") {
    throw new Error(
      "Only text verification is currently supported."
    );
  }

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",
        content: `
You are the TruthLens verification engine.

Analyze the user's claim carefully.

Return ONLY valid JSON with this structure:

{
  "verdict": "Likely True" | "Likely Misleading" | "Likely False" | "Insufficient Evidence",
  "confidence": number,
  "summary": "short explanation",
  "analysis": [
    {
      "title": "Claim Consistency",
      "description": "..."
    },
    {
      "title": "Source Credibility",
      "description": "..."
    },
    {
      "title": "Evidence Agreement",
      "description": "..."
    },
    {
      "title": "Context Analysis",
      "description": "..."
    }
  ],
  "evidence": [],
  "sourcesAnalyzed": 0
}

Rules:
- confidence must be between 0 and 100.
- Do not invent URLs or sources.
- If you cannot reliably verify the claim, use "Insufficient Evidence".
- Keep the explanation concise.
- Evidence must be an empty array unless reliable source information is actually available.
`,
      },
      {
        role: "user",
        content: content.trim(),
      },
    ],
  });

  const text = response.output_text;

  let result;

  try {
    result = JSON.parse(text);
  } catch (error) {
    console.error("OpenAI returned invalid JSON:", text);
    throw new Error("Verification engine returned invalid data.");
  }

  const processingTime = `${(
    (Date.now() - startTime) /
    1000
  ).toFixed(2)} seconds`;

  return {
    ...result,
    processingTime,
    verificationId: generateVerificationId(),
  };
};

module.exports = {
  analyzeContent,
};