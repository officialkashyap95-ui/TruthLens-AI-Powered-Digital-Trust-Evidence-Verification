const crypto = require("crypto");
const sharp = require("sharp");

/*
=========================================================
 TRUTHLENS IMAGE VERIFICATION ENGINE
=========================================================

Layers:

1. File validation
2. SHA-256 fingerprint
3. Binary format validation
4. Image structure / properties
5. Metadata / provenance
6. AI-generation metadata indicators
7. Compression / file indicators
8. Gemini Vision analysis
9. Evidence quality calculation
10. Evidence fusion
11. Explainable verdict

IMPORTANT:

- No single signal proves an image is fake.
- Missing metadata is NOT proof of manipulation.
- Gemini confidence is NOT the same thing as TruthLens confidence.
- AI-generated score is treated separately from manipulation score.
- "Verified" is intentionally difficult to reach.
- "Unverified" is preferred when evidence is insufficient.
=========================================================
*/


/* ========================================================
   CONSTANTS
======================================================== */

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);


/* ========================================================
   HASH
======================================================== */

const generateFileHash = (buffer) => {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");
};


/* ========================================================
   FORMAT DETECTION
======================================================== */

const detectImageFormat = (buffer) => {
  if (!buffer || buffer.length < 12) {
    return "unknown";
  }

  // JPEG
  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpeg";
  }

  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  // WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return "unknown";
};


/* ========================================================
   SEARCHABLE IMAGE TEXT
======================================================== */

const getSearchableImageText = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return "";
  }

  /*
   * Metadata is commonly located near the beginning
   * of image files.
   *
   * Limit inspection to 4 MB.
   */

  return buffer
    .subarray(
      0,
      Math.min(buffer.length, 4 * 1024 * 1024)
    )
    .toString("latin1");
};


/* ========================================================
   AI GENERATOR DEFINITIONS
======================================================== */

const AI_GENERATORS = [
  {
    name: "Midjourney",
    patterns: [
      "midjourney",
    ],
  },

  {
    name: "DALL-E",
    patterns: [
      "dall-e",
      "dalle",
    ],
  },

  {
    name: "Stable Diffusion",
    patterns: [
      "stable diffusion",
      "stablediffusion",
      "automatic1111",
    ],
  },

  {
    name: "ComfyUI",
    patterns: [
      "comfyui",
    ],
  },

  {
    name: "Adobe Firefly",
    patterns: [
      "adobe firefly",
      "firefly",
    ],
  },

  {
    name: "Leonardo AI",
    patterns: [
      "leonardo ai",
      "leonardo.ai",
    ],
  },

  {
    name: "Flux",
    patterns: [
      "flux.1",
      "black-forest-labs",
    ],
  },

  {
    name: "Ideogram",
    patterns: [
      "ideogram",
    ],
  },

  {
    name: "DreamStudio",
    patterns: [
      "dreamstudio",
    ],
  },

  {
    name: "Bing Image Creator",
    patterns: [
      "bing image creator",
    ],
  },
];


/* ========================================================
   JPEG METADATA
======================================================== */

const extractJpegMetadata = (buffer) => {
  const metadata = {
    hasExif: false,
    hasJfif: false,
    hasIccProfile: false,
    hasPhotoshop: false,
    hasXmp: false,

    cameraMake: "",
    cameraModel: "",
    software: "",
    dateTime: "",

    aiGenerator: "",
  };

  if (!buffer || buffer.length < 4) {
    return metadata;
  }

  const text = getSearchableImageText(buffer);
  const lowerText = text.toLowerCase();


  /* ------------------------------------------------------
     EXIF
  ------------------------------------------------------ */

  metadata.hasExif =
    lowerText.includes("exif");


  /* ------------------------------------------------------
     JFIF
  ------------------------------------------------------ */

  metadata.hasJfif =
    lowerText.includes("jfif");


  /* ------------------------------------------------------
     ICC PROFILE
  ------------------------------------------------------ */

  metadata.hasIccProfile =
    lowerText.includes("icc_profile") ||
    lowerText.includes("icc profile");


  /* ------------------------------------------------------
     PHOTOSHOP
  ------------------------------------------------------ */

  metadata.hasPhotoshop =
    lowerText.includes("photoshop") ||
    lowerText.includes("8bim");


  /* ------------------------------------------------------
     XMP
  ------------------------------------------------------ */

  metadata.hasXmp =
    lowerText.includes("xmpmeta") ||
    lowerText.includes("ns.adobe.com/xap") ||
    lowerText.includes("ns.adobe.com/photoshop");


  /* ------------------------------------------------------
     CAMERA MANUFACTURERS
  ------------------------------------------------------ */

  const cameraManufacturers = [
    "Canon",
    "Nikon",
    "SONY",
    "FUJIFILM",
    "Panasonic",
    "Olympus",
    "Leica",
    "Samsung",
    "Apple",
    "Google",
    "DJI",
    "GoPro",
  ];

  for (const manufacturer of cameraManufacturers) {
    if (
      lowerText.includes(
        manufacturer.toLowerCase()
      )
    ) {
      metadata.cameraMake = manufacturer;
      break;
    }
  }


  /* ------------------------------------------------------
     EDITING SOFTWARE
  ------------------------------------------------------ */

  const editingSoftware = [
    "Adobe Photoshop",
    "Adobe Lightroom",
    "GIMP",
    "Snapseed",
    "Canva",
    "PicsArt",
    "Pixelmator",
  ];

  for (const software of editingSoftware) {
    if (
      lowerText.includes(
        software.toLowerCase()
      )
    ) {
      metadata.software = software;
      break;
    }
  }


  /* ------------------------------------------------------
     AI GENERATOR INDICATORS
  ------------------------------------------------------ */

  for (const generator of AI_GENERATORS) {
    const found = generator.patterns.some(
      (pattern) =>
        lowerText.includes(
          pattern.toLowerCase()
        )
    );

    if (found) {
      metadata.aiGenerator =
        generator.name;

      break;
    }
  }


  /* ------------------------------------------------------
     DATE
  ------------------------------------------------------ */

  const dateMatch = text.match(
    /20\d{2}[-:]\d{2}[-:]\d{2}/
  );

  if (dateMatch) {
    metadata.dateTime =
      dateMatch[0];
  }

  return metadata;
};


