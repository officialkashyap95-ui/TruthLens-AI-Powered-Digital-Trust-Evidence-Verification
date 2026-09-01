const crypto = require("crypto");

/* =========================================================
   TRUTHLENS IMAGE VERIFICATION ENGINE

   Analysis layers:
   1. File validation
   2. SHA-256 fingerprint
   3. Binary signature verification
   4. Image metadata analysis
   5. JPEG structure / quantization analysis
   6. Compression indicators
   7. Editing-software indicators
   8. Provenance indicators
   9. AI-generation indicators
   10. Cross-signal evidence fusion
   11. Explainable verdict

   IMPORTANT:
   This service does NOT claim 100% authenticity detection.
   Individual indicators are probabilistic/contextual.
========================================================= */


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_MIME_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const ALLOWED_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ]);


/* =========================================================
   SHA-256
========================================================= */

const generateFileHash = (
  buffer
) => {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");
};


/* =========================================================
   FORMAT DETECTION
========================================================= */

const detectImageFormat = (
  buffer
) => {
  if (
    !buffer ||
    buffer.length < 12
  ) {
    return "unknown";
  }

  /* JPEG */

  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpeg";
  }

  /* PNG */

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

  /* WEBP */

  if (
    buffer.toString(
      "ascii",
      0,
      4
    ) === "RIFF" &&
    buffer.toString(
      "ascii",
      8,
      12
    ) === "WEBP"
  ) {
    return "webp";
  }

  return "unknown";
};


/* =========================================================
   EXTENSION
========================================================= */

const getExtension = (
  filename = ""
) => {
  const index =
    filename.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return filename
    .slice(index)
    .toLowerCase();
};


/* =========================================================
   JPEG METADATA
========================================================= */

const extractJpegMetadata = (
  buffer
) => {
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
  };

  if (
    !buffer ||
    buffer.length < 4
  ) {
    return metadata;
  }

  const text =
    buffer.toString(
      "latin1",
      0,
      Math.min(
        buffer.length,
        4 * 1024 * 1024
      )
    );


  /* EXIF */

  if (
    text.includes("Exif") ||
    text.includes("EXIF")
  ) {
    metadata.hasExif = true;
  }


  /* JFIF */

  if (
    text.includes("JFIF")
  ) {
    metadata.hasJfif = true;
  }


  /* ICC */

  if (
    text.includes(
      "ICC_PROFILE"
    )
  ) {
    metadata.hasIccProfile = true;
  }


  /* Photoshop */

  if (
    text.includes(
      "Photoshop"
    ) ||
    text.includes("8BIM")
  ) {
    metadata.hasPhotoshop =
      true;
  }


  /* XMP */

  if (
    text.includes("XMP") ||
    text.includes("xmpmeta") ||
    text.includes(
      "http://ns.adobe.com"
    )
  ) {
    metadata.hasXmp = true;
  }


  /* Editing software */

  const softwarePatterns = [
    "Adobe Photoshop",
    "Photoshop",
    "Lightroom",
    "GIMP",
    "Snapseed",
    "PicsArt",
    "Canva",
    "Pixelmator",
    "Affinity Photo",
    "Paint.NET",
  ];

  for (
    const software of softwarePatterns
  ) {
    if (
      text
        .toLowerCase()
        .includes(
          software.toLowerCase()
        )
    ) {
      metadata.software =
        software;

      break;
    }
  }


  /* Camera manufacturers */

  const cameraManufacturers = [
    "Canon",
    "NIKON",
    "SONY",
    "FUJIFILM",
    "Panasonic",
    "Olympus",
    "Leica",
    "Samsung",
    "Apple",
    "Google",
    "HUAWEI",
    "Xiaomi",
    "OnePlus",
    "OPPO",
    "vivo",
  ];

  for (
    const manufacturer of
      cameraManufacturers
  ) {
    if (
      text
        .toLowerCase()
        .includes(
          manufacturer.toLowerCase()
        )
    ) {
      metadata.cameraMake =
        manufacturer;

      break;
    }
  }


  return metadata;
};


/* =========================================================
   GENERAL METADATA
========================================================= */

