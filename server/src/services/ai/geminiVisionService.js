const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");

/*
|--------------------------------------------------------------------------
| TruthLens Vision AI Provider Router
|--------------------------------------------------------------------------
|
| Provider order:
|
|   1. Groq Qwen 3.6 / 3.8
|   2. OpenRouter Free
|   3. Gemini 3.6 Flash
|
| The exported function name intentionally remains:
|
|   analyzeImageWithGeminiVision
|
| so the existing verificationController.js does not need to change.
|
|--------------------------------------------------------------------------
*/

// ============================================================================
// CONFIGURATION
// ============================================================================

const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
];

const OPENROUTER_MODEL = "openrouter/free";

const GEMINI_MODEL =
  "gemini-3.8-flash";
  
const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";


// ============================================================================
// CLIENTS
// ============================================================================

const groq =
  process.env.GROQ_API_KEY
    ? new Groq({
        apiKey: process.env.GROQ_API_KEY,
      })
    : null;

const gemini =
  process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      })
    : null;


// ============================================================================
// VISION PROMPT
// ============================================================================

const VISION_PROMPT = `
You are the visual-analysis component of TruthLens,
an evidence-verification system.

Analyze the supplied image carefully.

Your job is NOT to blindly declare an image AI-generated.

Instead, examine visible evidence such as:

1. AI-generation indicators
   - unnatural textures
   - distorted objects
   - malformed text
   - inconsistent details
   - strange hands/fingers
   - repeated patterns
   - unnatural lighting
   - inconsistent reflections
   - impossible geometry
   - synthetic-looking facial details
   - unusual background structures

2. Image-manipulation indicators
   - visible editing artifacts
   - inconsistent edges
   - cloning/repetition
   - pasted objects
   - inconsistent lighting
   - inconsistent shadows
   - warped regions
   - blending artifacts
   - suspicious local regions

3. Authenticity indicators
   - coherent lighting
   - consistent geometry
   - natural textures
   - physically plausible shadows
   - consistent perspective
   - coherent details

4. Uncertainty
   - limitations caused by image resolution
   - inability to inspect source history
   - inability to prove provenance from pixels alone
   - ambiguous visual evidence

IMPORTANT:

Do not use the filename as evidence.

Do not assume an image is AI-generated simply because it looks polished.

Do not claim certainty when visual evidence is insufficient.

Return ONLY a JSON object.

Use exactly this structure:

{
  "classification": "AI_GENERATED | LIKELY_MANIPULATED | LIKELY_AUTHENTIC | UNVERIFIED",
  "aiGeneratedScore": 0,
  "manipulationScore": 0,
  "visualAuthenticityScore": 0,
  "confidence": 0,
  "summary": "",
  "visualIndicators": [],
  "manipulationIndicators": [],
  "authenticityIndicators": [],
  "uncertaintyFactors": [],
  "limitations": []
}

Scoring:

aiGeneratedScore:
0 = no meaningful visible evidence
100 = very strong visible evidence of AI generation

manipulationScore:
0 = no meaningful manipulation evidence
100 = very strong visible evidence of manipulation

visualAuthenticityScore:
0 = no meaningful authenticity evidence
100 = strong visible consistency with an authentic image

confidence:
0 = essentially no confidence
100 = very high confidence

Use integers from 0 to 100.

Be conservative.

Pixel-level visual analysis cannot establish provenance with certainty.
`;


// ============================================================================
// GENERIC HELPERS
// ============================================================================

function safeString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}


// ----------------------------------------------------------------------------
// Remove markdown code fences and extract JSON
// ----------------------------------------------------------------------------

function parseVisionJson(rawText) {
  if (!rawText) {
    throw new Error("Vision provider returned an empty response.");
  }

  let text = safeString(rawText).trim();

  // Remove markdown code fences.
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First attempt: entire response is JSON.
  try {
    return JSON.parse(text);
  } catch (error) {
    // Continue to extraction below.
  }

  // Second attempt:
  // Find the first { and last }.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    const possibleJson = text.slice(
      firstBrace,
      lastBrace + 1
    );

    try {
      return JSON.parse(possibleJson);
    } catch (error) {
      throw new Error(
        "Vision provider returned invalid JSON."
      );
    }
  }

  throw new Error(
    "Vision provider returned a response that could not be parsed as JSON."
  );
}


// ----------------------------------------------------------------------------
// Clamp number between 0 and 100
// ----------------------------------------------------------------------------

function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(number))
  );
}


// ----------------------------------------------------------------------------
// Normalize arrays
// ----------------------------------------------------------------------------

function normalizeArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => safeString(item).trim())
    .filter(Boolean);
}


// ----------------------------------------------------------------------------
// Normalize provider response
// ----------------------------------------------------------------------------

function normalizeProviderResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error(
      "Vision provider returned an invalid object."
    );
  }

  const validClassifications = [
    "AI_GENERATED",
    "LIKELY_MANIPULATED",
    "LIKELY_AUTHENTIC",
    "UNVERIFIED",
  ];

  const classification =
    validClassifications.includes(
      result.classification
    )
      ? result.classification
      : "UNVERIFIED";

  return {
    classification,

    aiGeneratedScore: clampScore(
      result.aiGeneratedScore
    ),

    manipulationScore: clampScore(
      result.manipulationScore
    ),

    visualAuthenticityScore: clampScore(
      result.visualAuthenticityScore
    ),

    confidence: clampScore(
      result.confidence
    ),

    summary:
      safeString(result.summary).trim() ||
      "Visual analysis completed.",

    visualIndicators: normalizeArray(
      result.visualIndicators
    ),

    manipulationIndicators: normalizeArray(
      result.manipulationIndicators
    ),

    authenticityIndicators: normalizeArray(
      result.authenticityIndicators
    ),

    uncertaintyFactors: normalizeArray(
      result.uncertaintyFactors
    ),

    limitations: normalizeArray(
      result.limitations
    ),
  };
}


// ----------------------------------------------------------------------------
// Extract text from OpenRouter response
// ----------------------------------------------------------------------------

function extractOpenRouterText(data) {
  const content =
    data?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  // Some providers may return content as an array.
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part?.type === "text") {
          return part.text || "";
        }

        return "";
      })
      .join("\n");
  }

  return "";
}


// ----------------------------------------------------------------------------
// Convert image buffer to data URL
// ----------------------------------------------------------------------------

function createImageDataUrl(buffer, mimetype) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error(
      "Image buffer is missing or invalid."
    );
  }

  if (!mimetype) {
    throw new Error(
      "Image MIME type is missing."
    );
  }

  return (
    `data:${mimetype};base64,` +
    buffer.toString("base64")
  );
}


// ============================================================================
// GROQ VISION
// ============================================================================

async function analyzeWithGroqVision({
  buffer,
  mimetype,
  originalname,
}) {
  if (!groq) {
    throw new Error(
      "GROQ_API_KEY is not configured."
    );
  }

  const imageDataUrl =
    createImageDataUrl(
      buffer,
      mimetype
    );

  const errors = [];

  console.log(
    `[Vision] Image: ${originalname || "unknown"}`
  );

  console.log(
    `[Vision] Size: ${buffer.length} bytes`
  );

  for (const model of GROQ_MODELS) {
    try {
      console.log(
        `[Vision] Trying Groq: ${model}`
      );

      const completion =
        await groq.chat.completions.create({
          model,

          messages: [
            {
              role: "user",

              content: [
                {
                  type: "text",
                  text: VISION_PROMPT,
                },

                {
                  type: "image_url",

                  image_url: {
                    url: imageDataUrl,
                  },
                },
              ],
            },
          ],

          temperature: 0.1,

          max_completion_tokens: 2000,

          // Groq Qwen vision models support JSON mode.
          response_format: {
            type: "json_object",
          },
        });

      const content =
        completion?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(
          "Groq returned an empty response."
        );
      }

      const parsed =
        parseVisionJson(content);

      const normalized =
        normalizeProviderResult(parsed);

      console.log(
        `[Vision] Groq succeeded: ${model}`
      );

      return normalized;
    } catch (error) {
      const message =
        error?.message ||
        safeString(error);

      console.error(
        `[Vision] Groq ${model} failed: ${message}`
      );

      errors.push({
        provider: model,
        error: message,
      });
    }
  }

  throw new Error(
    `All Groq vision models failed: ${JSON.stringify(
      errors
    )}`
  );
}


// ============================================================================
// OPENROUTER VISION
// ============================================================================