/* ========================================================
   GENERAL METADATA
======================================================== */

const extractMetadata = async ({
  buffer,
  mimetype,
  originalname,
}) => {

  const format =
    detectImageFormat(buffer);

  const metadata = {
    filename:
      originalname || "",

    mimeType:
      mimetype || "",

    format,

    sizeBytes:
      buffer.length,

    sizeMB:
      Number(
        (
          buffer.length /
          1024 /
          1024
        ).toFixed(2)
      ),

    hasExif: false,
    hasJfif: false,
    hasIccProfile: false,
    hasPhotoshopMetadata: false,
    hasXmp: false,

    cameraMake: "",
    cameraModel: "",
    software: "",
    dateTime: "",

    aiGenerator: "",

    hasMetadata: false,
  };


  /*
   * First inspect binary metadata.
   */

  try {

    const image =
      sharp(buffer);

    const info =
      await image.metadata();


    /*
     * Sharp may expose EXIF / ICC / XMP related data.
     */

    metadata.hasExif =
      Boolean(info.exif);

    metadata.hasIccProfile =
      Boolean(info.icc);

    metadata.hasXmp =
      Boolean(info.xmp);


    /*
     * Image format metadata can still be
     * supplemented by raw binary inspection.
     */

  } catch (error) {

    console.warn(
      "[Metadata] Sharp metadata extraction failed:",
      error.message
    );
  }


  /*
   * JPEG-specific raw metadata.
   */

  if (format === "jpeg") {

    const jpegMetadata =
      extractJpegMetadata(buffer);

    metadata.hasExif =
      metadata.hasExif ||
      jpegMetadata.hasExif;

    metadata.hasJfif =
      jpegMetadata.hasJfif;

    metadata.hasIccProfile =
      metadata.hasIccProfile ||
      jpegMetadata.hasIccProfile;

    metadata.hasPhotoshopMetadata =
      jpegMetadata.hasPhotoshop;

    metadata.hasXmp =
      metadata.hasXmp ||
      jpegMetadata.hasXmp;

    metadata.cameraMake =
      jpegMetadata.cameraMake;

    metadata.cameraModel =
      jpegMetadata.cameraModel;

    metadata.software =
      jpegMetadata.software;

    metadata.dateTime =
      jpegMetadata.dateTime;

    metadata.aiGenerator =
      jpegMetadata.aiGenerator;
  }


  /*
   * PNG / WEBP raw indicator search.
   */

  if (
    format === "png" ||
    format === "webp"
  ) {

    const text =
      getSearchableImageText(
        buffer
      );

    const lowerText =
      text.toLowerCase();


    for (
      const generator
      of AI_GENERATORS
    ) {

      const found =
        generator.patterns.some(
          (pattern) =>
            lowerText.includes(
              pattern.toLowerCase()
            )
        );

      if (found) {

        metadata.aiGenerator =
          generator.name;

        break;
      }
    }


    metadata.hasXmp =
      metadata.hasXmp ||
      lowerText.includes("xmpmeta") ||
      lowerText.includes("ns.adobe.com/xap");


    metadata.hasIccProfile =
      metadata.hasIccProfile ||
      lowerText.includes("icc_profile") ||
      lowerText.includes("icc profile");
  }


  /*
   * JFIF alone does NOT count as meaningful provenance.
   */

  metadata.hasMetadata =
    metadata.hasExif ||
    metadata.hasIccProfile ||
    metadata.hasPhotoshopMetadata ||
    metadata.hasXmp ||
    Boolean(metadata.cameraMake) ||
    Boolean(metadata.cameraModel) ||
    Boolean(metadata.software) ||
    Boolean(metadata.dateTime);


  return metadata;
};


/* ========================================================
   IMAGE PROPERTIES
======================================================== */

const extractImageProperties = async (
  buffer
) => {

  try {

    const image =
      sharp(buffer);

    const info =
      await image.metadata();

    return {

      width:
        info.width || 0,

      height:
        info.height || 0,

      channels:
        info.channels || 0,

      colorSpace:
        info.space || "",

      depth:
        info.depth || "",

      hasAlpha:
        Boolean(info.hasAlpha),

      orientation:
        info.orientation || null,

      density:
        info.density || null,

      format:
        info.format || "",

      pages:
        info.pages || 1,

      isAnimated:
        Boolean(
          info.pages &&
          info.pages > 1
        ),

      megapixels:
        info.width &&
        info.height
          ? Number(
              (
                (info.width *
                  info.height) /
                1000000
              ).toFixed(2)
            )
          : 0,
    };

  } catch (error) {

    console.error(
      "Image property extraction failed:",
      error.message
    );

    return {

      width: 0,
      height: 0,
      channels: 0,
      colorSpace: "",
      depth: "",
      hasAlpha: false,
      orientation: null,
      density: null,
      format: "",
      pages: 1,
      isAnimated: false,
      megapixels: 0,
    };
  }
};


/* ========================================================
   VALIDATION
======================================================== */