const extractMetadata = ({
  buffer,
  mimetype,
  originalname,
}) => {
  const format =
    detectImageFormat(buffer);

  const jpegMetadata =
    format === "jpeg"
      ? extractJpegMetadata(
          buffer
        )
      : {};

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

    hasMetadata:
      false,

    hasExif:
      jpegMetadata.hasExif ||
      false,

    hasJfif:
      jpegMetadata.hasJfif ||
      false,

    hasIccProfile:
      jpegMetadata.hasIccProfile ||
      false,

    hasPhotoshopMetadata:
      jpegMetadata.hasPhotoshop ||
      false,

    hasXmp:
      jpegMetadata.hasXmp ||
      false,

    cameraMake:
      jpegMetadata.cameraMake ||
      "",

    cameraModel:
      jpegMetadata.cameraModel ||
      "",

    software:
      jpegMetadata.software ||
      "",

    dateTime:
      jpegMetadata.dateTime ||
      "",
  };

  metadata.hasMetadata =
    metadata.hasExif ||
    metadata.hasJfif ||
    metadata.hasIccProfile ||
    metadata.hasPhotoshopMetadata ||
    metadata.hasXmp;

  return metadata;
};


/* =========================================================
   IMAGE VALIDATION
========================================================= */

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


  if (
    buffer.length === 0
  ) {
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


  if (
    format === "unknown"
  ) {
    throw new Error(
      "The uploaded file does not appear to be a valid JPG, PNG, or WEBP image."
    );
  }


  const expectedFormat =
    mimetype === "image/jpeg"
      ? "jpeg"
      : mimetype === "image/png"
      ? "png"
      : "webp";


  if (
    format !== expectedFormat
  ) {
    throw new Error(
      "Image MIME type does not match the actual binary file format."
    );
  }


  const extension =
    getExtension(
      originalname
    );


  if (
    extension &&
    !ALLOWED_EXTENSIONS.has(
      extension
    )
  ) {
    throw new Error(
      "Image filename extension is not supported."
    );
  }

  return true;
};


/* =========================================================
   JPEG STRUCTURE ANALYSIS
========================================================= */

const analyzeJpegStructure = (
  buffer
) => {
  const result = {
    markerCount: 0,
    quantizationTables: 0,
    hasMultipleQuantizationTables: false,
    hasCommentMarker: false,
  };


  if (
    !buffer ||
    buffer.length < 4 ||
    buffer[0] !== 0xff ||
    buffer[1] !== 0xd8
  ) {
    return result;
  }


  let offset = 2;


  while (
    offset + 1 <
    buffer.length
  ) {
    if (
      buffer[offset] !== 0xff
    ) {
      offset++;
      continue;
    }


    while (
      offset < buffer.length &&
      buffer[offset] === 0xff
    ) {
      offset++;
    }


    if (
      offset >= buffer.length
    ) {
      break;
    }


    const marker =
      buffer[offset++];

    result.markerCount++;


    /* Start of scan */

    if (
      marker === 0xda
    ) {
      break;
    }


    /* End of image */

    if (
      marker === 0xd9
    ) {
      break;
    }


    /* Restart markers */

    if (
      marker >= 0xd0 &&
      marker <= 0xd7
    ) {
      continue;
    }


    if (
      offset + 1 >=
      buffer.length
    ) {
      break;
    }


    const segmentLength =
      buffer.readUInt16BE(
        offset
      );


    if (
      segmentLength < 2
    ) {
      break;
    }


    if (
      marker === 0xdb
    ) {
      result.quantizationTables++;
    }


    if (
      marker === 0xfe
    ) {
      result.hasCommentMarker =
        true;
    }


    offset += segmentLength;
  }


  result.hasMultipleQuantizationTables =
    result.quantizationTables > 1;

  return result;
};


/* =========================================================
   ENTROPY / BYTE ANALYSIS
========================================================= */

const analyzeByteCharacteristics = (
  buffer
) => {
  if (
    !buffer ||
    buffer.length === 0
  ) {
    return {
      entropy: 0,
      uniqueByteRatio: 0,
    };
  }


  const counts =
    new Array(256).fill(0);


  for (
    const byte of buffer
  ) {
    counts[byte]++;
  }


  let entropy = 0;


  for (
    const count of counts
  ) {
    if (count === 0) {
      continue;
    }


    const probability =
      count /
      buffer.length;


    entropy -=
      probability *
      Math.log2(
        probability
      );
  }


  let unique = 0;


  for (
    const count of counts
  ) {
    if (count > 0) {
      unique++;
    }
  }


  return {
    entropy: Number(
      entropy.toFixed(3)
    ),

    uniqueByteRatio:
      Number(
        (
          unique / 256
        ).toFixed(3)
      ),
  };
};


