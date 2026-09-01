const { GoogleGenAI } = require("@google/genai");

/*
=========================================================
TRUTHLENS GEMINI VISION SERVICE

Purpose:
- Analyze actual image pixels
- Detect visual indicators of AI generation
- Detect visual indicators of manipulation
- Identify visual characteristics consistent with
  authentic photography
- Produce structured evidence for the TruthLens
  Evidence Fusion Engine

IMPORTANT:
This service is a visual evidence generator.

It is NOT a mathematically certain AI-image detector.

The final TruthLens verdict must be produced by the
Evidence Fusion Engine, not by Gemini alone.
=========================================================
*/

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.7-flash";

/* =========================================================
   SCORE LIMITS
========================================================= */

const MIN_SCORE = 0;
const MAX_SCORE = 100;

/* =========================================================
   RESPONSE SCHEMA
========================================================= */

const VISION_SCHEMA = {
  type: "object",

  properties: {
    classification: {
      type: "string",

      enum: [
        "AI_GENERATED",
        "LIKELY_MANIPULATED",
        "LIKELY_AUTHENTIC",
        "UNVERIFIED",
      ],
    },

    aiGeneratedScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },

    manipulationScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },

    visualAuthenticityScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },

    confidence: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },

    summary: {
      type: "string",
    },

    visualIndicators: {
      type: "array",

      items: {
        type: "string",
      },
    },

    manipulationIndicators: {
      type: "array",

      items: {
        type: "string",
      },
    },

    authenticityIndicators: {
      type: "array",

      items: {
        type: "string",
      },
    },

    uncertaintyFactors: {
      type: "array",

      items: {
        type: "string",
      },
    },

    limitations: {
      type: "array",

      items: {
        type: "string",
      },
    },
  },

  required: [
    "classification",
    "aiGeneratedScore",
    "manipulationScore",
    "visualAuthenticityScore",
    "confidence",
    "summary",
    "visualIndicators",
    "manipulationIndicators",
    "authenticityIndicators",
    "uncertaintyFactors",
    "limitations",
  ],
};

/* =========================================================
   CLAMP NUMBER
========================================================= */

const clamp = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    MIN_SCORE,
    Math.min(
      MAX_SCORE,
      Math.round(number)
    )
  );
};

/* =========================================================
   CLEAN STRING ARRAY
========================================================= */

const cleanStringArray = (
  value,
  maxItems = 8
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0
    )
    .map((item) => item.trim())
    .slice(0, maxItems);
};

/* =========================================================
   NORMALIZE RESULT
========================================================= */

const normalizeResult = (result) => {
  const normalized = {
    classification:
      [
        "AI_GENERATED",
        "LIKELY_MANIPULATED",
        "LIKELY_AUTHENTIC",
        "UNVERIFIED",
      ].includes(
        result?.classification
      )
        ? result.classification
        : "UNVERIFIED",

    aiGeneratedScore:
      clamp(
        result?.aiGeneratedScore
      ),

    manipulationScore:
      clamp(
        result?.manipulationScore
      ),

    visualAuthenticityScore:
      clamp(
        result?.visualAuthenticityScore
      ),

    confidence:
      clamp(
        result?.confidence
      ),

    summary:
      typeof result?.summary ===
      "string"
        ? result.summary.trim()
        : "The visual model could not establish a reliable conclusion.",

    visualIndicators:
      cleanStringArray(
        result?.visualIndicators
      ),

    manipulationIndicators:
      cleanStringArray(
        result?.manipulationIndicators
      ),

    authenticityIndicators:
      cleanStringArray(
        result?.authenticityIndicators
      ),

    uncertaintyFactors:
      cleanStringArray(
        result?.uncertaintyFactors
      ),

    limitations:
      cleanStringArray(
        result?.limitations
      ),
  };

  /*
   * Calculate how much visual evidence
   * actually exists.
   *
   * This is NOT the authenticity score.
   *
   * It measures the amount of explainable
   * visual evidence returned by the model.
   */

  const evidenceCount =
    normalized.visualIndicators.length +
    normalized.manipulationIndicators.length +
    normalized.authenticityIndicators.length;

  normalized.evidenceCount =
    evidenceCount;

  /*
   * Evidence quality:
   *
   * More concrete observations = better
   * explainability.
   *
   * This does NOT mean the image is real/fake.
   */

  normalized.evidenceQuality =
    Math.min(
      100,
      evidenceCount * 12
    );

  /*
   * Prevent contradictory model output
   * from producing obviously impossible
   * combinations.
   */

  if (
    normalized.classification ===
      "AI_GENERATED" &&
    normalized.aiGeneratedScore <
      60
  ) {
    normalized.classification =
      "UNVERIFIED";
  }

  if (
    normalized.classification ===
      "LIKELY_MANIPULATED" &&
    normalized.manipulationScore <
      50
  ) {
    normalized.classification =
      "UNVERIFIED";
  }

  if (
    normalized.classification ===
      "LIKELY_AUTHENTIC" &&
    normalized.visualAuthenticityScore <
      55
  ) {
    normalized.classification =
      "UNVERIFIED";
  }

  return normalized;
};

