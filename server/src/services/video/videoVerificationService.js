const fs = require("fs");

const {
    analyzeImageWithGeminiVision,
} = require("../ai/geminiVisionService");

const {
    getVideoMetadata,
} = require("./videoMetadataService");

const {
    extractVideoFrames,
} = require("./videoFrameService");


/* =========================================================
   CONFIGURATION
========================================================= */

/*
 * A frame becomes suspicious when its strongest risk signal
 * reaches this threshold.
 */
const SUSPICIOUS_FRAME_THRESHOLD = 60;


/*
 * A frame is considered strongly suspicious at this level.
 */
const HIGH_RISK_THRESHOLD = 80;


/*
 * A suspicious segment should contain at least this many
 * suspicious frames.
 *
 * Example:
 *
 * Frame 3 -> suspicious
 * Frame 4 -> suspicious
 * Frame 5 -> suspicious
 *
 * = suspicious segment
 */
const MIN_SEGMENT_FRAMES = 2;


/*
 * Maximum timestamp gap allowed between consecutive
 * suspicious frames in the same segment.
 *
 * This is intentionally generous because sampled frames
 * are not necessarily one second apart.
 */
const MAX_SEGMENT_GAP_SECONDS = 2.5;


/*
 * Maximum number of suspicious segments returned to the
 * frontend. We keep the strongest ones.
 */
const MAX_SUSPICIOUS_SEGMENTS = 10;


/* =========================================================
   BASIC HELPERS
========================================================= */

const getNumericValues = (
    frameResults,
    field
) => {
    return frameResults
        .map((item) => {
            const value = Number(
                item?.result?.[field]
            );

            return Number.isFinite(value)
                ? value
                : null;
        })
        .filter(
            (value) => value !== null
        );
};


const average = (
    values
) => {
    if (!values.length) {
        return null;
    }

    return (
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / values.length
    );
};


const roundScore = (
    value
) => {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(value)
    ) {
        return null;
    }

    return Math.round(value);
};


const clampScore = (
    value,
    minimum = 0,
    maximum = 100
) => {
    if (
        !Number.isFinite(value)
    ) {
        return null;
    }

    return Math.min(
        maximum,
        Math.max(
            minimum,
            value
        )
    );
};


/* =========================================================
   FRAME RISK
========================================================= */

/**
 * Calculate the risk of an individual frame.
 *
 * We use the stronger of:
 *
 * - manipulationScore
 * - aiGeneratedScore
 *
 * Missing values are NOT converted to zero.
 */
const getFrameRisk = (
    frameResult
) => {
    const manipulation =
        Number(
            frameResult?.result
                ?.manipulationScore
        );

    const aiGeneration =
        Number(
            frameResult?.result
                ?.aiGeneratedScore
        );

    const values = [
        manipulation,
        aiGeneration,
    ].filter(
        (value) =>
            Number.isFinite(value)
    );

    if (!values.length) {
        return null;
    }

    return Math.max(
        ...values
    );
};


/* =========================================================
   ENRICH FRAME RESULTS
========================================================= */

/**
 * Add calculated risk information to every successful frame.
 */
const enrichFrameResults = (
    frameResults
) => {
    return frameResults.map(
        (frame) => {

            const frameRisk =
                getFrameRisk(
                    frame
                );

            const confidence =
                Number(
                    frame.result
                        ?.confidence
                );

            return {
                ...frame,

                frameRisk:
                    frameRisk !== null
                        ? roundScore(
                            frameRisk
                        )
                        : null,

                suspicious:
                    frameRisk !== null &&
                    frameRisk >=
                        SUSPICIOUS_FRAME_THRESHOLD,

                highRisk:
                    frameRisk !== null &&
                    frameRisk >=
                        HIGH_RISK_THRESHOLD,

                frameConfidence:
                    Number.isFinite(
                        confidence
                    )
                        ? roundScore(
                            confidence
                        )
                        : null,
            };
        }
    );
};


/* =========================================================
   SUSPICIOUS FRAMES
========================================================= */

const getSuspiciousFrames = (
    frameResults
) => {
    return frameResults
        .filter(
            (frame) =>
                frame.result &&
                frame.suspicious
        )
        .sort(
            (a, b) =>
                (b.frameRisk || 0) -
                (a.frameRisk || 0)
        );
};


/* =========================================================
   SUSPICIOUS SEGMENTS
========================================================= */