async function analyzeWithOpenRouterVision({
  buffer,
  mimetype,
  originalname,
}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured."
    );
  }

  const imageDataUrl =
    createImageDataUrl(
      buffer,
      mimetype
    );

  console.log(
    `[Vision] Trying OpenRouter: ${OPENROUTER_MODEL}`
  );

  const response = await fetch(
    OPENROUTER_URL,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${process.env.OPENROUTER_API_KEY}`,

        "Content-Type":
          "application/json",

        "HTTP-Referer":
          "http://localhost:5173",

        "X-Title":
          "TruthLens",
      },

      body: JSON.stringify({
        model: OPENROUTER_MODEL,

        messages: [
          {
            role: "user",

            content: [
              {
                type: "text",
                text: VISION_PROMPT,
              },

              {
                type: "image_url",

                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],

        temperature: 0.1,

        max_tokens: 2000,

        /*
         * IMPORTANT:
         *
         * Do NOT use:
         *
         * response_format: {
         *   type: "json_object"
         * }
         *
         * here.
         *
         * openrouter/free dynamically chooses a free provider/model.
         * Some selected vision models do not support structured outputs.
         *
         * We therefore ask for JSON in the prompt and parse it ourselves.
         */
      }),
    }
  );

  const rawText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenRouter ${response.status}: ${rawText}`
    );
  }

  let data;

  try {
    data = JSON.parse(rawText);
  } catch (error) {
    throw new Error(
      `OpenRouter returned invalid HTTP JSON: ${rawText.slice(
        0,
        1000
      )}`
    );
  }

  const content =
    extractOpenRouterText(data);

  if (!content) {
    throw new Error(
      "OpenRouter returned no message content."
    );
  }

  const parsed =
    parseVisionJson(content);

  const normalized =
    normalizeProviderResult(parsed);

  console.log(
    "[Vision] OpenRouter Free succeeded."
  );

  return normalized;
}


// ============================================================================
// GEMINI VISION
// ============================================================================

async function analyzeWithGeminiVision({
  buffer,
  mimetype,
  originalname,
}) {
  if (!gemini) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const base64Image =
    buffer.toString("base64");

  console.log(
    `[Vision] Trying Gemini: ${GEMINI_MODEL}`
  );

  const response =
    await gemini.models.generateContent({
      model: GEMINI_MODEL,

      contents: [
        {
          text: VISION_PROMPT,
        },

        {
          inlineData: {
            mimeType: mimetype,
            data: base64Image,
          },
        },
      ],

      config: {
        temperature: 0.1,

        responseMimeType:
          "application/json",
      },
    });

  const content =
    response?.text;

  if (!content) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  const parsed =
    parseVisionJson(content);

  const normalized =
    normalizeProviderResult(parsed);

  console.log(
    `[Vision] Gemini succeeded: ${GEMINI_MODEL}`
  );

  return normalized;
}


// ============================================================================
// MAIN PROVIDER ROUTER
// ============================================================================

async function analyzeImageWithGeminiVision({
  buffer,
  mimetype,
  originalname,
  metadata = null,
  forensicSignals = null,
}) {
  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "TruthLens Vision Provider Router"
  );
  console.log(
    "========================================"
  );

  const providers = [];

  if (groq) {
    providers.push({
      name: "Groq Qwen Vision",

      analyze: () =>
        analyzeWithGroqVision({
          buffer,
          mimetype,
          originalname,
        }),
    });
  } else {
    console.log(
      "[Vision] Groq skipped: GROQ_API_KEY missing."
    );
  }

  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: "OpenRouter Free",

      analyze: () =>
        analyzeWithOpenRouterVision({
          buffer,
          mimetype,
          originalname,
        }),
    });
  } else {
    console.log(
      "[Vision] OpenRouter skipped: OPENROUTER_API_KEY missing."
    );
  }

  if (gemini) {
    providers.push({
      name: "Gemini 3.6 Flash",

      analyze: () =>
        analyzeWithGeminiVision({
          buffer,
          mimetype,
          originalname,
        }),
    });
  } else {
    console.log(
      "[Vision] Gemini skipped: GEMINI_API_KEY missing."
    );
  }

  if (providers.length === 0) {
    throw new Error(
      "No vision provider is configured. Add GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY."
    );
  }

  const errors = [];

  for (const provider of providers) {
    try {
      console.log("");
      console.log(
        `[Vision] Attempting ${provider.name}...`
      );

      const result =
        await provider.analyze();

      console.log(
        `[Vision] Provider succeeded: ${provider.name}`
      );

      console.log(
        "========================================"
      );
      console.log("");

      return result;
    } catch (error) {
      const message =
        error?.message ||
        safeString(error);

      console.error(
        `[Vision] ${provider.name} failed: ${message}`
      );

      errors.push({
        provider: provider.name,
        error: message,
      });
    }
  }

  console.error(
    "[Vision] All vision providers failed."
  );

  console.error(
    JSON.stringify(errors, null, 2)
  );

  console.log(
    "========================================"
  );
  console.log("");

  throw new Error(
    `All vision providers failed: ${JSON.stringify(
      errors
    )}`
  );
}


// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  analyzeImageWithGeminiVision,
};