const validateImage = ({
  buffer,
  mimetype,
  originalname,
}) => {

  if (
    !buffer ||
    !Buffer.isBuffer(buffer)
  ) {

    throw new Error(
      "Uploaded image data is missing."
    );
  }


  if (buffer.length === 0) {

    throw new Error(
      "Uploaded image is empty."
    );
  }


  if (
    buffer.length >
    MAX_IMAGE_SIZE
  ) {

    throw new Error(
      "Image exceeds the maximum allowed size of 10 MB."
    );
  }


  if (
    !ALLOWED_MIME_TYPES.has(
      mimetype
    )
  ) {

    throw new Error(
      "Unsupported image type. Only JPG, PNG, and WEBP are supported."
    );
  }


  const format =
    detectImageFormat(buffer);


  if (format === "unknown") {

    throw new Error(
      "The uploaded file does not appear to be a valid JPG, PNG, or WEBP image."
    );
  }


  const expectedFormat =
    mimetype === "image/jpeg"
      ? "jpeg"
      : mimetype === "image/png"
      ? "png"
      : mimetype === "image/webp"
      ? "webp"
      : "";


  if (
    expectedFormat &&
    format !== expectedFormat
  ) {

    throw new Error(
      "Image MIME type does not match the actual file format."
    );
  }


  if (originalname) {

    const lastDot =
      originalname.lastIndexOf(".");

    if (lastDot !== -1) {

      const extension =
        originalname
          .toLowerCase()
          .slice(lastDot);

      if (
        !ALLOWED_EXTENSIONS.has(
          extension
        )
      ) {

        throw new Error(
          "Image filename extension is not supported."
        );
      }
    }
  }


  return true;
};


/* ========================================================
   FORENSIC SIGNALS
======================================================== */

const analyzeForensicSignals = ({
  buffer,
  metadata,
  properties,
}) => {

  const signals = [];


  /* ------------------------------------------------------
     SIGNAL 1 — FILE STRUCTURE
  ------------------------------------------------------ */

  if (
    properties.width > 0 &&
    properties.height > 0
  ) {

    signals.push({

      name:
        "Image Structure",

      category:
        "structure",

      score: 0,

      reliability: 0.95,

      status:
        "normal",

      description:
        `The image has a valid ${properties.width} × ${properties.height} pixel structure.`,
    });

  } else {

    signals.push({

      name:
        "Image Structure",

      category:
        "structure",

      score: 30,

      reliability: 0.95,

      status:
        "warning",

      description:
        "The image dimensions could not be reliably extracted.",
    });
  }


  /* ------------------------------------------------------
     SIGNAL 2 — METADATA
  ------------------------------------------------------ */

  if (metadata.hasMetadata) {

    signals.push({

      name:
        "Metadata Availability",

      category:
        "provenance",

      score: 0,

      reliability: 0.45,

      status:
        "normal",

      description:
        "Detectable metadata is present and may provide provenance context. Metadata can be modified.",
    });

  } else {

    signals.push({

      name:
        "Metadata Availability",

      category:
        "provenance",

      score: 0,

      reliability: 0.30,

      status:
        "info",

      description:
        "No significant provenance metadata was detected. Missing metadata is common after screenshots, downloads, compression, messaging, or editing.",
    });
  }


  /* ------------------------------------------------------
     SIGNAL 3 — EXIF
  ------------------------------------------------------ */

  if (metadata.hasExif) {

    signals.push({

      name:
        "EXIF Data",

      category:
        "provenance",

      score: 0,

      reliability: 0.55,

      status:
        "normal",

      description:
        "EXIF metadata is available and may provide provenance context. EXIF itself can be modified.",
    });
  }


  /* ------------------------------------------------------
     SIGNAL 4 — EDITING SOFTWARE
  ------------------------------------------------------ */

  if (metadata.software) {

    signals.push({

      name:
        "Editing Software Metadata",

      category:
        "editing",

      score: 15,

      reliability: 0.50,

      status:
        "warning",

      description:
        `Metadata contains an indicator associated with ${metadata.software}. This suggests the file passed through editing software, but does not prove visual manipulation.`,
    });
  }


  /* ------------------------------------------------------
     SIGNAL 5 — AI GENERATOR METADATA
  ------------------------------------------------------ */

  if (metadata.aiGenerator) {

    signals.push({

      name:
        "AI Generation Metadata",

      category:
        "ai-provenance",

      score: 70,

      reliability: 0.90,

      status:
        "warning",

      description:
        `Metadata contains an indicator associated with ${metadata.aiGenerator}. This is strong provenance evidence that the file may have been generated or processed using an AI image-generation system.`,
    });
  }


  /* ------------------------------------------------------
     SIGNAL 6 — COMPRESSION
  ------------------------------------------------------ */

  const sizeKB =
    buffer.length / 1024;


  if (
    sizeKB < 20 &&
    properties.megapixels >= 2
  ) {

    signals.push({

      name:
        "Compression Indicator",

      category:
        "compression",

      score: 5,

      reliability: 0.20,

      status:
        "info",

      description:
        "The image is relatively small compared with its pixel dimensions. This may indicate resizing or compression, but it is not a strong manipulation indicator.",
    });

  } else {

    signals.push({

      name:
        "Compression Indicator",

      category:
        "compression",

      score: 0,

      reliability: 0.20,

      status:
        "normal",

      description:
        "No strong compression warning was identified from file size and dimensions.",
    });
  }


  /* ------------------------------------------------------
     SIGNAL 7 — CAMERA PROVENANCE
  ------------------------------------------------------ */

  if (metadata.cameraMake) {

    signals.push({

      name:
        "Camera Provenance",

      category:
        "provenance",

      score: 0,

      reliability: 0.45,

      status:
        "normal",

      description:
        `Camera-related metadata indicates ${metadata.cameraMake}. This provides provenance context but is not proof of authenticity.`,
    });

  } else {

    signals.push({

      name:
        "Camera Provenance",

      category:
        "provenance",

      score: 0,

      reliability: 0.20,

      status:
        "info",

      description:
        "No identifiable camera manufacturer was found in the available metadata.",
    });
  }


  return signals;
};


/* ========================================================
   NORMALIZE GEMINI VISION
======================================================== */

