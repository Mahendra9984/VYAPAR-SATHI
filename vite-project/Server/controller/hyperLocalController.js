import {
    getMarketBusinesses,
} from "../services/marketAnalysisService.js";

// =====================================================
// HELPERS
// =====================================================

const safeString = (value, fallback = "Not specified") => {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return fallback;
    }

    return String(value).trim();
};

// =====================================================
// GET HYPER LOCAL ADVISORY
// =====================================================

const hyperLocalAdvisory = async (req, res) => {
    try {
        // =================================================
        // REQUEST DATA
        // =================================================

        const {
            location = {},
            businessContext = {},
        } = req.body || {};

        // =================================================
        // VALIDATION
        // =================================================

        if (
            location === null ||
            typeof location !== "object"
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid location data is required.",
            });
        }

        if (
            businessContext === null ||
            typeof businessContext !== "object"
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid business context is required.",
            });
        }

        // =================================================
        // GET MARKET DATA FROM MONGODB
        // =================================================

        const marketData = await getMarketBusinesses(
            location,
            businessContext
        );

        // =================================================
        // NO DATA
        // =================================================

        if (
            !marketData ||
            !Array.isArray(marketData.businesses) ||
            marketData.businesses.length === 0
        ) {
            return res.status(200).json({
                success: true,

                dataLevel:
                    marketData?.dataLevel || "NO_DATA",

                totalRecords:
                    marketData?.totalRecords || 0,

                matchedRecords:
                    marketData?.matchedRecords || 0,

                exactLocationMatches:
                    marketData?.exactLocationMatches || 0,

                topCategories:
                    marketData?.topCategories || [],

                recommendations: [],

                actionPlan: [],

                message:
                    "No matching local market data found.",
            });
        }

        // =================================================
        // SORT BUSINESSES BY HYPER LOCAL RELEVANCE
        // =================================================

        const businesses = [...marketData.businesses]
            .sort(
                (a, b) =>
                    (b.relevanceScore || 0) -
                    (a.relevanceScore || 0)
            )
            .slice(0, 5);

        // =================================================
        // LOCATION INFORMATION
        // =================================================

        const locationName =
            safeString(
                location.locality,
                safeString(
                    location.area,
                    safeString(
                        location.village,
                        safeString(
                            location.district,
                            "your local area"
                        )
                    )
                )
            );

        // =================================================
        // BUSINESS CONTEXT
        // =================================================

        const requestedCategory =
            safeString(
                businessContext.category ||
                businessContext.businessCategory ||
                businessContext.businessType,
                ""
            );

        const budget =
            safeString(
                businessContext.budget,
                "Not specified"
            );

        // =================================================
        // CREATE RECOMMENDATIONS
        // =================================================

        const recommendations = businesses.map(
            (business, index) => {
                const score =
                    Number(
                        business.relevanceScore || 0
                    );

                // -----------------------------------------
                // POTENTIAL LEVEL
                // -----------------------------------------

                let potentialLevel =
                    "🟡 MODERATE OPPORTUNITY";

                if (score >= 100) {
                    potentialLevel =
                        "🔥 HIGH POTENTIAL";
                } else if (score >= 60) {
                    potentialLevel =
                        "🟢 GOOD OPPORTUNITY";
                }

                // -----------------------------------------
                // BUSINESS DETAILS
                // -----------------------------------------

                const businessName =
                    safeString(
                        business.businessName ||
                        business.name,
                        "Local Business"
                    );

                const category =
                    safeString(
                        business.category ||
                        business.businessCategory,
                        "General"
                    );

                const matchType =
                    safeString(
                        business.locationMatchType,
                        "broader"
                    );

                const targetCustomers =
                    safeString(
                        business.targetCustomers ||
                        business.customers,
                        "Local customers"
                    );

                const investment =
                    safeString(
                        business.investment ||
                        business.startingInvestment,
                        "Approximate estimate required"
                    );

                // -----------------------------------------
                // LOCATION DESCRIPTION
                // -----------------------------------------

                let locationDescription =
                    "available local market data";

                if (matchType === "pincode") {
                    locationDescription =
                        `the same pincode as ${locationName}`;
                } else if (
                    matchType === "locality"
                ) {
                    locationDescription =
                        `the same locality as ${locationName}`;
                } else if (
                    matchType === "area"
                ) {
                    locationDescription =
                        `the same area as ${locationName}`;
                } else if (
                    matchType === "village"
                ) {
                    locationDescription =
                        `the same village as ${locationName}`;
                } else if (
                    matchType === "district"
                ) {
                    locationDescription =
                        `the same district as ${locationName}`;
                } else if (
                    matchType === "state"
                ) {
                    locationDescription =
                        `the same state as ${locationName}`;
                }

                // -----------------------------------------
                // WHY IT MAY WORK
                // -----------------------------------------

                let whyItMayWork =
                    `${businessName} appears in ${locationDescription}.`;

                if (requestedCategory) {
                    whyItMayWork +=
                        ` It is related to the requested business category "${requestedCategory}".`;
                }

                // -----------------------------------------
                // DATABASE SUPPORT
                // -----------------------------------------

                const databaseSupport = {
                    source:
                        "Vyapar Sathi MongoDB marketbusinesses collection",

                    locationMatch:
                        matchType,

                    relevanceScore:
                        score,

                    businessName:
                        businessName,

                    category:
                        category,

                    district:
                        business.district || null,

                    state:
                        business.state || null,

                    pincode:
                        business.pincode || null,

                    village:
                        business.village || null,

                    locality:
                        business.locality || null,

                    area:
                        business.area || null,

                    address:
                        business.address || null,

                    activities:
                        Array.isArray(
                            business.activities
                        )
                            ? business.activities
                            : [],
                };

                // -----------------------------------------
                // DIFFICULTY
                // -----------------------------------------

                let difficultyLevel = "Medium";

                if (score >= 100) {
                    difficultyLevel = "Medium";
                } else if (score >= 60) {
                    difficultyLevel = "Medium";
                } else {
                    difficultyLevel = "Medium to High";
                }

                // -----------------------------------------
                // RETURN RECOMMENDATION
                // -----------------------------------------

                return {
                    rank: index + 1,

                    businessName,

                    category,

                    potentialLevel,

                    relevanceScore: score,

                    locationMatch: matchType,

                    whyItMayWork,

                    databaseSupport,

                    targetCustomers,

                    estimatedInvestment:
                        investment,

                    competition:
                        "Existing business records indicate that this business category is already present in the available market data.",

                    profitOpportunity:
                        "Profit depends on local demand, pricing, operating costs, competition and execution. No profit guarantee is made.",

                    mainRisks:
                        "Competition, operating costs, customer demand and business execution may affect results.",

                    difficultyLevel,
                };
            }
        );

        // =================================================
        // ACTION PLAN
        // =================================================

        const actionPlan = [
            `Step 1: Shortlist the best opportunity for ${locationName}.`,

            "Step 2: Compare the recommended business categories with your available budget and skills.",

            "Step 3: Check nearby competitors, customer demand and required resources before investing.",

            "Step 4: Start with a small-scale setup and test the market before making a large investment.",

            "Step 5: Increase products, services and marketing based on actual customer response.",
        ];

        // =================================================
        // MARKET SUMMARY
        // =================================================

        const marketSummary = {
            location: {
                village:
                    location.village || null,

                locality:
                    location.locality || null,

                area:
                    location.area || null,

                district:
                    location.district || null,

                state:
                    location.state || null,

                pincode:
                    location.pincode || null,
            },

            businessContext: {
                category:
                    businessContext.category ||
                    businessContext.businessCategory ||
                    businessContext.businessType ||
                    null,

                budget:
                    businessContext.budget ||
                    null,

                skills:
                    businessContext.skills ||
                    null,

                targetCustomers:
                    businessContext.targetCustomers ||
                    businessContext.customers ||
                    null,
            },

            dataLevel:
                marketData.dataLevel ||
                "BROADER",

            totalRecords:
                marketData.totalRecords || 0,

            matchedRecords:
                marketData.matchedRecords || 0,

            exactLocationMatches:
                marketData.exactLocationMatches || 0,

            categoryMatches:
                marketData.categoryMatches || 0,

            topCategories:
                marketData.topCategories || [],
        };

        // =================================================
        // FINAL RESPONSE
        // =================================================

        return res.status(200).json({
            success: true,

            message:
                "Hyper Local Advisory generated successfully.",

            dataLevel:
                marketData.dataLevel ||
                "BROADER",

            marketSummary,

            recommendations,

            actionPlan,
        });
    } catch (error) {
        // =================================================
        // ERROR
        // =================================================

        console.error(
            "❌ Hyper Local Advisory Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Hyper Local Advisory is temporarily unavailable.",

            error:
                process.env.NODE_ENV === "development"
                    ? error?.message
                    : undefined,
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

export {
    hyperLocalAdvisory,
};