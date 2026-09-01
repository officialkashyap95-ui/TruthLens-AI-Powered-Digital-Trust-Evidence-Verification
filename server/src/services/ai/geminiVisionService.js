const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================================================
   GEMINI VISION IMAGE ANALYSIS
========================================================= */

const analyzeImageWithGemini = async ({
  buffer,
  mimetype,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error(
      "Image buffer is missing."
    );
  }

  if (!mimetype) {
    throw new Error(
      "Image MIME type is missing."
    );
  }

  /*
   * Convert image to base64.
   */
  const base64Image =
    buffer.toString("base64");

  /*
   * Ask Gemini to analyze what is
   * actually visible in the image.
   *
   * IMPORTANT:
   * The model must NOT claim that an
   * image is definitely real or fake.
   */

  const prompt = `
You are the visual analysis component of TruthLens,
an AI-powered digital trust and evidence verification platform.

Analyze the uploaded image carefully.

Your job is to identify observable visual evidence.
Do NOT claim that the image is definitely authentic
or definitely fake.

Analyze these areas:

1. IMAGE CONTENT
- Describe what is visibly present.
- Identify important objects, people, scenes, screenshots,
  signs, documents, charts, or other visible elements.

2. TEXT / OCR
- Read any clearly visible text.
- Preserve the wording as accurately as possible.
- If text is unclear, say that it is unclear.
- Do not invent missing words.

3. VISUAL MANIPULATION INDICATORS
Look for observable signs such as:
- inconsistent lighting
- inconsistent shadows
- unnatural edges
- duplicated objects
- distorted geometry
- inconsistent reflections
- strange facial features
- unusual textures
- pasted or composited regions
- inconsistent resolution
- suspicious cropping
- obvious digital overlays

Do not treat normal image compression as proof of manipulation.

4. AI-GENERATED IMAGE INDICATORS
Look for visual characteristics sometimes associated
with AI-generated imagery.

These are indicators only and must never be treated
as definitive proof.

5. IMAGE CONTEXT
Explain what the image appears to represent.

6. AUTHENTICITY LIMITATION
Clearly distinguish between:
- observations
- possible warning indicators
- things that cannot be determined from the image alone.

IMPORTANT RULES:

- Never invent text.
- Never invent facts.
- Never invent sources.
- Never invent URLs.
- Do not assume metadata proves authenticity.
- Do not assume absence of metadata proves manipulation.
- Do not claim 100% certainty.
- Do not identify real people.
- Keep the result concise and explainable.

Return ONLY valid JSON.
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-3.7-flash",

      contents: [
        {
          role: "user",

          parts: [
            {
              inlineData: {
                mimeType: mimetype,
                data: base64Image,
              },
            },

            {
              text: prompt,
            },
          ],
        },
      ],

      config: {
        responseMimeType:
          "application/json",

        responseSchema: {
          type: "object",

          properties: {
            imageDescription: {
              type: "string",
            },

            extractedText: {
              type: "string",
            },

            visualObservations: {
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

            aiGenerationIndicators: {
              type: "array",

              items: {
                type: "string",
              },
            },

            contextAnalysis: {
              type: "string",
            },

            limitations: {
              type: "array",

              items: {
                type: "string",
              },
            },
          },

          required: [
            "imageDescription",
            "extractedText",
            "visualObservations",
            "manipulationIndicators",
            "aiGenerationIndicators",
            "contextAnalysis",
            "limitations",
          ],
        },

        temperature: 0.1,
      },
    });

  const text =
    response.text;

  if (!text) {
    throw new Error(
      "Gemini Vision returned an empty response."
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Gemini Vision invalid JSON:",
      text
    );

    throw new Error(
      "Gemini Vision returned invalid analysis data."
    );
  }
};

module.exports = {
  analyzeImageWithGemini,
};