/* =========================================================
   BUILD FORENSIC CONTEXT
========================================================= */

const buildForensicContext = ({
  metadata,
  forensicSignals,
}) => {
  return JSON.stringify(
    {
      metadata:
        metadata || {},

      forensicSignals:
        Array.isArray(
          forensicSignals
        )
          ? forensicSignals
          : [],
    },
    null,
    2
  );
};

/* =========================================================
   BUILD PROMPT
========================================================= */

const buildPrompt = ({
  forensicContext,
}) => {
  return `
You are the visual evidence analysis engine inside TruthLens.

TruthLens is a digital trust and evidence verification platform.

Your task is to analyze the ACTUAL IMAGE PIXELS supplied with this request.

You are NOT the final TruthLens verdict engine.

You are one evidence-producing layer inside a larger Evidence Fusion Engine.

=========================================================
PRIMARY TASK
=========================================================

Evaluate the image for three separate dimensions:

A. AI-GENERATION INDICATORS

Determine whether the visible image contains characteristics
commonly associated with AI-generated imagery.

B. DIGITAL MANIPULATION INDICATORS

Determine whether the visible image contains characteristics
consistent with editing, compositing, cloning, object insertion,
object removal, retouching, or other digital manipulation.

C. VISUAL AUTHENTICITY INDICATORS

Determine whether the visible image has characteristics
consistent with an ordinary photograph.

IMPORTANT:

These are separate dimensions.

An image can be:

- AI-generated without being conventionally "edited"
- a real photograph that was digitally manipulated
- a real photograph that was resized or compressed
- an authentic photograph with metadata removed
- impossible to classify confidently

=========================================================
DO NOT MAKE THESE ERRORS
=========================================================

Never claim:

- 100% authentic
- 100% fake
- absolute proof of AI generation
- absolute proof of manipulation

Do NOT treat:

- missing EXIF as proof of AI generation
- missing metadata as proof of manipulation
- JPEG compression as proof of manipulation
- high resolution as proof of authenticity
- low resolution as proof of manipulation
- filename as evidence
- file extension as evidence
- image quality alone as evidence
- beauty/photorealism alone as evidence

Do NOT invent:

- image source
- photographer
- location
- date
- camera
- website
- provenance
- external evidence

Only analyze what can reasonably be observed from the image.

=========================================================
AI-GENERATION INDICATORS
=========================================================

Look carefully for:

1. Object geometry inconsistencies
2. Impossible or unusual object structure
3. Repeated textures
4. Repeated background patterns
5. Unnatural fine details
6. Synthetic-looking texture
7. Physically inconsistent reflections
8. Physically inconsistent shadows
9. Lighting inconsistencies
10. Perspective inconsistencies
11. Depth inconsistencies
12. Strange object boundaries
13. Distorted text or symbols
14. Unnatural hair/fur
15. Unnatural hands/fingers
16. Anatomical inconsistencies
17. Objects merging together
18. Impossible small details
19. Repeating environmental elements
20. Inconsistent photographic noise

IMPORTANT:

Do not report an indicator unless it is actually visible.

=========================================================
MANIPULATION INDICATORS
=========================================================

Look for:

1. Visible compositing
2. Pasted objects
3. Object removal artifacts
4. Clone/repeated regions
5. Mismatched sharpness
6. Local blur anomalies
7. Inconsistent noise
8. Inconsistent grain
9. Different lighting between regions
10. Different perspective between regions
11. Suspicious boundaries
12. Haloing
13. Edge artifacts
14. Local compression differences
15. Impossible shadows caused by editing
16. Inconsistent reflections

Again:

Only report visible indicators.

=========================================================
AUTHENTICITY INDICATORS
=========================================================

Look for:

1. Coherent lighting
2. Physically plausible shadows
3. Consistent perspective
4. Consistent depth
5. Natural texture variation
6. Consistent photographic noise
7. Natural object boundaries
8. Plausible reflections
9. Consistent focus behavior
10. Natural environmental detail

These indicators support the possibility of a normal photograph.

They do NOT prove authenticity.

=========================================================
IMPORTANT DISTINCTION
=========================================================

AI-GENERATED SCORE:

0
means no meaningful visual indication of AI generation.

100
means very strong visible evidence consistent with AI generation.

MANIPULATION SCORE:

0
means no meaningful visual indication of digital manipulation.

100
means very strong visible evidence consistent with manipulation.

VISUAL AUTHENTICITY SCORE:

0
means little visual evidence consistent with an ordinary photograph.

100
means strong visual characteristics consistent with an ordinary photograph.

CONFIDENCE:

This measures how confident YOU are in the visual assessment.

Do NOT automatically use high confidence.

Use lower confidence when:

- the image is low resolution
- the image is heavily compressed
- visual details are ambiguous
- the image contains little texture
- the suspected artifact is very subtle
- there are conflicting signals
- the evidence is weak

=========================================================
CLASSIFICATION RULES
=========================================================

Use:

AI_GENERATED

ONLY when there are multiple reasonably visible characteristics
consistent with AI generation.

As a guideline, AI_GENERATED normally requires:

- aiGeneratedScore >= 70
- multiple concrete visual indicators
- confidence preferably >= 55

Use:

LIKELY_MANIPULATED

when visible evidence suggests editing or compositing.

As a guideline:

- manipulationScore >= 60
- at least one or more concrete manipulation indicators

Use:

LIKELY_AUTHENTIC

ONLY when the image has strong coherent photographic characteristics
and there are no meaningful visible AI/manipulation indicators.

Do NOT use LIKELY_AUTHENTIC merely because you cannot find evidence of fakery.

Use:

UNVERIFIED

when the evidence is ambiguous, weak, contradictory, or insufficient.

=========================================================
VERY IMPORTANT FOR AI-GENERATED IMAGES
=========================================================

An AI-generated image does not necessarily contain obvious
"editing artifacts".

Therefore:

If the image appears synthetically generated because of
multiple coherent visual indicators, report those indicators
under visualIndicators and increase aiGeneratedScore.

Do NOT lower aiGeneratedScore merely because:

- there is no EXIF
- there is no Photoshop metadata
- the image is technically valid
- the image looks photorealistic

=========================================================
LOCAL FORENSIC CONTEXT
=========================================================

The following information comes from TruthLens's local
file-analysis layer.

Treat it only as contextual evidence.

Do NOT allow metadata alone to determine the visual classification.

${forensicContext}

=========================================================
OUTPUT REQUIREMENTS
=========================================================

Return ONLY JSON matching the supplied schema.

Every indicator should be concise and explain what was observed.

Avoid generic statements such as:

"Looks AI-generated."

Instead use observations such as:

"The fine texture of the grass contains repeated patterns that remain unusually similar across nearby regions."

Only make such a statement if the feature is actually visible.

=========================================================
FINAL PRINCIPLE
=========================================================

TruthLens does not ask:

"Is this definitely real?"

TruthLens asks:

"What evidence in the image supports AI generation,
manipulation, or ordinary photographic origin,
and how strong is that evidence?"

Be conservative, specific, explainable and evidence-based.
`;
};