/* =========================================================
   AI-GENERATION INDICATORS
========================================================= */

/*
 * This is intentionally NOT an AI detector.
 *
 * It looks for provenance/software markers commonly associated
 * with synthetic-image workflows.
 *
 * These indicators alone MUST NOT cause a "fake" verdict.
 */

const analyzeAIGenerationIndicators = ({
  metadata,
  buffer,
}) => {
  const indicators = [];

  const text =
    buffer.toString(
      "latin1",
      0,
      Math.min(
        buffer.length,
        4 * 1024 * 1024
      )
    );


  const aiMarkers = [
    "Stable Diffusion",
    "Midjourney",
    "DALL-E",
    "OpenAI",
    "Adobe Firefly",
    "Firefly",
    "Generative Fill",
    "ComfyUI",
    "Automatic1111",
    "C2PA",
    "Content Credentials",
  ];


  for (
    const marker of aiMarkers
  ) {
    if (
      text
        .toLowerCase()
        .includes(
          marker.toLowerCase()
        )
    ) {
      indicators.push(
        marker
      );
    }
  }


  if (
    metadata.software
  ) {
    const software =
      metadata.software.toLowerCase();

    if (
      software.includes(
        "photoshop"
      ) ||
      software.includes(
        "firefly"
      )
    ) {
      indicators.push(
        metadata.software
      );
    }
  }


  return {
    detected:
      indicators.length > 0,

    indicators:
      [
        ...new Set(
          indicators
        ),
      ],
  };
};


/* =========================================================
   FORENSIC SIGNALS
========================================================= */

const analyzeForensicSignals = ({
  buffer,
  metadata,
  jpegStructure,
  byteCharacteristics,
  aiIndicators,
}) => {
  const signals = [];


  /* -------------------------------------------------------
     1. Metadata
  ------------------------------------------------------- */

  if (
    metadata.hasMetadata
  ) {
    signals.push({
      name:
        "Metadata Availability",

      score: 0,

      status:
        "normal",

      category:
        "provenance",

      description:
        "Detectable image metadata is present. Metadata can provide provenance context, but it can also be modified or removed.",
    });
  } else {
    signals.push({
      name:
        "Metadata Availability",

      score: 8,

      status:
        "info",

      category:
        "provenance",

      description:
        "No significant metadata markers were detected. Metadata absence is common after screenshots, downloads, compression, and social-media processing and is not proof of manipulation.",
    });
  }


  /* -------------------------------------------------------
     2. EXIF
  ------------------------------------------------------- */

  if (
    metadata.hasExif
  ) {
    signals.push({
      name:
        "EXIF Provenance",

      score: 0,

      status:
        "normal",

      category:
        "provenance",

      description:
        "EXIF metadata is available and may provide useful provenance information.",
    });
  } else {
    signals.push({
      name:
        "EXIF Provenance",

      score: 4,

      status:
        "info",

      category:
        "provenance",

      description:
        "No EXIF metadata was detected. The original capture information cannot be established from EXIF.",
    });
  }


  /* -------------------------------------------------------
     3. Editing software
  ------------------------------------------------------- */

  if (
    metadata.software
  ) {
    signals.push({
      name:
        "Editing Software",

      score: 18,

      status:
        "warning",

      category:
        "editing",

      description:
        `Metadata contains an image-processing software indicator: ${metadata.software}. This suggests the file may have been processed, but processing does not necessarily mean deceptive manipulation.`,
    });
  }


  /* -------------------------------------------------------
     4. Photoshop metadata
  ------------------------------------------------------- */

  if (
    metadata.hasPhotoshopMetadata
  ) {
    signals.push({
      name:
        "Photoshop Metadata",

      score: 15,

      status:
        "warning",

      category:
        "editing",

      description:
        "Photoshop-related metadata markers were detected. This is evidence of possible editing history, not proof that the image content is false.",
    });
  }


  /* -------------------------------------------------------
     5. JPEG structure
  ------------------------------------------------------- */

  if (
    metadata.format ===
      "jpeg" &&
    jpegStructure.quantizationTables >
      1
  ) {
    signals.push({
      name:
        "JPEG Compression Structure",

      score: 8,

      status:
        "info",

      category:
        "compression",

      description:
        "Multiple JPEG quantization tables were detected. This can occur during normal encoding and may also occur after image processing.",
    });
  } else {
    signals.push({
      name:
        "JPEG Compression Structure",

      score: 0,

      status:
        "normal",

      category:
        "compression",

      description:
        "No unusual JPEG quantization-table indicator was identified by this basic structural check.",
    });
  }


  /* -------------------------------------------------------
     6. File size
  ------------------------------------------------------- */

  const sizeKB =
    buffer.length /
    1024;


  if (
    sizeKB < 20
  ) {
    signals.push({
      name:
        "File Compression",

      score: 6,

      status:
        "info",

      category:
        "compression",

      description:
        "The image is unusually small. Strong compression or resizing may have occurred, although file size alone cannot establish manipulation.",
    });
  } else {
    signals.push({
      name:
        "File Compression",

      score: 0,

      status:
        "normal",

      category:
        "compression",

      description:
        "The file size does not produce a strong compression warning.",
    });
  }


  /* -------------------------------------------------------
     7. AI-generation markers
  ------------------------------------------------------- */

  if (
    aiIndicators.detected
  ) {
    signals.push({
      name:
        "Synthetic Media Metadata",

      score: 25,

      status:
        "warning",

      category:
        "synthetic-media",

      description:
        `Metadata or embedded markers associated with synthetic-image tooling were detected: ${aiIndicators.indicators.join(
          ", "
        )}. These markers should be treated as supporting evidence rather than definitive proof.`,
    });
  } else {
    signals.push({
      name:
        "Synthetic Media Metadata",

      score: 0,

      status:
        "normal",

      category:
        "synthetic-media",

      description:
        "No recognizable synthetic-image software markers were detected in the available file metadata.",
    });
  }


  /* -------------------------------------------------------
     8. Camera provenance
  ------------------------------------------------------- */

  if (
    metadata.cameraMake
  ) {
    signals.push({
      name:
        "Camera Provenance",

      score: 0,

      status:
        "normal",

      category:
        "provenance",

      description:
        `Camera manufacturer information was detected: ${metadata.cameraMake}. This can support provenance analysis but does not prove authenticity.`,
    });
  } else {
    signals.push({
      name:
        "Camera Provenance",

      score: 3,

      status:
        "info",

      category:
        "provenance",

      description:
        "No identifiable camera manufacturer was detected.",
    });
  }


  /* -------------------------------------------------------
     9. Binary entropy
  ------------------------------------------------------- */

  if (
    byteCharacteristics.entropy >
    7.8
  ) {
    signals.push({
      name:
        "Binary Entropy",

      score: 2,

      status:
        "info",

      category:
        "file-structure",

      description:
        "The file has high byte-level entropy. This is expected for many compressed images and is not, by itself, evidence of manipulation.",
    });
  } else {
    signals.push({
      name:
        "Binary Entropy",

      score: 0,

      status:
        "normal",

      category:
        "file-structure",

      description:
        "No unusual byte-level entropy indicator was identified.",
    });
  }


  return signals;
};