const normalizeVisionResult = (
  visionResult
) => {

  if (!visionResult) {

    return {

      available: false,

      classification:
        "UNVERIFIED",

      aiGeneratedScore:
        null,

      manipulationScore:
        null,

      visualAuthenticityScore:
        null,

      confidence:
        0,

      verdict:
        "Insufficient Evidence",

      findings: [],

      manipulationIndicators: [],

      authenticityIndicators: [],

      limitations: [],

      description:
        "Visual AI analysis was unavailable.",

      evidenceQuality:
        0,
    };
  }


  const clamp = (
    value
  ) => {

    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {

      return null;
    }

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(number)
      )
    );
  };


  const manipulationScore =
    clamp(
      visionResult.manipulationScore
    );


  const aiGeneratedScore =
    clamp(
      visionResult.aiGeneratedScore
    );


  const visualAuthenticityScore =
    clamp(
      visionResult.visualAuthenticityScore
    );


  const confidence =
    clamp(
      visionResult.confidence
    ) ?? 0;


  const classification =
    visionResult.classification ||
    "UNVERIFIED";


  const findings =
    Array.isArray(
      visionResult.visualIndicators
    )
      ? visionResult.visualIndicators
      : [];


  const manipulationIndicators =
    Array.isArray(
      visionResult.manipulationIndicators
    )
      ? visionResult.manipulationIndicators
      : [];


  const authenticityIndicators =
    Array.isArray(
      visionResult.authenticityIndicators
    )
      ? visionResult.authenticityIndicators
      : [];


  const limitations =
    Array.isArray(
      visionResult.limitations
    )
      ? visionResult.limitations
      : [];


  /*
   * Evidence quality.
   */

  let evidenceQuality = 0;


  if (
    manipulationScore !== null
  ) {

    evidenceQuality += 20;
  }


  if (
    aiGeneratedScore !== null
  ) {

    evidenceQuality += 20;
  }


  if (
    visualAuthenticityScore !== null
  ) {

    evidenceQuality += 10;
  }


  if (
    confidence >= 70
  ) {

    evidenceQuality += 25;

  } else if (
    confidence >= 50
  ) {

    evidenceQuality += 18;

  } else if (
    confidence >= 30
  ) {

    evidenceQuality += 8;
  }


  if (
    findings.length >= 3
  ) {

    evidenceQuality += 10;

  } else if (
    findings.length >= 1
  ) {

    evidenceQuality += 5;
  }


  if (
    manipulationIndicators.length >= 2
  ) {

    evidenceQuality += 10;

  } else if (
    manipulationIndicators.length >= 1
  ) {

    evidenceQuality += 5;
  }


  evidenceQuality =
    Math.min(
      100,
      evidenceQuality
    );


  /*
   * Human-readable visual verdict.
   */

  let verdict =
    "Insufficient Evidence";


  switch (
    classification
  ) {

    case "AI_GENERATED":

      verdict =
        "Likely AI Generated";

      break;


    case "LIKELY_MANIPULATED":

      verdict =
        "Likely Manipulated";

      break;


    case "LIKELY_AUTHENTIC":

      verdict =
        "Likely Authentic";

      break;


    case "UNVERIFIED":

    default:

      verdict =
        "Insufficient Evidence";

      break;
  }


  return {

    available:
      true,

    classification,

    aiGeneratedScore,

    manipulationScore,

    score:
      manipulationScore,

    visualAuthenticityScore,

    confidence,

    verdict,

    findings,

    manipulationIndicators,

    authenticityIndicators,

    limitations,

    description:
      visionResult.summary ||
      "Visual AI analysis completed.",

    evidenceQuality,
  };
};


/* ========================================================
   FORENSIC RISK
======================================================== */

const calculateForensicRisk = (
  forensicSignals
) => {

  if (
    !Array.isArray(
      forensicSignals
    ) ||
    forensicSignals.length === 0
  ) {

    return 0;
  }


  const weightedRisk =
    forensicSignals.reduce(
      (total, signal) => {

        if (
          signal.status !==
          "warning"
        ) {

          return total;
        }


        const score =
          Number(
            signal.score || 0
          );


        const reliability =
          Number(
            signal.reliability || 0
          );


        return (
          total +
          score *
            reliability
        );
      },

      0
    );


  return Math.round(
    Math.min(
      100,
      weightedRisk
    )
  );
};


/* ========================================================
   EVIDENCE QUALITY
======================================================== */

const calculateEvidenceQuality = ({
  forensicSignals,
  vision,
}) => {

  let quality = 0;


  /*
   * Structural validation
   */

  const structureSignal =
    forensicSignals.find(
      (signal) =>
        signal.name ===
        "Image Structure"
    );


  if (
    structureSignal &&
    structureSignal.status ===
      "normal"
  ) {

    quality += 20;
  }


  /*
   * Metadata / provenance
   */

  const metadataSignal =
    forensicSignals.find(
      (signal) =>
        signal.name ===
        "Metadata Availability"
    );


  if (
    metadataSignal &&
    metadataSignal.status ===
      "normal"
  ) {

    quality += 15;
  }


  /*
   * AI metadata
   */

  const aiMetadataSignal =
    forensicSignals.find(
      (signal) =>
        signal.name ===
        "AI Generation Metadata"
    );


  if (aiMetadataSignal) {

    quality += 30;
  }


  /*
   * Visual AI
   */

  if (
    vision.available
  ) {

    quality +=
      Math.round(
        vision.evidenceQuality *
          0.35
      );
  }


  return Math.min(
    100,
    Math.round(
      quality
    )
  );
};


/* ========================================================
   EVIDENCE FUSION
======================================================== */