/**
 * Group suspicious frames that occur close together
 * in the video timeline.
 *
 * Example:
 *
 * Frame 2 -> 1.6s -> risk 70
 * Frame 3 -> 2.4s -> risk 85
 * Frame 4 -> 3.2s -> risk 90
 *
 * becomes one segment:
 *
 * 1.6s - 3.2s
 */
const detectSuspiciousSegments = (
    frameResults
) => {

    const suspiciousFrames =
        frameResults
            .filter(
                (frame) =>
                    frame.result &&
                    frame.suspicious
            )
            .sort(
                (a, b) =>
                    a.timestampSeconds -
                    b.timestampSeconds
            );

    if (
        suspiciousFrames.length === 0
    ) {
        return [];
    }

    const segments = [];

    let currentSegment = [
        suspiciousFrames[0],
    ];


    for (
        let i = 1;
        i < suspiciousFrames.length;
        i += 1
    ) {

        const previous =
            suspiciousFrames[i - 1];

        const current =
            suspiciousFrames[i];

        const timeGap =
            current.timestampSeconds -
            previous.timestampSeconds;


        /*
         * Consecutive suspicious frames close in time
         * belong to the same suspicious segment.
         */
        if (
            timeGap <=
            MAX_SEGMENT_GAP_SECONDS
        ) {

            currentSegment.push(
                current
            );

        } else {

            segments.push(
                currentSegment
            );

            currentSegment = [
                current,
            ];
        }
    }


    /*
     * Add final segment.
     */
    if (
        currentSegment.length
    ) {
        segments.push(
            currentSegment
        );
    }


    /*
     * Convert raw frame groups into useful
     * frontend-friendly segment objects.
     */
    const processedSegments =
        segments
            .map(
                (segment, index) => {

                    const risks =
                        segment
                            .map(
                                (frame) =>
                                    frame.frameRisk
                            )
                            .filter(
                                (risk) =>
                                    Number.isFinite(
                                        risk
                                    )
                            );

                    const confidences =
                        segment
                            .map(
                                (frame) =>
                                    frame.frameConfidence
                            )
                            .filter(
                                (confidence) =>
                                    Number.isFinite(
                                        confidence
                                    )
                            );


                    const averageRisk =
                        risks.length
                            ? average(
                                risks
                            )
                            : null;


                    const peakRisk =
                        risks.length
                            ? Math.max(
                                ...risks
                            )
                            : null;


                    const averageConfidence =
                        confidences.length
                            ? average(
                                confidences
                            )
                            : null;


                    const startTime =
                        segment[0]
                            .timestampSeconds;


                    const endTime =
                        segment[
                            segment.length - 1
                        ].timestampSeconds;


                    /*
                     * Segment severity is based on
                     * its strongest evidence.
                     */
                    let severity =
                        "Moderate";


                    if (
                        peakRisk !== null &&
                        peakRisk >= 85
                    ) {
                        severity =
                            "High";
                    } else if (
                        peakRisk !== null &&
                        peakRisk >= 70
                    ) {
                        severity =
                            "Elevated";
                    }


                    return {

                        segmentIndex:
                            index + 1,

                        startTimeSeconds:
                            startTime,

                        endTimeSeconds:
                            endTime,

                        startTimestamp:
                            segment[0]
                                .timestamp,

                        endTimestamp:
                            segment[
                                segment.length - 1
                            ].timestamp,

                        durationSeconds:
                            Number(
                                (
                                    endTime -
                                    startTime
                                ).toFixed(2)
                            ),

                        frames:
                            segment.map(
                                (frame) => ({
                                    frameIndex:
                                        frame.frameIndex,

                                    timestamp:
                                        frame.timestamp,

                                    timestampSeconds:
                                        frame.timestampSeconds,

                                    frameRisk:
                                        frame.frameRisk,

                                    confidence:
                                        frame.frameConfidence,

                                    isSceneChange:
                                        frame.isSceneChange ||
                                        false,
                                })
                            ),

                        framesCount:
                            segment.length,

                        averageRisk:
                            roundScore(
                                averageRisk
                            ),

                        peakRisk:
                            roundScore(
                                peakRisk
                            ),

                        averageConfidence:
                            roundScore(
                                averageConfidence
                            ),

                        severity,
                    };
                }
            )
            /*
             * Very small isolated suspicious frames are still
             * useful evidence, but we don't call them a
             * "segment" unless they have enough temporal support.
             */
            .filter(
                (segment) =>
                    segment.framesCount >=
                    MIN_SEGMENT_FRAMES
            );


    /*
     * Strongest segments first.
     */
    processedSegments.sort(
        (a, b) => {

            if (
                b.peakRisk !==
                a.peakRisk
            ) {
                return (
                    b.peakRisk -
                    a.peakRisk
                );
            }

            return (
                b.averageRisk -
                a.averageRisk
            );
        }
    );


    return processedSegments.slice(
        0,
        MAX_SUSPICIOUS_SEGMENTS
    );
};


