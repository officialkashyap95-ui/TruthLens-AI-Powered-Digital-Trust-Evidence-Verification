const {
  analyzeWithAI,
} = require("./ai/aiRouter");

/* =========================================================
   CONFIGURATION
========================================================= */

const WIKIPEDIA_API =
  "https://en.wikipedia.org/w/rest.php/v1";

const USER_AGENT =
  "TruthLens/1.0 (AI-powered digital trust verification project)";

/* =========================================================
   VERIFICATION ID
========================================================= */

const generateVerificationId = () => {
  const year = new Date().getFullYear();

  const randomNumber = Math.floor(
    1000 + Math.random() * 9000
  );

  return `TL-${year}-${randomNumber}`;
};

/* =========================================================
   STOP WORDS
========================================================= */

const STOP_WORDS = new Set([
  "the",
  "this",
  "that",
  "these",
  "those",
  "there",
  "their",
  "about",
  "with",
  "from",
  "into",
  "than",
  "then",
  "they",
  "them",
  "have",
  "has",
  "had",
  "were",
  "been",
  "being",
  "will",
  "would",
  "could",
  "should",
  "which",
  "where",
  "when",
  "what",
  "whose",
  "while",
  "also",
  "only",
  "very",
  "more",
  "some",
  "such",
  "your",
  "you",
  "for",
  "and",
  "but",
  "not",
  "are",
  "was",
  "can",
  "its",
  "it's",
  "is",
  "in",
  "on",
  "of",
  "to",
  "a",
  "an",
  "as",
  "at",
  "by",
  "or",
  "be",
  "it",
  "we",
  "he",
  "she",
  "his",
  "her",
  "first",
  "person",
]);

/* =========================================================
   TEXT NORMALIZATION
========================================================= */

const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/* =========================================================
   IMPORTANT WORDS
========================================================= */

const getImportantWords = (text = "") => {
  return normalizeText(text)
    .split(" ")
    .filter(
      (word) =>
        word.length >= 3 &&
        !STOP_WORDS.has(word)
    );
};

/* =========================================================
   SEARCH QUERY
========================================================= */

const createSearchQuery = (claim) => {
  const words = getImportantWords(claim);

  return words
    .slice(0, 10)
    .join(" ");
};

/* =========================================================
   WIKIPEDIA SEARCH
========================================================= */

