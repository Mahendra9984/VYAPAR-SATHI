import { GoogleGenAI } from "@google/genai";
import { getMarketAnalysis } from "../services/marketAnalysisService.js";

// =====================================================
// GEMINI AI CLIENT
// =====================================================

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
}

const ai = new GoogleGenAI({
    apiKey,
});

// =====================================================
// AI MODELS
// =====================================================

// Keep these models configurable through environment variables.
// This also makes it easy to change models later without
// modifying controller code.

const PRIMARY_MODEL =
    process.env.GEMINI_PRIMARY_MODEL || "gemini-3.7-flash";

const FALLBACK_MODEL =
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash";

// =====================================================
// RETRY CONFIG
// =====================================================

const MAX_RETRIES = 3;
const BASE_DELAY = 1500;

// =====================================================
// DELAY
// =====================================================

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

// =====================================================
// GET ERROR STATUS
// =====================================================

const getErrorStatus = (error) => {
    return (
        error?.status ||
        error?.statusCode ||
        error?.code ||
        error?.response?.status ||
        null
    );
};

// =====================================================
// GET ERROR MESSAGE
// =====================================================

const getErrorMessage = (error) => {
    return (
        error?.message ||
        error?.error?.message ||
        error?.response?.data?.error?.message ||
        String(error || "Unknown error")
    );
};

// =====================================================
// RETRYABLE ERROR
// =====================================================

const isRetryableError = (error) => {
    const status = getErrorStatus(error);

    const message = getErrorMessage(error).toLowerCase();

    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes("resource_exhausted") ||
        message.includes("resource exhausted") ||
        message.includes("unavailable") ||
        message.includes("high demand") ||
        message.includes("temporarily unavailable") ||
        message.includes("internal error") ||
        message.includes("overloaded")
    );
};

// =====================================================
// GEMINI REQUEST
// =====================================================

const generateAIResponse = async (
    model,
    userPrompt,
    systemInstruction
) => {
    let lastError = null;

    for (
        let attempt = 0;
        attempt < MAX_RETRIES;
        attempt++
    ) {
        try {
            console.log(
                `🤖 Gemini request: ${model} | Attempt ${attempt + 1
                }/${MAX_RETRIES}`
            );

            const response =
                await ai.models.generateContent({
                    model,
                    contents: userPrompt,
                    config: {
                        systemInstruction,
                        temperature: 0.7,
                        maxOutputTokens: 3000,
                    },
                });

            console.log(
                `✅ Gemini response received from ${model}`
            );

            return response;
        } catch (error) {
            lastError = error;

            console.error(
                `❌ Gemini Error (${model}) attempt ${attempt + 1
                }:`,
                getErrorMessage(error)
            );

            console.error(
                "Gemini status:",
                getErrorStatus(error)
            );

            if (
                !isRetryableError(error) ||
                attempt === MAX_RETRIES - 1
            ) {
                break;
            }

            const delay =
                BASE_DELAY *
                Math.pow(2, attempt);

            console.log(
                `⏳ Retrying Gemini in ${delay}ms...`
            );

            await sleep(delay);
        }
    }

    throw lastError;
};

// =====================================================
// SAFE TEXT EXTRACTION
// =====================================================

const extractGeminiText = (response) => {
    if (!response) {
        return "";
    }

    // Standard @google/genai response
    if (typeof response.text === "string") {
        return response.text.trim();
    }

    // Some SDK response shapes may expose candidates
    const candidates = response?.candidates;

    if (
        Array.isArray(candidates) &&
        candidates.length > 0
    ) {
        const parts =
            candidates[0]?.content?.parts;

        if (Array.isArray(parts)) {
            return parts
                .filter(
                    (part) =>
                        typeof part?.text ===
                        "string"
                )
                .map((part) => part.text)
                .join("\n")
                .trim();
        }
    }

    return "";
};

// =====================================================
// AI BUSINESS ADVISOR
// =====================================================

