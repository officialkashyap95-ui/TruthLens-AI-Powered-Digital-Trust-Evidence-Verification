const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzeWithGroq = async ({
  content,
  source = "",
  evidence = [],
}) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",

    messages: [
      {
        role: "system",
        content: `
You are the TruthLens evidence verification engine.

Evaluate claims using ONLY the evidence supplied to you.

Return ONLY valid JSON.

Rules:

- Never invent facts.
- Never invent sources.
- Never invent URLs.
- Never treat the claim itself as evidence.
- If evidence is insufficient, return "Insufficient Evidence".
- Confidence must be between 0 and 100.
- Confidence represents confidence in the verdict.
- Do not assume that keyword similarity means factual agreement.
- Separate supporting, contradicting and contextual evidence.
- Keep explanations concise.

JSON structure:

{
  "verdict": "Likely True",
  "confidence": 0,
  "summary": "",
  "analysis": [
    {
      "title": "Claim Consistency",
      "description": ""
    },
    {
      "title": "Source Credibility",
      "description": ""
    },
    {
      "title": "Evidence Agreement",
      "description": ""
    },
    {
      "title": "Context Analysis",
      "description": ""
    }
  ],
  "evidence": [],
  "sourcesAnalyzed": 0
}

Allowed verdicts:

Likely True
Likely Misleading
Likely False
Insufficient Evidence
        `,
      },

      {
        role: "user",
        content: `
CLAIM:
${content}

USER PROVIDED SOURCE:
${source || "No source URL provided."}

AVAILABLE EVIDENCE:
${JSON.stringify(evidence, null, 2)}
        `,
      },
    ],

    temperature: 0.1,

    response_format: {
      type: "json_object",
    },
  });

  const text =
    response.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error(
      "Groq returned an empty response."
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      "Groq returned invalid verification data."
    );
  }
};

module.exports = {
  analyzeWithGroq,
};