const calculateFusion = ({
  forensicSignals,
  vision,
}) => {

  const forensicRisk =
    calculateForensicRisk(
      forensicSignals
    );


  /*
   * Manipulation risk.
   */

  const manipulationRisk =
    vision.available &&
    Number.isFinite(
      vision.manipulationScore
    )
      ? vision.manipulationScore
      : null;


  /*
   * AI generation risk.
   */

  const aiGenerationRisk =
    vision.available &&
    Number.isFinite(
      vision.aiGeneratedScore
    )
      ? vision.aiGeneratedScore
      : null;


  /*
   * Combine Gemini's two visual dimensions.
   *
   * Manipulation and AI generation are related
   * but NOT identical.
   */

  let visualRisk = null;


  if (
    manipulationRisk !== null &&
    aiGenerationRisk !== null
  ) {

    visualRisk =
      Math.round(
        manipulationRisk * 0.55 +
        aiGenerationRisk * 0.45
      );

  } else if (
    manipulationRisk !== null
  ) {

    visualRisk =
      manipulationRisk;

  } else if (
    aiGenerationRisk !== null
  ) {

    visualRisk =
      aiGenerationRisk;
  }


  /*
   * Gemini classification can provide an
   * additional high-level signal.
   */

  let classificationBoost = 0;


  if (
    vision.classification ===
    "AI_GENERATED" &&
    vision.confidence >= 60
  ) {

    classificationBoost = 10;
  }


  if (
    vision.classification ===
    "LIKELY_MANIPULATED" &&
    vision.confidence >= 60
  ) {

    classificationBoost = 8;
  }


  /*
   * Dynamic fusion.
   */

  let riskScore;


  if (
    visualRisk !== null &&
    vision.confidence >= 70
  ) {

    riskScore =
      forensicRisk * 0.25 +
      visualRisk * 0.75;

  } else if (
    visualRisk !== null &&
    vision.confidence >= 50
  ) {

    riskScore =
      forensicRisk * 0.40 +
      visualRisk * 0.60;

  } else if (
    visualRisk !== null &&
    vision.confidence >= 30
  ) {

    riskScore =
      forensicRisk * 0.60 +
      visualRisk * 0.40;

  } else {

    riskScore =
      forensicRisk;
  }


  /*
   * Classification boost is deliberately small.
   *
   * It cannot independently create a fake verdict.
   */

  riskScore +=
    classificationBoost;


  /*
   * Strong AI metadata can increase the
   * overall risk, but only as provenance evidence.
   */

  const hasAiMetadata =
    forensicSignals.some(
      (signal) =>
        signal.name ===
          "AI Generation Metadata" &&
        signal.status ===
          "warning"
    );


  if (
    hasAiMetadata
  ) {

    riskScore += 8;
  }


  riskScore =
    Math.round(
      Math.max(
        0,
        Math.min(
          100,
          riskScore
        )
      )
    );


  /*
   * Evidence quality.
   */

  const evidenceQuality =
    calculateEvidenceQuality({
      forensicSignals,
      vision,
    });


  /*
   * Overall TruthLens confidence.
   */

  let confidence =
    evidenceQuality;


  /*
   * Vision unavailable.
   */

  if (
    !vision.available
  ) {

    confidence =
      Math.min(
        confidence,
        40
      );
  }


  /*
   * Vision says insufficient evidence.
   */

  if (
    vision.verdict ===
      "Insufficient Evidence"
  ) {

    confidence =
      Math.min(
        confidence,
        55
      );
  }


  /*
   * Very low visual confidence.
   */

  if (
    vision.available &&
    vision.confidence < 30
  ) {

    confidence =
      Math.min(
        confidence,
        50
      );
  }


  confidence =
    Math.round(
      Math.max(
        0,
        Math.min(
          95,
          confidence
        )
      )
    );


  /*
   * Count independent evidence categories.
   */

  const categories =
    new Set(
      forensicSignals
        .filter(
          (signal) =>
            signal.status ===
              "warning" ||
            signal.status ===
              "normal"
        )
        .map(
          (signal) =>
            signal.category
        )
    );


  const independentSignals =
    categories.size;


  return {

    riskScore,

    confidence,

    forensicRisk,

    visualRisk:
      visualRisk === null
        ? null
        : Math.round(
            visualRisk
          ),

    manipulationRisk,

    aiGenerationRisk,

    evidenceQuality,

    independentSignals,

    classificationBoost,

    hasAiMetadata,
  };
};


/* ========================================================
   FINAL VERDICT
======================================================== */