const chatWithAI = async (req, res) => {
    try {
        // =================================================
        // API KEY VALIDATION
        // =================================================

        if (!process.env.GEMINI_API_KEY) {
            console.error(
                "❌ GEMINI_API_KEY is not configured."
            );

            return res.status(500).json({
                success: false,
                message:
                    "AI Advisor configuration is incomplete.",
            });
        }

        // =================================================
        // REQUEST DATA
        // =================================================

        const {
            message,
            location,
            businessContext,
        } = req.body || {};

        // =================================================
        // MESSAGE VALIDATION
        // =================================================

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // =================================================
        // NORMALIZE LOCATION
        // =================================================

        const safeLocation =
            location &&
                typeof location === "object"
                ? location
                : {};

        // =================================================
        // NORMALIZE BUSINESS CONTEXT
        // =================================================

        const safeBusinessContext =
            businessContext &&
                typeof businessContext === "object"
                ? businessContext
                : {};

        // =================================================
        // LOCATION TEXT
        // =================================================

        const locationText = `
Village: ${safeLocation.village ||
            "Not available"
            }

Locality: ${safeLocation.locality ||
            "Not available"
            }

Area: ${safeLocation.area ||
            "Not available"
            }

District: ${safeLocation.district ||
            "Not available"
            }

State: ${safeLocation.state ||
            "Not available"
            }

Country: ${safeLocation.country ||
            "Not available"
            }

Pincode: ${safeLocation.pincode ||
            "Not available"
            }

Latitude: ${safeLocation.latitude ??
            "Not available"
            }

Longitude: ${safeLocation.longitude ??
            "Not available"
            }
`;

        // =================================================
        // BUSINESS TEXT
        // =================================================

        const businessText = `
Business Name: ${safeBusinessContext.businessName ||
            "Not specified"
            }

Business Category: ${safeBusinessContext.category ||
            "Not specified"
            }

Target Customers: ${safeBusinessContext.targetCustomers ||
            safeBusinessContext.customers ||
            "Not specified"
            }

Budget: ${safeBusinessContext.budget ||
            "Not specified"
            }

Skills: ${safeBusinessContext.skills ||
            "Not specified"
            }

Resources: ${safeBusinessContext.resources ||
            "Not specified"
            }
`;

        // =================================================
        // GET MARKET DATA FROM MONGODB
        // =================================================

        let marketData;

        try {
            marketData =
                await getMarketAnalysis({
                    location: safeLocation,
                    businessContext:
                        safeBusinessContext,
                    question:
                        message.trim(),
                });

            console.log(
                "📊 MARKET ANALYSIS RESULT:",
                {
                    success:
                        marketData?.success,
                    hasData:
                        marketData?.hasData,
                    totalRecords:
                        marketData?.totalRecords,
                    matchedRecords:
                        marketData?.matchedRecords,
                    exactLocationMatches:
                        marketData?.exactLocationMatches,
                    businesses:
                        marketData?.businesses
                            ?.length || 0,
                }
            );
        } catch (marketError) {
            console.error(
                "❌ Market analysis failed:",
                getErrorMessage(marketError)
            );

            marketData = {
                success: false,
                hasData: false,
                totalRecords: 0,
                matchedRecords: 0,
                exactLocationMatches: 0,
                categoryMatches: [],
                businesses: [],
                marketSummary: {},
                note:
                    "Market database analysis is currently unavailable.",
            };
        }

        // =================================================
        // MARKET DATA TEXT
        // =================================================

        let marketDataText = "";

        if (
            marketData?.hasData &&
            Array.isArray(
                marketData?.businesses
            ) &&
            marketData.businesses.length > 0
        ) {
            marketDataText =
                JSON.stringify(
                    {
                        totalRecords:
                            marketData.totalRecords ||
                            0,

                        matchedRecords:
                            marketData.matchedRecords ||
                            0,

                        exactLocationMatches:
                            marketData.exactLocationMatches ||
                            0,

                        categoryMatches:
                            marketData.categoryMatches ||
                            [],

                        marketSummary:
                            marketData.marketSummary ||
                            {},

                        businesses:
                            marketData.businesses ||
                            [],
                    },
                    null,
                    2
                );
        } else {
            marketDataText =
                "No matching market records were found in the database for the supplied location/context.";
        }

        // =================================================
        // USER PROMPT
        // =================================================

        const userPrompt = `
USER QUESTION:

${message.trim()}


USER LOCATION:

${locationText}


USER BUSINESS CONTEXT:

${businessText}


==================================================
DATABASE MARKET ANALYSIS
==================================================

The following information was retrieved from the
Vyapar Sathi MongoDB marketbusinesses collection.

Use this database information for location-specific
business reasoning.

MARKET DATABASE DATA:

${marketDataText}


==================================================
INSTRUCTIONS FOR THIS RESPONSE
==================================================

1. Answer the user's actual question directly.

2. Use the database information when it is available.

3. If exact locality data is available, prioritize it.

4. If exact locality data is not available but district,
   state or pincode data is available, use that data
   carefully.

5. Clearly distinguish database-supported information
   from general business reasoning when necessary.

6. Do not invent businesses.

7. Do not invent customer counts.

8. Do not invent market size.

9. Do not invent exact competition numbers.

10. Do not invent exact demand numbers.

11. Do not guarantee profit, revenue or business success.

12. Do not create a generic disclaimer about the lack
    of locality-level data unless it is genuinely necessary
    to answer the user's question.

13. Do NOT begin the response with:
    "Exact locality-level live market data available nahi hai"
    or any similar disclaimer.

14. Do NOT repeat the database disclaimer unnecessarily.

15. Give useful and practical recommendations based on
    the supplied location and available database evidence.

16. If the user asks for business ideas, rank the best
    options according to location suitability, demand,
    competition, investment suitability, risk and difficulty.

17. For each major recommendation, provide:

    Business Name
    Potential Level
    Why it may work
    Database Support
    Estimated Starting Investment
    Target Customers
    Demand / Opportunity
    Competition
    Profit Opportunity
    Main Risks
    Difficulty Level

18. Investment figures must be labelled as:
    "Approximate estimate"

19. Do not fabricate profit percentages, prices,
    subsidies or interest rates.

20. If government schemes are mentioned, do not invent
    eligibility, subsidy, loan amount or interest rate.

21. Reply in the same language/style as the user.

22. Keep the answer practical, specific and easy to understand.

==================================================
`;

        // =================================================
        // SYSTEM INSTRUCTION
        // =================================================

        const systemInstruction = `
You are the AI Business Advisor of "Vyapar Sathi".

Your main purpose is practical BUSINESS ADVICE.

You help rural and semi-urban entrepreneurs:

- Discover business opportunities
- Evaluate business ideas
- Start a business
- Improve an existing business
- Increase sales
- Improve marketing
- Decide pricing
- Understand customers
- Compare business options
- Estimate approximate investment
- Understand risks
- Create practical action plans


==================================================
DATABASE-FIRST RULE
==================================================

For location-specific questions, the supplied MongoDB
market database information is an important source.

Use it whenever relevant.

Do not ignore available database information.

Do not replace database-supported information with
completely generic assumptions.


==================================================
LOCATION-AWARE ANALYSIS
==================================================

Consider these fields when available:

- Village
- Locality
- Area
- District
- State
- Country
- Pincode
- Latitude
- Longitude

Priority:

1. Exact locality
2. Exact area
3. Exact village
4. Exact pincode
5. District
6. State


==================================================
DATABASE RULES
==================================================

1. Database information must influence ranking.

2. Prefer business opportunities supported by the
   available market information.

3. Existing businesses may be used to understand
   competition and market categories.

4. Do not invent businesses from the database.

5. Do not fabricate exact customer counts.

6. Do not fabricate exact competition counts.

7. Do not fabricate exact demand numbers.

8. Do not fabricate market size.

9. Do not guarantee business success.

10. Missing database information must remain missing.


==================================================
BUSINESS RANKING
==================================================

When recommending businesses, use:

🔥 HIGH POTENTIAL
🟢 GOOD OPPORTUNITY
🟡 MODERATE OPPORTUNITY

Only use HIGH POTENTIAL when the available evidence
reasonably supports it.


==================================================
BUSINESS ANALYSIS
==================================================

For important recommendations include:

### Business Name

### Potential Level

### Why it may work

Explain the location/business reasoning.

### Database Support

Mention only relevant database-supported information.

### Estimated Starting Investment

Always use:

"Approximate estimate"

### Target Customers

### Demand / Opportunity

Use database information when available.

### Competition

Use available database information carefully.

### Profit Opportunity

Only give approximate/general reasoning.

Never guarantee profit.

### Main Risks

### Difficulty Level


==================================================
FINANCIAL SAFETY
==================================================

Never guarantee:

- Profit
- Revenue
- ROI
- Customer count
- Market size

Never fabricate:

- Prices
- Demand numbers
- Competition numbers
- Profit percentages
- Government subsidy percentages
- Interest rates
- Loan amounts


==================================================
GOVERNMENT SCHEMES
==================================================

Never invent government schemes.

Never invent:

- Eligibility
- Subsidy
- Interest rate
- Funding amount

Current government details should be verified from
official government sources.


==================================================
FARMING
==================================================

Do not make farming advice the main purpose.

Agriculture may be discussed when it is relevant
to a business opportunity.


==================================================
DISCLAIMER RULE
==================================================

Do not unnecessarily generate a generic disclaimer.

Do NOT start answers with:

"Exact locality-level live market data available nahi hai"

Do not repeatedly mention lack of locality data.

Only explain limitations when they materially affect
the accuracy of the answer.


==================================================
LANGUAGE
==================================================

Reply in the SAME language/style as the user.

Hindi → Hindi

English → English

Hinglish → Simple Hinglish


==================================================
FINAL QUALITY RULE
==================================================

The answer should feel specific to the user's location.

Use:

DATABASE-SUPPORTED INFORMATION

and

GENERAL BUSINESS REASONING

appropriately.

Never invent facts merely to make the answer look
location-specific.
`;

        // =================================================
        // PRIMARY GEMINI
        // =================================================

        let response;

        try {
            response =
                await generateAIResponse(
                    PRIMARY_MODEL,
                    userPrompt,
                    systemInstruction
                );
        } catch (primaryError) {
            console.error(
                "⚠️ Primary Gemini model failed:",
                getErrorMessage(primaryError)
            );

            // =================================================
            // FALLBACK GEMINI
            // =================================================

            if (
                isRetryableError(
                    primaryError
                )
            ) {
                console.log(
                    `🔄 Trying fallback model: ${FALLBACK_MODEL}`
                );

                try {
                    response =
                        await generateAIResponse(
                            FALLBACK_MODEL,
                            userPrompt,
                            systemInstruction
                        );
                } catch (
                fallbackError
                ) {
                    console.error(
                        "❌ Fallback Gemini model also failed:",
                        getErrorMessage(
                            fallbackError
                        )
                    );

                    throw fallbackError;
                }
            } else {
                throw primaryError;
            }
        }

        // =================================================
        // EXTRACT RESPONSE
        // =================================================

        const reply =
            extractGeminiText(response);

        // =================================================
        // EMPTY RESPONSE
        // =================================================

        if (!reply) {
            console.error(
                "❌ Gemini returned an empty response."
            );

            console.error(
                "Gemini raw response:",
                JSON.stringify(
                    response,
                    null,
                    2
                )
            );

            return res.status(502).json({
                success: false,
                message:
                    "AI did not return a response.",
            });
        }

        // =================================================
        // SUCCESS
        // =================================================

        console.log(
            "✅ AI Advisor response generated successfully."
        );

        return res.status(200).json({
            success: true,

            reply,

            marketAnalysis: {
                hasData:
                    marketData?.hasData || false,

                totalRecords:
                    marketData?.totalRecords || 0,

                matchedRecords:
                    marketData?.matchedRecords || 0,

                exactLocationMatches:
                    marketData?.exactLocationMatches ||
                    0,

                categoryMatches:
                    marketData?.categoryMatches ||
                    [],
            },
        });
    } catch (error) {
        // =================================================
        // GLOBAL ERROR
        // =================================================

        console.error(
            "❌ AI Advisor Error:"
        );

        console.error(
            "Message:",
            getErrorMessage(error)
        );

        console.error(
            "Status:",
            getErrorStatus(error)
        );

        // =================================================
        // STATUS
        // =================================================

        const status =
            getErrorStatus(error);

        // =================================================
        // RATE LIMIT / TEMPORARY ERROR
        // =================================================

        if (
            status === 429 ||
            status === 503 ||
            status === 500 ||
            isRetryableError(error)
        ) {
            return res.status(503).json({
                success: false,
                message:
                    "AI service is temporarily busy. Please try again in a few seconds.",
            });
        }

        // =================================================
        // AUTH ERROR
        // =================================================

        if (
            status === 401 ||
            status === 403
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "AI API authentication failed. Please check GEMINI_API_KEY.",
            });
        }

        // =================================================
        // GENERAL ERROR
        // =================================================

        return res.status(500).json({
            success: false,
            message:
                "AI Advisor is temporarily unavailable.",

            error:
                process.env.NODE_ENV ===
                    "development"
                    ? getErrorMessage(error)
                    : undefined,
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

export {
    chatWithAI,
};