/* =========================================================
   EVIDENCE FUSION
========================================================= */

const calculateRiskScore = (
  signals
) => {
  if (
    !signals ||
    signals.length === 0
  ) {
    return 0;
  }


  /*
   * Only warning signals contribute strongly.
   * Informational signals have deliberately small weight.
   */

  let risk = 0;


  for (
    const signal of signals
  ) {
    if (
      signal.status ===
      "warning"
    ) {
      risk +=
        Number(
          signal.score || 0
        );
    }

    if (
      signal.status ===
      "info"
    ) {
      risk +=
        Number(
          signal.score || 0
        ) *
        0.35;
    }
  }


  return Math.min(
    100,
    Math.round(risk)
  );
};


/* =========================================================
   CONFIDENCE
========================================================= */

const calculateConfidence = ({
  riskScore,
  signals,
}) => {
  const warningCount =
    signals.filter(
      (signal) =>
        signal.status ===
        "warning"
    ).length;


  const categories =
    new Set(
      signals
        .filter(
          (signal) =>
            signal.status ===
            "warning"
        )
        .map(
          (signal) =>
            signal.category
        )
    );


  /*
   * Confidence increases when independent
   * categories agree.
   */

  if (
    warningCount === 0
  ) {
    return 35;
  }


  let confidence =
    40 +
    warningCount * 5 +
    categories.size * 5;


  if (
    riskScore < 20
  ) {
    confidence =
      Math.min(
        confidence,
        50
      );
  }


  return Math.min(
    85,
    Math.round(
      confidence
    )
  );
};


/* =========================================================
   VERDICT
========================================================= */