const searchWikipedia = async (query) => {
  if (!query) {
    return [];
  }

  try {
    const url =
      `${WIKIPEDIA_API}/search/page` +
      `?q=${encodeURIComponent(query)}` +
      `&limit=5`;

    console.log(
      `[Evidence] Wikipedia search: ${query}`
    );

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Wikipedia search returned ${response.status}`
      );
    }

    const data = await response.json();

    return Array.isArray(data.pages)
      ? data.pages
      : [];
  } catch (error) {
    console.error(
      "[Evidence] Wikipedia search failed:",
      error.message
    );

    return [];
  }
};

/* =========================================================
   GET WIKIPEDIA PAGE
========================================================= */

const getWikipediaPage = async (key) => {
  if (!key) {
    return null;
  }

  try {
    const url =
      `${WIKIPEDIA_API}/page/` +
      encodeURIComponent(key);

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `[Evidence] Wikipedia page failed: ${response.status}`
      );

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(
      "[Evidence] Wikipedia page error:",
      error.message
    );

    return null;
  }
};

/* =========================================================
   CLEAN WIKIPEDIA TEXT
========================================================= */

const cleanWikipediaText = (text = "") => {
  let cleaned = String(text);

  /*
   * Remove templates.
   */
  cleaned = cleaned.replace(
    /\{\{[\s\S]*?\}\}/g,
    " "
  );

  /*
   * Remove references.
   */
  cleaned = cleaned.replace(
    /<ref[\s\S]*?<\/ref>/gi,
    " "
  );

  /*
   * Remove HTML tags.
   */
  cleaned = cleaned.replace(
    /<[^>]+>/g,
    " "
  );

  /*
   * Convert labelled wiki links.
   */
  cleaned = cleaned.replace(
    /\[\[([^|\]]+)\|([^\]]+)\]\]/g,
    "$2"
  );

  /*
   * Convert normal wiki links.
   */
  cleaned = cleaned.replace(
    /\[\[([^\]]+)\]\]/g,
    "$1"
  );

  /*
   * Remove formatting.
   */
  cleaned = cleaned.replace(
    /'''/g,
    ""
  );

  cleaned = cleaned.replace(
    /''/g,
    ""
  );

  /*
   * Remove headings.
   */
  cleaned = cleaned.replace(
    /={2,6}/g,
    " "
  );

  /*
   * Remove URLs inside raw wiki text.
   */
  cleaned = cleaned.replace(
    /https?:\/\/\S+/g,
    " "
  );

  /*
   * Remove common wiki table markup.
   */
  cleaned = cleaned.replace(
    /^\s*[\|\!].*$/gm,
    " "
  );

  /*
   * Remove leftover wiki syntax.
   */
  cleaned = cleaned.replace(
    /[\|\{\}\[\]]/g,
    " "
  );

  /*
   * Normalize whitespace.
   */
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
};

/* =========================================================
   EXTRACT PAGE TEXT
========================================================= */

const extractPageText = (page) => {
  if (!page) {
    return "";
  }

  return cleanWikipediaText(
    [
      page.title,
      page.description,
      page.source,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

/* =========================================================
   SENTENCE SPLITTING
========================================================= */

const splitIntoSentences = (text = "") => {
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(
      (sentence) =>
        sentence.length >= 40 &&
        sentence.length <= 700
    );
};

/* =========================================================
   SENTENCE RELEVANCE
========================================================= */

const calculateSentenceRelevance = (
  claim,
  sentence
) => {
  const claimWords =
    getImportantWords(claim);

  const sentenceWords = new Set(
    getImportantWords(sentence)
  );

  if (claimWords.length === 0) {
    return 0;
  }

  const matches =
    claimWords.filter((word) =>
      sentenceWords.has(word)
    );

  return Math.round(
    (matches.length / claimWords.length) *
      100
  );
};

/* =========================================================
   EXTRACT RELEVANT PASSAGES
========================================================= */

const extractRelevantPassages = (
  claim,
  pageText
) => {
  const sentences =
    splitIntoSentences(pageText);

  const scored = sentences
    .map((sentence) => ({
      sentence,
      score:
        calculateSentenceRelevance(
          claim,
          sentence
        ),
    }))
    .filter(
      (item) =>
        item.score >= 30
    )
    .sort(
      (a, b) =>
        b.score - a.score
    );

  return scored
    .slice(0, 3)
    .map(
      (item) => item.sentence
    );
};

/* =========================================================
   PAGE RELEVANCE
========================================================= */

const calculatePageRelevance = (
  claim,
  pageText,
  passages
) => {
  const claimWords =
    getImportantWords(claim);

  const pageWords = new Set(
    getImportantWords(pageText)
  );

  if (claimWords.length === 0) {
    return 0;
  }

  const matches =
    claimWords.filter((word) =>
      pageWords.has(word)
    );

  const wordScore =
    Math.round(
      (matches.length /
        claimWords.length) *
        100
    );

  const passageBoost =
    passages.length > 0
      ? 15
      : 0;

  return Math.min(
    100,
    wordScore + passageBoost
  );
};

/* =========================================================
   BUILD WIKIPEDIA EVIDENCE
========================================================= */

const buildWikipediaEvidence = async (
  claim
) => {
  const query =
    createSearchQuery(claim);

  console.log(
    `[Evidence] Search query: ${query}`
  );

  const searchResults =
    await searchWikipedia(query);

  if (
    searchResults.length === 0
  ) {
    console.log(
      "[Evidence] No Wikipedia results."
    );

    return [];
  }

  const evidence = [];

  for (
    const result of searchResults.slice(
      0,
      5
    )
  ) {
    const page =
      await getWikipediaPage(
        result.key
      );

    if (!page) {
      continue;
    }

    const pageText =
      extractPageText(page);

    if (!pageText) {
      continue;
    }

    const passages =
      extractRelevantPassages(
        claim,
        pageText
      );

    const relevance =
      calculatePageRelevance(
        claim,
        pageText,
        passages
      );

    console.log(
      `[Evidence] ${page.title} relevance: ${relevance}%`
    );

    if (
      relevance < 35 &&
      passages.length === 0
    ) {
      continue;
    }

    const title =
      page.title ||
      result.title ||
      "Wikipedia reference";

    const url =
      page.html_url ||
      result.html_url ||
      `https://en.wikipedia.org/wiki/${encodeURIComponent(
        title.replace(/ /g, "_")
      )}`;

    const description =
      passages.length > 0
        ? passages.join(" ")
        : (
            page.description ||
            result.description ||
            "Relevant public reference."
          );

    evidence.push({
      type: "context",
      title,
      domain: "wikipedia.org",
      description,
      url,
      relevance,
    });
  }

  /*
   * Highest relevance first.
   */
  evidence.sort(
    (a, b) =>
      b.relevance -
      a.relevance
  );

  /*
   * Remove duplicate URLs.
   */
  const uniqueEvidence = [];

  const seenUrls = new Set();

  for (const item of evidence) {
    if (seenUrls.has(item.url)) {
      continue;
    }

    seenUrls.add(item.url);

    uniqueEvidence.push(item);
  }

  return uniqueEvidence.slice(
    0,
    5
  );
};

/* =========================================================
   PREPARE EVIDENCE FOR AI
========================================================= */

const prepareEvidenceForAI = (
  evidence
) => {
  return evidence.map(
    ({
      type,
      title,
      domain,
      description,
      url,
    }) => ({
      type,
      title,
      domain,
      description,
      url,
    })
  );
};

/* =========================================================
   ALLOWED VERDICTS
========================================================= */

const ALLOWED_VERDICTS =
  new Set([
    "Likely True",
    "Likely Misleading",
    "Likely False",
    "Insufficient Evidence",
  ]);

/* =========================================================
   CONFIDENCE CALCULATION
========================================================= */

const calculateSafeConfidence = ({
  verdict,
  aiConfidence,
  evidence,
}) => {
  let confidence =
    Number(aiConfidence);

  if (!Number.isFinite(confidence)) {
    confidence = 0;
  }

  confidence = Math.round(
    Math.max(
      0,
      Math.min(100, confidence)
    )
  );

  /*
   * No evidence:
   *
   * Never allow high confidence.
   */
  if (evidence.length === 0) {
    return verdict ===
      "Insufficient Evidence"
      ? Math.min(confidence, 20)
      : 15;
  }

  const relevanceScores =
    evidence.map(
      (item) =>
        Number(
          item.relevance || 0
        )
    );

  const strongestEvidence =
    Math.max(
      ...relevanceScores
    );

  /*
   * Evidence strength caps.
   */

  if (
    strongestEvidence < 40
  ) {
    confidence =
      Math.min(
        confidence,
        45
      );
  } else if (
    strongestEvidence < 60
  ) {
    confidence =
      Math.min(
        confidence,
        65
      );
  } else if (
    strongestEvidence < 80
  ) {
    confidence =
      Math.min(
        confidence,
        82
      );
  }

  /*
   * Insufficient Evidence
   * should not have 90+ confidence.
   *
   * High confidence means:
   * "we are highly confident that
   * we don't have enough evidence."
   *
   * That's not useful to the user.
   */
  if (
    verdict ===
    "Insufficient Evidence"
  ) {
    confidence =
      Math.min(
        confidence,
        60
      );
  }

  return confidence;
};

/* =========================================================
   VALIDATE AI RESULT
========================================================= */

const validateAIResult = (
  result,
  evidence
) => {
  if (
    !result ||
    typeof result !== "object"
  ) {
    throw new Error(
      "AI returned an invalid result."
    );
  }

  let verdict =
    result.verdict;

  if (
    !ALLOWED_VERDICTS.has(
      verdict
    )
  ) {
    verdict =
      "Insufficient Evidence";
  }

  const confidence =
    calculateSafeConfidence({
      verdict,
      aiConfidence:
        result.confidence,
      evidence,
    });

  /*
   * Normalize analysis.
   */
  const analysis =
    Array.isArray(
      result.analysis
    )
      ? result.analysis
      : [];

  const normalizedAnalysis =
    [
      "Claim Consistency",
      "Source Credibility",
      "Evidence Agreement",
      "Context Analysis",
    ].map((title) => {
      const existing =
        analysis.find(
          (item) =>
            item?.title === title
        );

      return {
        title,

        description:
          typeof existing?.description ===
          "string"
            ? existing.description
            : "No additional analysis was provided.",
      };
    });

  /*
   * Only URLs we actually supplied
   * to the AI are allowed.
   */
  const allowedUrls =
    new Set(
      evidence
        .map(
          (item) => item.url
        )
        .filter(Boolean)
    );

  const validEvidence =
    Array.isArray(
      result.evidence
    )
      ? result.evidence
          .filter(
            (item) =>
              item &&
              typeof item ===
                "object" &&
              item.url &&
              allowedUrls.has(
                item.url
              )
          )
          .map((item) => ({
            type: [
              "supporting",
              "contradicting",
              "context",
            ].includes(
              item.type
            )
              ? item.type
              : "context",

            title:
              String(
                item.title || ""
              ).slice(0, 200),

            domain:
              String(
                item.domain || ""
              ).slice(0, 100),

            description:
              String(
                item.description ||
                  ""
              ).slice(0, 2000),

            url: item.url,
          }))
      : [];

  /*
   * If AI doesn't classify evidence,
   * preserve the evidence we actually
   * collected.
   */
  const finalEvidence =
    validEvidence.length > 0
      ? validEvidence
      : evidence.map(
          ({
            relevance,
            ...item
          }) => ({
            ...item,
            type: "context",
          })
        );

  /*
   * Ensure every evidence item
   * has a valid description.
   */
  const safeEvidence =
    finalEvidence.map(
      (item) => ({
        type:
          item.type || "context",

        title:
          item.title ||
          "Reference",

        domain:
          item.domain ||
          "unknown",

        description:
          item.description ||
          "Relevant evidence was found in this source.",

        url:
          item.url || "",
      })
    );

  return {
    verdict,

    confidence,

    summary:
      typeof result.summary ===
        "string" &&
      result.summary.trim()
        ? result.summary.trim()
        : "The available evidence was insufficient to produce a detailed assessment.",

    analysis:
      normalizedAnalysis,

    evidence:
      safeEvidence,

    sourcesAnalyzed:
      safeEvidence.length,
  };
};

/* =========================================================
   MAIN VERIFICATION ENGINE
========================================================= */

const analyzeContent = async ({
  type,
  content,
  source = "",
}) => {
  const startTime =
    Date.now();

  /* -----------------------------------------
     VALIDATION
  ----------------------------------------- */

  if (type !== "text") {
    throw new Error(
      "Only text verification is currently supported."
    );
  }

  const claim =
    typeof content ===
    "string"
      ? content.trim()
      : "";

  if (!claim) {
    throw new Error(
      "Verification content is empty."
    );
  }

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "TruthLens Verification Engine"
  );
  console.log(
    "========================================"
  );

  console.log(
    "Claim:",
    claim
  );

  console.log(
    "Source:",
    source || "None"
  );

  /* -----------------------------------------
     COLLECT EVIDENCE
  ----------------------------------------- */

  const evidence =
    await buildWikipediaEvidence(
      claim
    );

  console.log(
    `[Evidence] Collected ${evidence.length} relevant source(s).`
  );

  evidence.forEach(
    (item, index) => {
      console.log("");

      console.log(
        `[Evidence ${index + 1}] ${item.title}`
      );

      console.log(
        `Relevance: ${item.relevance}%`
      );

      console.log(
        item.description
      );
    }
  );

  /* -----------------------------------------
     USER SOURCE
  ----------------------------------------- */

  if (source) {
    try {
      const sourceUrl =
        new URL(source);

      evidence.push({
        type: "context",

        title:
          "User-provided source",

        domain:
          sourceUrl.hostname,

        description:
          "Source URL supplied by the user for additional verification context.",

        url: source,

        relevance: 50,
      });
    } catch {
      console.log(
        "[Evidence] Invalid source URL."
      );
    }
  }

  /* -----------------------------------------
     PREPARE AI EVIDENCE
  ----------------------------------------- */

  const aiEvidence =
    prepareEvidenceForAI(
      evidence
    );

  /* -----------------------------------------
     AI ANALYSIS
  ----------------------------------------- */

  let aiResult;

  try {
    console.log(
      "[AI] Starting evidence evaluation..."
    );

    aiResult =
      await analyzeWithAI({
        content: claim,
        source,
        evidence:
          aiEvidence,
      });

    console.log(
      `[AI] Provider: ${
        aiResult.provider ||
        "Unknown"
      }`
    );

    console.log(
      "[AI] Verdict:",
      aiResult.verdict
    );

    console.log(
      "[AI] Confidence:",
      aiResult.confidence
    );
  } catch (error) {
    console.error(
      "[AI] All providers failed:",
      error.message
    );

    aiResult = {
      verdict:
        "Insufficient Evidence",

      confidence: 0,

      summary:
        "TruthLens collected evidence, but the AI verification service was unavailable.",

      analysis: [],

      evidence: [],

      provider: "",
    };
  }

  /* -----------------------------------------
     VALIDATE RESULT
  ----------------------------------------- */

  const validated =
    validateAIResult(
      aiResult,
      evidence
    );

  /* -----------------------------------------
     PROCESSING TIME
  ----------------------------------------- */

  const processingTime =
    `${(
      (Date.now() -
        startTime) /
      1000
    ).toFixed(2)} seconds`;

  /* -----------------------------------------
     FINAL RESULT
  ----------------------------------------- */

  const result = {
    verdict:
      validated.verdict,

    confidence:
      validated.confidence,

    summary:
      validated.summary,

    analysis:
      validated.analysis,

    evidence:
      validated.evidence,

    sourcesAnalyzed:
      validated.sourcesAnalyzed,

    provider:
      aiResult.provider ||
      "",

    processingTime,

    verificationId:
      generateVerificationId(),
  };

  console.log("");

  console.log(
    "========== TRUTHLENS RESULT =========="
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
    "Evidence:",
    result.evidence.length
  );

  console.log(
    "Provider:",
    result.provider ||
      "None"
  );

  console.log(
    "Processing:",
    result.processingTime
  );

  console.log(
    "======================================="
  );

  return result;
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  analyzeContent,
};