/* =========================================================
   VIDEO RISK FUSION
========================================================= */

/**
 * Combine overall frame behavior with the strongest
 * suspicious evidence.
 *
 * IMPORTANT:
 *
 * This is a deterministic evidence-fusion heuristic.
 * It is NOT a statistically calibrated deepfake model.
 *
 * Later, these weights should be calibrated using a
 * labeled validation dataset.
 */
const calculateVideoRisk = ({
    averageRisk,
    peakRisk,
    suspiciousFrameRatio,
    suspiciousSegments,
}) => {

    if (
        averageRisk === null &&
        peakRisk === null
    ) {
        return null;
    }


    /*
     * If only one signal exists, use it directly.
     */
    if (
        averageRisk === null
    ) {
        return roundScore(
            peakRisk
        );
    }

    if (
        peakRisk === null
    ) {
        return roundScore(
            averageRisk
        );
    }


    /*
     * Start with the overall average.
     *
     * This prevents a single anomalous frame from
     * automatically making the entire video suspicious.
     */
    let fusedRisk =
        averageRisk * 0.60 +
        peakRisk * 0.40;


    /*
     * If suspicious frames form a meaningful portion
     * of the analyzed video, increase the risk.
     *
     * Maximum contribution: +10 points.
     */
    if (
        suspiciousFrameRatio > 0
    ) {

        const ratioBoost =
            Math.min(
                10,
                suspiciousFrameRatio *
                    20
            );

        fusedRisk +=
            ratioBoost;
    }


    /*
     * A temporally connected suspicious segment
     * is stronger evidence than isolated frames.
     *
     * Add a modest boost.
     */
    if (
        suspiciousSegments.length > 0
    ) {

        const strongestSegment =
            suspiciousSegments[0];

        if (
            strongestSegment.peakRisk >=
            HIGH_RISK_THRESHOLD
        ) {
            fusedRisk += 5;
        }
    }


    return roundScore(
        clampScore(
            fusedRisk
        )
    );
};


/* =========================================================
   DETERMINE VIDEO VERDICT
========================================================= */

/**
 * Determine the high-level video classification.
 *
 * These thresholds are heuristic starting points.
 * They should eventually be calibrated against labeled
 * real/deepfake validation videos.
 */
const determineVerdict = ({
    risk,
    averageRisk,
    peakRisk,
    aiGeneration,
    confidence,
    suspiciousFrameRatio,
    suspiciousSegments,
}) => {

    /*
     * No usable risk information.
     */
    if (
        risk === null &&
        aiGeneration === null
    ) {
        return "Insufficient Evidence";
    }


    /*
     * Strong video-level evidence.
     */
    if (
        risk !== null &&
        risk >= 70
    ) {
        return "Suspicious";
    }


    /*
     * A very strong individual frame should not be
     * completely hidden by averaging.
     *
     * However, require reasonable confidence.
     */
    if (
        peakRisk !== null &&
        peakRisk >= 85 &&
        confidence !== null &&
        confidence >= 50
    ) {
        return "Suspicious";
    }


    /*
     * A high-risk suspicious segment is stronger than
     * one isolated frame.
     */
    if (
        suspiciousSegments.length > 0 &&
        suspiciousSegments[0].peakRisk >= 80 &&
        suspiciousFrameRatio >= 0.20
    ) {
        return "Suspicious";
    }


    /*
     * Strongly low-risk result.
     *
     * Require:
     *
     * - low overall risk
     * - low AI-generation score
     * - reasonable confidence
     * - no meaningful suspicious segment
     */
    const lowRisk =
        risk !== null &&
        risk < 40;

    const lowAIGeneration =
        aiGeneration !== null &&
        aiGeneration < 40;

    const reasonableConfidence =
        confidence !== null &&
        confidence >= 50;

    const noMeaningfulSegment =
        suspiciousSegments.length === 0;


    if (
        lowRisk &&
        lowAIGeneration &&
        reasonableConfidence &&
        noMeaningfulSegment
    ) {
        return "Likely Authentic";
    }


    /*
     * Everything between strong evidence and
     * low-risk evidence remains uncertain.
     */
    return "Insufficient Evidence";
};