const determineVerdict = ({
  riskScore,
  confidence,
  vision,
  forensicSignals,
}) => {

  const hasStrongAiMetadata =
    forensicSignals.some(
      (signal) =>
        signal.name ===
          "AI Generation Metadata" &&
        signal.status ===
          "warning"
    );


  /*
   * Strong AI-generated signal.
   *
   * This fixes the previous weakness where
   * AI_GENERATED classification was ignored.
   */

  const strongAiVision =
    vision.available &&
    vision.classification ===
      "AI_GENERATED" &&
    vision.aiGeneratedScore !== null &&
    vision.aiGeneratedScore >= 70 &&
    vision.confidence >= 65;


  /*
   * Strong manipulation signal.
   */

  const strongManipulationVision =
    vision.available &&
    vision.manipulationScore !== null &&
    vision.manipulationScore >= 70 &&
    vision.confidence >= 65;


  /*
   * ------------------------------------------------------
   * STRONG MANIPULATION / AI GENERATED
   * ------------------------------------------------------
   */

  if (
    riskScore >= 75 &&
    confidence >= 65 &&
    (
      hasStrongAiMetadata ||
      strongAiVision ||
      strongManipulationVision
    )
  ) {

    return {

      verdict:
        "Likely Manipulated / Misleading",

      label:
        "LIKELY MANIPULATED / MISLEADING",

      summary:
        "Multiple evidence signals indicate a high likelihood that the image is synthetically generated, manipulated, or has misleading provenance.",

      recommendation:
        "Treat the image with caution and verify its original source or provenance before relying on it.",
    };
  }


  /*
   * ------------------------------------------------------
   * AI GENERATED
   *
   * If Gemini strongly identifies synthetic
   * generation, allow a suspicious verdict
   * even when traditional manipulation score
   * is not high.
   * ------------------------------------------------------
   */

  if (
    strongAiVision &&
    confidence >= 50 &&
    riskScore >= 55
  ) {

    return {

      verdict:
        "Likely Manipulated / Misleading",

      label:
        "LIKELY MANIPULATED / MISLEADING",

      summary:
        "Visual AI analysis indicates that the image is likely AI-generated. This is a strong synthetic-media signal, although no detector can establish authenticity with absolute certainty.",

      recommendation:
        "Treat the image as potentially synthetic and verify the original source before trusting it.",
    };
  }


  /*
   * ------------------------------------------------------
   * SUSPICIOUS
   * ------------------------------------------------------
   */

  if (
    riskScore >= 45 &&
    confidence >= 45
  ) {

    return {

      verdict:
        "Suspicious",

      label:
        "SUSPICIOUS",

      summary:
        "The image contains multiple signals that warrant caution. However, the available evidence is not strong enough to establish manipulation with high certainty.",

      recommendation:
        "Verify the image's original source and context before relying on it.",
    };
  }


  /*
   * ------------------------------------------------------
   * VERIFIED
   *
   * Deliberately difficult to reach.
   * ------------------------------------------------------
   */

  if (
    riskScore < 25 &&
    confidence >= 70 &&
    vision.available &&
    vision.confidence >= 60 &&
    vision.manipulationScore !== null &&
    vision.manipulationScore < 30 &&
    (
      vision.aiGeneratedScore === null ||
      vision.aiGeneratedScore < 30
    )
  ) {

    return {

      verdict:
        "Verified",

      label:
        "VERIFIED",

      summary:
        "The available visual and forensic evidence is consistent with an authentic image. This result does not constitute proof of authenticity.",

      recommendation:
        "The available evidence supports authenticity, but the original source should still be considered when making high-stakes decisions.",
    };
  }


  /*
   * ------------------------------------------------------
   * UNVERIFIED
   * ------------------------------------------------------
   */

  return {

    verdict:
      "Unverified",

    label:
      "UNVERIFIED",

    summary:
      "TruthLens could not obtain enough independent evidence to establish whether the image is authentic or manipulated.",

    recommendation:
      "Verify the original source, context, and provenance before relying on the image.",
  };
};


/* ========================================================
   BUILD ANALYSIS
======================================================== */

const buildAnalysis = ({
  metadata,
  properties,
  signals,
  vision,
  fusion,
}) => {

  const analysis = [];


  /* ------------------------------------------------------
     Visual AI
  ------------------------------------------------------ */

  analysis.push({

    title:
      "Visual AI Analysis",

    description:
      vision.available

        ? `Gemini Vision estimated manipulation risk at ${
            vision.manipulationScore === null
              ? "unknown"
              : vision.manipulationScore
          }/100 and AI-generation likelihood at ${
            vision.aiGeneratedScore === null
              ? "unknown"
              : vision.aiGeneratedScore
          }/100 with ${
            Math.round(
              vision.confidence
            )
          }% model confidence. Classification: ${
            vision.classification
          }.`

        : "Visual AI analysis was unavailable.",
  });


  /* ------------------------------------------------------
     File
  ------------------------------------------------------ */

  analysis.push({

    title:
      "File Analysis",

    description:
      `The uploaded ${metadata.format.toUpperCase()} image is ${
        properties.width
      } × ${
        properties.height
      } pixels (${
        properties.megapixels
      } MP) and ${
        metadata.sizeMB
      } MB.`,
  });


  /* ------------------------------------------------------
     Metadata
  ------------------------------------------------------ */

  analysis.push({

    title:
      "Metadata Analysis",

    description:
      metadata.hasMetadata

        ? "Detectable metadata was found and may provide provenance context. Metadata is not treated as proof of authenticity."

        : "No significant provenance metadata was detected. Missing metadata is common and is not treated as evidence that the image is fake.",
  });


  /* ------------------------------------------------------
     AI Metadata
  ------------------------------------------------------ */

  if (
    metadata.aiGenerator
  ) {

    analysis.push({

      title:
        "AI Generation Metadata",

      description:
        `The file contains an indicator associated with ${metadata.aiGenerator}. This is strong provenance evidence that the image may have been generated or processed using an AI image-generation system. Metadata can be modified or removed.`,
    });
  }


  /* ------------------------------------------------------
     Forensics
  ------------------------------------------------------ */

  analysis.push({

    title:
      "Forensic Analysis",

    description:
      `${signals.length} file, provenance, compression, and structural signals were evaluated. The forensic layer contributed a risk score of ${fusion.forensicRisk}/100.`,
  });


  /* ------------------------------------------------------
     Evidence Quality
  ------------------------------------------------------ */

  analysis.push({

    title:
      "Evidence Quality",

    description:
      `TruthLens estimated the overall evidence quality at ${fusion.evidenceQuality}/100 using structural, provenance, forensic, and visual-analysis signals.`,
  });


  /* ------------------------------------------------------
     Visual Findings
  ------------------------------------------------------ */

  if (
    vision.findings.length > 0
  ) {

    analysis.push({

      title:
        "Visual Findings",

      description:
        vision.findings.join(
          " "
        ),
    });
  }


  /* ------------------------------------------------------
     Limitations
  ------------------------------------------------------ */

  if (
    vision.limitations.length > 0
  ) {

    analysis.push({

      title:
        "Analysis Limitations",

      description:
        vision.limitations.join(
          " "
        ),
    });
  }


  return analysis;
};


/* ========================================================
   BUILD EVIDENCE
======================================================== */