const determineVerdict = ({
  riskScore,
  signals,
}) => {
  const warnings =
    signals.filter(
      (signal) =>
        signal.status ===
        "warning"
    );


  const categories =
    new Set(
      warnings.map(
        (signal) =>
          signal.category
      )
    );


  /*
   * Strong verdict requires:
   * - meaningful risk
   * - multiple warning categories
   *
   * This prevents metadata alone from
   * declaring an image fake.
   */

  if (
    riskScore >= 45 &&
    warnings.length >= 2 &&
    categories.size >= 2
  ) {
    return {
      verdict:
        "Likely Manipulated / Misleading",

      confidence:
        calculateConfidence({
          riskScore,
          signals,
        }),

      summary:
        "Multiple independent forensic indicators suggest that the image may have been processed, edited, or contain synthetic-media characteristics. The result is probabilistic and does not establish manipulation with certainty.",
    };
  }


  if (
    riskScore >= 18 &&
    warnings.length >= 1
  ) {
    return {
      verdict:
        "Suspicious",

      confidence:
        calculateConfidence({
          riskScore,
          signals,
        }),

      summary:
        "The image contains one or more indicators that require additional scrutiny. These indicators may result from ordinary editing, compression, or synthetic-media processing and should not be treated as conclusive proof.",
    };
  }


  /*
   * IMPORTANT:
   *
   * No suspicious indicator does NOT mean
   * the image is authentic.
   */

  return {
    verdict:
      "Unverified",

    confidence:
      calculateConfidence({
        riskScore,
        signals,
      }),

    summary:
      "No strong manipulation indicators were identified by the available forensic checks. This does not prove that the image is authentic because sophisticated manipulation can leave little detectable evidence.",
  };
};


/* =========================================================
   ANALYSIS EXPLANATIONS
========================================================= */

const buildAnalysis = ({
  metadata,
  signals,
  jpegStructure,
  aiIndicators,
}) => {
  const warningSignals =
    signals.filter(
      (signal) =>
        signal.status ===
        "warning"
    );


  return [
    {
      title:
        "File Integrity",

      description:
        `The uploaded file passed binary signature validation as ${metadata.format.toUpperCase()} and its declared MIME type matched the detected format.`,
    },


    {
      title:
        "Metadata & Provenance",

      description:
        metadata.hasMetadata
          ? "Metadata markers were detected. These can provide provenance context, but metadata can be changed or removed."
          : "No significant metadata markers were detected. This limits provenance analysis but does not indicate that the image is fake.",
    },


    {
      title:
        "Editing Indicators",

      description:
        metadata.software ||
        metadata.hasPhotoshopMetadata
          ? "The file contains indicators associated with image-processing software. This may indicate editing or normal post-processing."
          : "No recognizable editing-software metadata was detected.",
    },


    {
      title:
        "Compression Structure",

      description:
        metadata.format ===
        "jpeg"
          ? `JPEG structural analysis detected ${jpegStructure.quantizationTables} quantization table segment(s). These characteristics can result from normal encoding or subsequent processing.`
          : "The uploaded format does not expose the same JPEG-specific structural indicators.",
    },


    {
      title:
        "Synthetic Media Indicators",

      description:
        aiIndicators.detected
          ? `Potential synthetic-media markers were detected: ${aiIndicators.indicators.join(
              ", "
            )}. These markers are supporting evidence only.`
          : "No recognizable synthetic-image metadata markers were detected.",
    },


    {
      title:
        "Overall Forensic Assessment",

      description:
        warningSignals.length >
        0
          ? `${warningSignals.length} warning indicator(s) were identified across ${new Set(
              warningSignals.map(
                (signal) =>
                  signal.category
              )
            ).size} forensic category/categories.`
          : "No strong forensic warning indicators were identified by the current analysis.",
    },
  ];
};


/* =========================================================
   EVIDENCE
========================================================= */