/* =========================================================
   ANALYZE VIDEO
========================================================= */

const analyzeVideo = async ({
    buffer,
    originalname,
    mimetype,
}) => {

    console.log("");

    console.log(
        "========================================"
    );

    console.log(
        "[Video] Starting TruthLens video analysis"
    );

    console.log(
        "========================================"
    );


    let frameResult = null;


    try {

        /* =====================================================
           1. VIDEO METADATA
        ===================================================== */

        const metadata =
            await getVideoMetadata(
                buffer
            );


        console.log(
            `[Video] Duration: ${metadata.duration.toFixed(
                2
            )} seconds`
        );

        console.log(
            `[Video] Resolution: ${metadata.width}x${metadata.height}`
        );

        console.log(
            `[Video] FPS: ${metadata.fps}`
        );

        console.log(
            `[Video] Codec: ${metadata.codec}`
        );


        /* =====================================================
           2. EXTRACT FRAMES
        ===================================================== */

        frameResult =
            await extractVideoFrames(
                buffer,
                metadata.duration
            );


        console.log(
            `[Video] Frames extracted: ${frameResult.frames.length}`
        );


        if (
            !frameResult.frames.length
        ) {
            throw new Error(
                "No frames could be extracted from the video."
            );
        }


        /* =====================================================
           3. ANALYZE EACH FRAME
        ===================================================== */

        const frameResults = [];


        for (
            const frame of
            frameResult.frames
        ) {

            console.log(
                `[Video] Analyzing frame ${frame.index}/${frameResult.frames.length}`
            );


            try {

                const frameBuffer =
                    fs.readFileSync(
                        frame.filePath
                    );


                const result =
                    await analyzeImageWithGeminiVision({
                        buffer:
                            frameBuffer,

                        mimetype:
                            "image/jpeg",

                        originalname:
                            frame.fileName,

                        metadata: {

                            videoName:
                                originalname,

                            frameIndex:
                                frame.index,

                            totalFrames:
                                frameResult.frames.length,
                        },

                        forensicSignals:
                            [],
                    });


                frameResults.push({

                    frameIndex:
                        frame.index,

                    fileName:
                        frame.fileName,

                    timestampSeconds:
                        frame.timestampSeconds,

                    timestamp:
                        frame.timestamp,

                    isSceneChange:
                        frame.isSceneChange ||
                        false,

                    result,
                });


                console.log(
                    `[Video] Frame ${frame.index} completed`
                );

                console.log(
                    `[Video]   Classification: ${result.classification}`
                );

                console.log(
                    `[Video]   Manipulation: ${result.manipulationScore}`
                );

                console.log(
                    `[Video]   AI generation: ${result.aiGeneratedScore}`
                );

                console.log(
                    `[Video]   Confidence: ${result.confidence}`
                );


            } catch (error) {

                console.error(
                    `[Video] Frame ${frame.index} failed:`,
                    error.message
                );


                frameResults.push({

                    frameIndex:
                        frame.index,

                    fileName:
                        frame.fileName,

                    timestampSeconds:
                        frame.timestampSeconds,

                    timestamp:
                        frame.timestamp,

                    isSceneChange:
                        frame.isSceneChange ||
                        false,

                    result:
                        null,

                    error:
                        error.message,
                });
            }
        }


        /* =====================================================
           4. SUCCESSFUL FRAME RESULTS
        ===================================================== */

        const successfulResults =
            frameResults.filter(
                (item) =>
                    item.result
            );


        if (
            successfulResults.length === 0
        ) {
            throw new Error(
                "Unable to analyze any video frames."
            );
        }


        /*
         * Add frame-level risk information.
         */
        const enrichedFrames =
            enrichFrameResults(
                successfulResults
            );


        /*
         * Suspicious frames.
         */
        const suspiciousFrames =
            getSuspiciousFrames(
                enrichedFrames
            );


        /*
         * Suspicious temporal segments.
         */
        const suspiciousSegments =
            detectSuspiciousSegments(
                enrichedFrames
            );


        console.log(
            `[Video] Successful frame analyses: ${successfulResults.length}/${frameResults.length}`
        );


        console.log(
            `[Video] Suspicious frames: ${suspiciousFrames.length}/${enrichedFrames.length}`
        );


        console.log(
            `[Video] Suspicious segments: ${suspiciousSegments.length}`
        );


        for (
            const frame of
            suspiciousFrames
        ) {

            console.log(
                `[Video] Suspicious frame ${frame.frameIndex} at ${frame.timestamp} - risk ${frame.frameRisk}`
            );
        }


        for (
            const segment of
            suspiciousSegments
        ) {

            console.log(
                `[Video] Suspicious segment ${segment.segmentIndex}: ${segment.startTimestamp} - ${segment.endTimestamp} | peak risk ${segment.peakRisk} | severity ${segment.severity}`
            );
        }


        /* =====================================================
           5. EXTRACT SCORES
        ===================================================== */

        const confidenceValues =
            getNumericValues(
                successfulResults,
                "confidence"
            );


        const manipulationValues =
            getNumericValues(
                successfulResults,
                "manipulationScore"
            );


        const aiGenerationValues =
            getNumericValues(
                successfulResults,
                "aiGeneratedScore"
            );


        const authenticityValues =
            getNumericValues(
                successfulResults,
                "visualAuthenticityScore"
            );


        /* =====================================================
           6. BASIC AGGREGATES
        ===================================================== */

        const averageConfidence =
            roundScore(
                average(
                    confidenceValues
                )
            );


        const averageManipulation =
            roundScore(
                average(
                    manipulationValues
                )
            );


        const averageAIGeneration =
            roundScore(
                average(
                    aiGenerationValues
                )
            );


        const averageAuthenticity =
            roundScore(
                average(
                    authenticityValues
                )
            );


        /* =====================================================
           7. FRAME RISK STATISTICS
        ===================================================== */

        const frameRiskValues =
            enrichedFrames
                .map(
                    (frame) =>
                        frame.frameRisk
                )
                .filter(
                    (risk) =>
                        Number.isFinite(
                            risk
                        )
                );


        const averageRisk =
            roundScore(
                average(
                    frameRiskValues
                )
            );


        const peakRisk =
            frameRiskValues.length
                ? roundScore(
                    Math.max(
                        ...frameRiskValues
                    )
                )
                : null;


        const suspiciousFrameRatio =
            enrichedFrames.length
                ? Number(
                    (
                        suspiciousFrames.length /
                        enrichedFrames.length
                    ).toFixed(3)
                )
                : 0;


        const suspiciousFramePercentage =
            roundScore(
                suspiciousFrameRatio * 100
            );


        /* =====================================================
           8. VIDEO RISK FUSION
        ===================================================== */

        const risk =
            calculateVideoRisk({

                averageRisk,

                peakRisk,

                suspiciousFrameRatio,

                suspiciousSegments,
            });


        /* =====================================================
           9. DETERMINE VERDICT
        ===================================================== */

        const verdict =
            determineVerdict({

                risk,

                averageRisk,

                peakRisk,

                aiGeneration:
                    averageAIGeneration,

                confidence:
                    averageConfidence,

                suspiciousFrameRatio,

                suspiciousSegments,
            });


        /* =====================================================
           10. EVIDENCE QUALITY
        ===================================================== */

        let evidenceQuality =
            "Limited";


        if (
            enrichedFrames.length >= 6 &&
            averageConfidence !== null &&
            averageConfidence >= 70
        ) {
            evidenceQuality =
                "Good";
        }


        if (
            enrichedFrames.length >= 10 &&
            averageConfidence !== null &&
            averageConfidence >= 75
        ) {
            evidenceQuality =
                "Strong";
        }


        /*
         * If many frames failed, downgrade evidence quality.
         */
        const analysisSuccessRatio =
            frameResults.length
                ? successfulResults.length /
                  frameResults.length
                : 0;


        if (
            analysisSuccessRatio < 0.75
        ) {
            evidenceQuality =
                "Limited";
        }


        /* =====================================================
           11. FINAL LOG
        ===================================================== */

        console.log("");

        console.log(
            "========== VIDEO RESULT =========="
        );

        console.log(
            "Verdict:",
            verdict
        );

        console.log(
            "Confidence:",
            averageConfidence
        );

        console.log(
            "Average Risk:",
            averageRisk
        );

        console.log(
            "Peak Risk:",
            peakRisk
        );

        console.log(
            "Fused Risk:",
            risk
        );

        console.log(
            "Manipulation:",
            averageManipulation
        );

        console.log(
            "AI Generation:",
            averageAIGeneration
        );

        console.log(
            "Authenticity:",
            averageAuthenticity
        );

        console.log(
            "Suspicious Frames:",
            `${suspiciousFrames.length}/${enrichedFrames.length}`
        );

        console.log(
            "Suspicious Frame Ratio:",
            `${suspiciousFramePercentage}%`
        );

        console.log(
            "Suspicious Segments:",
            suspiciousSegments.length
        );

        console.log(
            "Evidence Quality:",
            evidenceQuality
        );

        console.log(
            "Frames:",
            successfulResults.length
        );

        console.log(
            "=================================="
        );


        /* =====================================================
           12. RETURN RESULT
        ===================================================== */

        return {

            /*
             * Existing fields preserved.
             */
            verdict,

            confidence:
                averageConfidence,

            risk,

            aiGeneration:
                averageAIGeneration,

            manipulationScore:
                averageManipulation,

            visualAuthenticityScore:
                averageAuthenticity,


            /*
             * New video evidence fields.
             */
            evidenceQuality,

            averageRisk,

            peakRisk,

            suspiciousFrameRatio,

            suspiciousFramePercentage,

            suspiciousFrameCount:
                suspiciousFrames.length,

            suspiciousSegmentCount:
                suspiciousSegments.length,


            /* =================================================
               METADATA
            ================================================= */

            metadata: {

                duration:
                    metadata.duration,

                width:
                    metadata.width,

                height:
                    metadata.height,

                fps:
                    metadata.fps,

                codec:
                    metadata.codec,

                format:
                    metadata.format,

                framesAnalyzed:
                    successfulResults.length,

                totalFrames:
                    frameResults.length,

                sceneChanges:
                    frameResult
                        .sceneChanges
                        ?.length || 0,
            },


            /* =================================================
               ALL FRAME RESULTS
            ================================================= */

            frames:
                frameResults.map(
                    (frame) => {

                        const enriched =
                            enrichedFrames.find(
                                (item) =>
                                    item.frameIndex ===
                                    frame.frameIndex
                            );


                        return {

                            ...frame,

                            frameRisk:
                                enriched
                                    ?.frameRisk ??
                                null,

                            suspicious:
                                enriched
                                    ?.suspicious ??
                                false,

                            highRisk:
                                enriched
                                    ?.highRisk ??
                                false,

                            frameConfidence:
                                enriched
                                    ?.frameConfidence ??
                                null,
                        };
                    }
                ),


            /* =================================================
               SUSPICIOUS FRAMES
            ================================================= */

            suspiciousFrames:
                suspiciousFrames.map(
                    (frame) => ({

                        frameIndex:
                            frame.frameIndex,

                        fileName:
                            frame.fileName,

                        timestampSeconds:
                            frame.timestampSeconds,

                        timestamp:
                            frame.timestamp,

                        frameRisk:
                            frame.frameRisk,

                        manipulationScore:
                            frame.result
                                ?.manipulationScore ??
                            null,

                        aiGeneratedScore:
                            frame.result
                                ?.aiGeneratedScore ??
                            null,

                        confidence:
                            frame.frameConfidence,

                        isSceneChange:
                            frame.isSceneChange ||
                            false,
                    })
                ),


            /* =================================================
               SUSPICIOUS SEGMENTS
            ================================================= */

            suspiciousSegments,
        };


    } finally {

        /* =====================================================
           13. ALWAYS CLEAN TEMP FILES
        ===================================================== */

        if (
            frameResult?.tempDir
        ) {

            try {

                fs.rmSync(
                    frameResult.tempDir,
                    {
                        recursive:
                            true,

                        force:
                            true,
                    }
                );


                console.log(
                    "[Video] Temporary files cleaned."
                );


            } catch (
                cleanupError
            ) {

                console.error(
                    "[Video] Temporary file cleanup failed:",
                    cleanupError.message
                );
            }
        }
    }
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    analyzeVideo,
};