const buildEvidence = ({
  metadata,
  properties,
  signals,
  vision,
  fusion,
}) => {

  const evidence = [];


  /* ------------------------------------------------------
     Visual AI
  ------------------------------------------------------ */

  if (
    vision.available
  ) {

    let type =
      "context";


    if (
      (
        vision.manipulationScore !== null &&
        vision.manipulationScore >= 60
      ) ||
      (
        vision.aiGeneratedScore !== null &&
        vision.aiGeneratedScore >= 60
      )
    ) {

      type =
        "contradicting";

    } else if (
      vision.manipulationScore !== null &&
      vision.manipulationScore < 40 &&
      vision.confidence >= 50
    ) {

      type =
        "supporting";
    }


    evidence.push({

      type,

      title:
        "Visual AI Analysis",

      domain:
        "image-vision-analysis",

      description:
        `Visual analysis estimated manipulation risk at ${
          vision.manipulationScore === null
            ? "unknown"
            : vision.manipulationScore
        }/100 and AI-generation likelihood at ${
          vision.aiGeneratedScore === null
            ? "unknown"
            : vision.aiGeneratedScore
        }/100 with ${
          Math.round(
            vision.confidence
          )
        }% model confidence. Classification: ${
          vision.classification
        }. ${
          vision.description
        }`,

      url:
        "",
    });


    /*
     * Separate AI generation evidence.
     */

    if (
      vision.aiGeneratedScore !== null
    ) {

      evidence.push({

        type:
          vision.aiGeneratedScore >= 60
            ? "contradicting"
            : "context",

        title:
          "AI Generation Assessment",

        domain:
          "image-ai-analysis",

        description:
          `The visual model estimated the likelihood of AI generation at ${vision.aiGeneratedScore}/100. This is a model-based signal and is not treated as absolute proof.`,

        url:
          "",
      });
    }
  }


  /* ------------------------------------------------------
     Image structure
  ------------------------------------------------------ */

  evidence.push({

    type:
      "context",

    title:
      "Image Structure",

    domain:
      "local-file-analysis",

    description:
      `Valid ${metadata.format.toUpperCase()} image structure detected at ${
        properties.width
      } × ${
        properties.height
      } pixels.`,

    url:
      "",
  });


  /* ------------------------------------------------------
     Metadata
  ------------------------------------------------------ */

  evidence.push({

    type:
      "context",

    title:
      metadata.hasMetadata
        ? "Metadata Available"
        : "Metadata Not Available",

    domain:
      "image-provenance",

    description:
      metadata.hasMetadata

        ? "Metadata was detected and may provide provenance context. It is not treated as proof of authenticity."

        : "No significant provenance metadata was detected. Missing metadata is not proof of manipulation.",

    url:
      "",
  });


  /* ------------------------------------------------------
     AI Generator
  ------------------------------------------------------ */

  if (
    metadata.aiGenerator
  ) {

    evidence.push({

      type:
        "contradicting",

      title:
        "AI Generation Metadata",

      domain:
        "image-provenance",

      description:
        `The file contains an indicator associated with ${metadata.aiGenerator}. This is a strong provenance signal that the image may have been generated or processed by an AI image-generation system.`,

      url:
        "",
    });
  }


  /* ------------------------------------------------------
     Forensic warnings
  ------------------------------------------------------ */

  signals
    .filter(
      (signal) =>
        signal.status ===
        "warning"
    )
    .forEach(
      (signal) => {

        evidence.push({

          type:
            "contradicting",

          title:
            signal.name,

          domain:
            `image-${signal.category}`,

          description:
            signal.description,

          url:
            "",
        });
      }
    );


  /* ------------------------------------------------------
     Camera provenance
  ------------------------------------------------------ */

  if (
    metadata.cameraMake
  ) {

    evidence.push({

      type:
        "context",

      title:
        "Camera Provenance",

      domain:
        "image-provenance",

      description:
        `Camera-related metadata associated with ${metadata.cameraMake} was detected.`,

      url:
        "",
    });
  }


  /* ------------------------------------------------------
     Fusion evidence
  ------------------------------------------------------ */

  evidence.push({

    type:
      "context",

    title:
      "Evidence Fusion",

    domain:
      "truthlens-fusion-engine",

    description:
      `TruthLens combined forensic risk (${fusion.forensicRisk}/100), visual risk (${
        fusion.visualRisk === null
          ? "unavailable"
          : `${fusion.visualRisk}/100`
      }), AI-generation risk (${
        fusion.aiGenerationRisk === null
          ? "unavailable"
          : `${fusion.aiGenerationRisk}/100`
      }), and evidence quality (${
        fusion.evidenceQuality
      }/100) to produce the final assessment.`,

    url:
      "",
  });


  return evidence;
};


/* ========================================================
   MAIN IMAGE ANALYSIS
======================================================== */