/* =========================================================
   MAIN GEMINI VISION ANALYSIS
========================================================= */

const analyzeImageWithGeminiVision =
  async ({
    buffer,
    mimetype,
    metadata = {},
    forensicSignals = [],
  }) => {
    /*
     * API KEY CHECK
     */

    if (
      !process.env.GEMINI_API_KEY
    ) {
      throw new Error(
        "GEMINI_API_KEY is not configured."
      );
    }

    /*
     * BUFFER CHECK
     */

    if (
      !Buffer.isBuffer(buffer) ||
      buffer.length === 0
    ) {
      throw new Error(
        "Invalid image buffer supplied to Gemini Vision."
      );
    }

    /*
     * MIME CHECK
     */

    const supportedMimeTypes =
      new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
      ]);

    if (
      !supportedMimeTypes.has(
        mimetype
      )
    ) {
      throw new Error(
        `Unsupported image MIME type for Gemini Vision: ${mimetype}`
      );
    }

    /*
     * BASE64 IMAGE
     */

    const base64Image =
      buffer.toString(
        "base64"
      );

    /*
     * FORENSIC CONTEXT
     */

    const forensicContext =
      buildForensicContext({
        metadata,
        forensicSignals,
      });

    /*
     * PROMPT
     */

    const prompt =
      buildPrompt({
        forensicContext,
      });

    console.log(
      "[Gemini Vision] Starting visual analysis..."
    );

    console.log(
      "[Gemini Vision] Model:",
      MODEL
    );

    console.log(
      "[Gemini Vision] MIME:",
      mimetype
    );

    console.log(
      "[Gemini Vision] Image size:",
      buffer.length,
      "bytes"
    );

    /*
     * GEMINI REQUEST
     */

    const response =
      await ai.models.generateContent({
        model: MODEL,

        contents: [
          {
            inlineData: {
              mimeType:
                mimetype,

              data:
                base64Image,
            },
          },

          {
            text: prompt,
          },
        ],

        config: {
          responseMimeType:
            "application/json",

          responseSchema:
            VISION_SCHEMA,

          thinkingConfig: {
            thinkingLevel:
              "medium",
          },
        },
      });

    /*
     * RESPONSE TEXT
     */

    const text =
      response.text;

    if (
      !text ||
      typeof text !== "string"
    ) {
      throw new Error(
        "Gemini Vision returned an empty response."
      );
    }

    /*
     * PARSE JSON
     */

    let parsed;

    try {
      parsed =
        JSON.parse(text);
    } catch (error) {
      console.error(
        "[Gemini Vision] Invalid JSON:"
      );

      console.error(text);

      throw new Error(
        "Gemini Vision returned invalid JSON."
      );
    }

    /*
     * NORMALIZE
     */

    const result =
      normalizeResult(
        parsed
      );

    /*
     * LOG RESULT
     */

    console.log("");
    console.log(
      "========== GEMINI VISION RESULT =========="
    );

    console.log(
      "Classification:",
      result.classification
    );

    console.log(
      "AI Generated:",
      result.aiGeneratedScore
    );

    console.log(
      "Manipulation:",
      result.manipulationScore
    );

    console.log(
      "Visual Authenticity:",
      result.visualAuthenticityScore
    );

    console.log(
      "Confidence:",
      result.confidence
    );

    console.log(
      "Evidence Count:",
      result.evidenceCount
    );

    console.log(
      "Evidence Quality:",
      result.evidenceQuality
    );

    console.log(
      "Summary:",
      result.summary
    );

    console.log(
      "=========================================="
    );

    /*
     * RETURN
     */

    return result;
  };

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  analyzeImageWithGeminiVision,
};