const analyzeWithOpenRouter = async ({
  content,
  source = "",
  evidence = [],
}) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured."
    );
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization:
          `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },

      body: JSON.stringify({
        model: "openrouter/free",

        messages: [
          {
            role: "system",

            content: `
You are the TruthLens evidence verification engine.

Evaluate the submitted claim ONLY using the supplied evidence.

Return ONLY valid JSON.

Never invent:
- facts
- sources
- URLs
- evidence

If the available evidence is insufficient, use:

"Insufficient Evidence"

Confidence must be between 0 and 100.

Allowed verdicts:

Likely True
Likely Misleading
Likely False
Insufficient Evidence

Return:

{
  "verdict": "",
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
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `OpenRouter ${response.status}: ${errorText}`
    );
  }

  const data =
    await response.json();

  const text =
    data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error(
      "OpenRouter returned an empty response."
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      "OpenRouter returned invalid verification data."
    );
  }
};

module.exports = {
  analyzeWithOpenRouter,
};