const analyzeImage = async ({
  buffer,
  mimetype,
  originalname,

  /*
   * Controller supplies Gemini Vision.
   */
  analyzeVision = null,
}) => {

  const startTime =
    Date.now();


  console.log("");

  console.log(
    "========================================"
  );

  console.log(
    "TruthLens Image Verification"
  );

  console.log(
    "========================================"
  );


  /* ------------------------------------------------------
     1. VALIDATE
  ------------------------------------------------------ */

  validateImage({
    buffer,
    mimetype,
    originalname,
  });


  console.log(
    "[Image] Validation passed."
  );


  /* ------------------------------------------------------
     2. HASH
  ------------------------------------------------------ */

  const fileHash =
    generateFileHash(
      buffer
    );


  console.log(
    "[Image] SHA-256:",
    fileHash
  );


  /* ------------------------------------------------------
     3. METADATA
  ------------------------------------------------------ */

  const metadata =
    await extractMetadata({
      buffer,
      mimetype,
      originalname,
    });


  console.log(
    "[Image] Format:",
    metadata.format
  );


  console.log(
    "[Image] Metadata:",
    metadata.hasMetadata
  );


  console.log(
    "[Image] AI metadata:",
    metadata.aiGenerator ||
      "none"
  );


  /* ------------------------------------------------------
     4. IMAGE PROPERTIES
  ------------------------------------------------------ */

  const properties =
    await extractImageProperties(
      buffer
    );


  console.log(
    "[Image] Dimensions:",
    properties.width,
    "x",
    properties.height
  );


  /* ------------------------------------------------------
     5. FORENSICS
  ------------------------------------------------------ */

  const forensicSignals =
    analyzeForensicSignals({
      buffer,
      metadata,
      properties,
    });


  /* ------------------------------------------------------
     6. GEMINI VISION
  ------------------------------------------------------ */

  let visionResult =
    null;


  if (
    typeof analyzeVision ===
    "function"
  ) {

    try {

      console.log(
        "[Image] Running Gemini Vision..."
      );


      visionResult =
        await analyzeVision({
          buffer,
          mimetype,
          originalname,
        });


      console.log(
        "[Image] Gemini Vision completed."
      );

    } catch (error) {

      console.error(
        "[Image] Gemini Vision failed:",
        error.message
      );
    }

  } else {

    console.log(
      "[Image] Gemini Vision function was not supplied."
    );
  }


  const vision =
    normalizeVisionResult(
      visionResult
    );


  /* ------------------------------------------------------
     7. FUSION
  ------------------------------------------------------ */

  const fusion =
    calculateFusion({
      forensicSignals,
      vision,
    });


  /* ------------------------------------------------------
     8. VERDICT
  ------------------------------------------------------ */

  const assessment =
    determineVerdict({
      riskScore:
        fusion.riskScore,

      confidence:
        fusion.confidence,

      vision,

      forensicSignals,
    });


  /* ------------------------------------------------------
     9. ANALYSIS
  ------------------------------------------------------ */

  const analysis =
    buildAnalysis({
      metadata,
      properties,

      signals:
        forensicSignals,

      vision,
      fusion,
    });


  /* ------------------------------------------------------
     10. EVIDENCE
  ------------------------------------------------------ */

  const evidence =
    buildEvidence({
      metadata,
      properties,

      signals:
        forensicSignals,

      vision,
      fusion,
    });


  /* ------------------------------------------------------
     11. PROCESSING TIME
  ------------------------------------------------------ */

  const processingTime =
    `${(
      (Date.now() -
        startTime) /
      1000
    ).toFixed(2)} seconds`;


  /* ------------------------------------------------------
     12. FINAL RESULT
  ------------------------------------------------------ */

  const result = {

    verdict:
      assessment.verdict,

    label:
      assessment.label,

    confidence:
      fusion.confidence,

    riskScore:
      fusion.riskScore,

    summary:
      assessment.summary,

    recommendation:
      assessment.recommendation,

    analysis,

    evidence,

    sourcesAnalyzed:
      evidence.length,

    processingTime,


    /* ----------------------------------------------------
       FILE
    ---------------------------------------------------- */

    file: {

      originalName:
        originalname || "",

      mimeType:
        mimetype || "",

      sizeBytes:
        buffer.length,

      sizeMB:
        metadata.sizeMB,

      format:
        metadata.format,

      sha256:
        fileHash,
    },


    /* ----------------------------------------------------
       IMAGE PROPERTIES
    ---------------------------------------------------- */

    imageProperties:
      properties,


    /* ----------------------------------------------------
       METADATA
    ---------------------------------------------------- */

    metadata,


    /* ----------------------------------------------------
       FORENSIC SIGNALS
    ---------------------------------------------------- */

    signals:
      forensicSignals,


    /* ----------------------------------------------------
       VISUAL ANALYSIS
    ---------------------------------------------------- */

    visualAnalysis: {

      available:
        vision.available,

      classification:
        vision.classification,

      manipulationScore:
        vision.manipulationScore,

      aiGeneratedScore:
        vision.aiGeneratedScore,

      visualAuthenticityScore:
        vision.visualAuthenticityScore,

      confidence:
        vision.confidence,

      verdict:
        vision.verdict,

      findings:
        vision.findings,

      manipulationIndicators:
        vision.manipulationIndicators,

      authenticityIndicators:
        vision.authenticityIndicators,

      limitations:
        vision.limitations,

      evidenceQuality:
        vision.evidenceQuality,
    },


    /* ----------------------------------------------------
       FUSION
    ---------------------------------------------------- */

    fusion: {

      forensicRisk:
        fusion.forensicRisk,

      visualRisk:
        fusion.visualRisk,

      manipulationRisk:
        fusion.manipulationRisk,

      aiGenerationRisk:
        fusion.aiGenerationRisk,

      evidenceQuality:
        fusion.evidenceQuality,

      independentSignals:
        fusion.independentSignals,

      classificationBoost:
        fusion.classificationBoost,

      hasAiMetadata:
        fusion.hasAiMetadata,
    },
  };


  /* ------------------------------------------------------
     LOG RESULT
  ------------------------------------------------------ */

  console.log("");

  console.log(
    "========== IMAGE RESULT =========="
  );


  console.log(
    "Verdict:",
    result.verdict
  );


  console.log(
    "Confidence:",
    result.confidence
  );


  console.log(
    "Risk:",
    result.riskScore
  );


  console.log(
    "Visual manipulation:",
    result.visualAnalysis.manipulationScore
  );


  console.log(
    "AI generation:",
    result.visualAnalysis.aiGeneratedScore
  );


  console.log(
    "Visual confidence:",
    result.visualAnalysis.confidence
  );


  console.log(
    "Forensic:",
    result.fusion.forensicRisk
  );


  console.log(
    "Evidence quality:",
    result.fusion.evidenceQuality
  );


  console.log(
    "Independent signals:",
    result.fusion.independentSignals
  );


  console.log(
    "Processing:",
    result.processingTime
  );


  console.log(
    "=================================="
  );


  return result;
};


/* ========================================================
   EXPORT
======================================================== */

module.exports = {
  analyzeImage,
};