const buildEvidence = ({
  metadata,
  signals,
  aiIndicators,
}) => {
  const evidence = [];


  /* File format */

  evidence.push({
    type:
      "context",

    title:
      "Binary Image Signature",

    domain:
      "local-file-analysis",

    description:
      `The file signature identifies the image as ${metadata.format.toUpperCase()}.`,

    url:
      "",
  });


  /* Metadata */

  if (
    metadata.hasMetadata
  ) {
    evidence.push({
      type:
        "context",

      title:
        "Metadata Detected",

      domain:
        "image-provenance",

      description:
        "The image contains detectable metadata markers that can provide provenance context.",

      url:
        "",
    });
  } else {
    evidence.push({
      type:
        "context",

      title:
        "Metadata Not Detected",

      domain:
        "image-provenance",

      description:
        "No significant metadata markers were detected. Metadata may have been removed during sharing, editing, downloading, or compression.",

      url:
        "",
    });
  }


  /* AI indicators */

  if (
    aiIndicators.detected
  ) {
    evidence.push({
      type:
        "context",

      title:
        "Synthetic Media Indicator",

      domain:
        "synthetic-media-analysis",

      description:
        `Recognizable synthetic-media markers were detected: ${aiIndicators.indicators.join(
          ", "
        )}.`,

      url:
        "",
    });
  }


  /* Warning signals */

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
            "context",

          title:
            signal.name,

          domain:
            signal.category,

          description:
            signal.description,

          url:
            "",
        });
      }
    );


  return evidence;
};


/* =========================================================
   MAIN ANALYZER
========================================================= */

const analyzeImage = async ({
  buffer,
  mimetype,
  originalname,
}) => {
  const startTime =
    Date.now();


  console.log("");
  console.log(
    "=========================================="
  );
  console.log(
    "TruthLens Image Verification Engine"
  );
  console.log(
    "=========================================="
  );


  /* -----------------------------------------
     1. Validation
  ----------------------------------------- */

  validateImage({
    buffer,
    mimetype,
    originalname,
  });


  console.log(
    "[Image] Validation passed."
  );


  /* -----------------------------------------
     2. Hash
  ----------------------------------------- */

  const fileHash =
    generateFileHash(
      buffer
    );


  console.log(
    "[Image] SHA-256:",
    fileHash
  );


  /* -----------------------------------------
     3. Metadata
  ----------------------------------------- */

  const metadata =
    extractMetadata({
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


  /* -----------------------------------------
     4. JPEG structure
  ----------------------------------------- */

  const jpegStructure =
    analyzeJpegStructure(
      buffer
    );


  /* -----------------------------------------
     5. Byte characteristics
  ----------------------------------------- */

  const byteCharacteristics =
    analyzeByteCharacteristics(
      buffer
    );


  /* -----------------------------------------
     6. AI markers
  ----------------------------------------- */

  const aiIndicators =
    analyzeAIGenerationIndicators({
      metadata,
      buffer,
    });


  /* -----------------------------------------
     7. Forensic signals
  ----------------------------------------- */

  const signals =
    analyzeForensicSignals({
      buffer,
      metadata,
      jpegStructure,
      byteCharacteristics,
      aiIndicators,
    });


  /* -----------------------------------------
     8. Evidence fusion
  ----------------------------------------- */

  const riskScore =
    calculateRiskScore(
      signals
    );


  /* -----------------------------------------
     9. Verdict
  ----------------------------------------- */

  const assessment =
    determineVerdict({
      riskScore,
      signals,
    });


  /* -----------------------------------------
     10. Analysis
  ----------------------------------------- */

  const analysis =
    buildAnalysis({
      metadata,
      signals,
      jpegStructure,
      aiIndicators,
    });


  /* -----------------------------------------
     11. Evidence
  ----------------------------------------- */

  const evidence =
    buildEvidence({
      metadata,
      signals,
      aiIndicators,
    });


  /* -----------------------------------------
     12. Processing time
  ----------------------------------------- */

  const processingTime =
    `${(
      (Date.now() -
        startTime) /
      1000
    ).toFixed(2)} seconds`;


  /* -----------------------------------------
     13. Final result
  ----------------------------------------- */

  const result = {
    verdict:
      assessment.verdict,

    confidence:
      assessment.confidence,

    riskScore,

    summary:
      assessment.summary,

    analysis,

    evidence,

    sourcesAnalyzed:
      evidence.length,

    processingTime,

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

    metadata,

    signals,

    forensic: {
      jpegStructure,

      byteCharacteristics,

      aiIndicators,
    },
  };


  /* -----------------------------------------
     Logging
  ----------------------------------------- */

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
    `${result.confidence}%`
  );

  console.log(
    "Risk:",
    `${result.riskScore}/100`
  );

  console.log(
    "Warning signals:",
    signals.filter(
      (signal) =>
        signal.status ===
        "warning"
    ).length
  );

  console.log(
    "Evidence:",
    evidence.length
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


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  analyzeImage,
};