import MarketBusiness from "../model/MarketBusiness.js";

// =====================================================
// TEXT NORMALIZATION
// =====================================================

const normalize = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
};

// =====================================================
// CSV VALUE PARSER
// Handles:
// "9,UTTAR PRADESH,170,MIRZAPUR,231304,..."
// and quoted values containing commas
// =====================================================

const parseCSVLine = (line) => {
    if (!line) return [];

    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }

            continue;
        }

        if (char === "," && !insideQuotes) {
            values.push(current.trim());
            current = "";
            continue;
        }

        current += char;
    }

    values.push(current.trim());

    return values;
};

// =====================================================
// CONVERT RAW MONGODB CSV DOCUMENT
// =====================================================

const parseRawMarketDocument = (document) => {
    if (!document) {
        return null;
    }

    // -------------------------------------------------
    // CASE 1: NORMAL MONGOOSE DOCUMENT
    // -------------------------------------------------

    if (
        document.district ||
        document.District ||
        document.pincode ||
        document.Pincode ||
        document.businessName ||
        document.EnterpriseName
    ) {
        return {
            ...document,

            state:
                document.state ||
                document.State ||
                "",

            stateCode:
                document.stateCode ||
                document.LG_ST_Code ||
                "",

            district:
                document.district ||
                document.District ||
                "",

            pincode:
                document.pincode ||
                document.Pincode ||
                "",

            village:
                document.village ||
                document.Village ||
                "",

            locality:
                document.locality ||
                document.Locality ||
                "",

            area:
                document.area ||
                document.Area ||
                "",

            businessName:
                document.businessName ||
                document.name ||
                document.EnterpriseName ||
                "",

            category:
                document.category ||
                document.businessCategory ||
                "",

            businessCategory:
                document.businessCategory ||
                document.category ||
                "",

            address:
                document.address ||
                document.CommunicationAddress ||
                "",

            activities:
                Array.isArray(document.activities)
                    ? document.activities
                    : document.Activities
                        ? [
                            {
                                description:
                                    document.Activities,
                            },
                        ]
                        : [],
        };
    }

    // -------------------------------------------------
    // CASE 2: CSV IMPORTED AS ONE FIELD
    // -------------------------------------------------

    const keys = Object.keys(document).filter(
        (key) => key !== "_id" && key !== "__v"
    );

    if (!keys.length) {
        return null;
    }

    // Find the field containing the complete CSV header
    const csvKey = keys.find((key) =>
        normalize(key).startsWith(
            "lg_st_code"
        )
    );

    if (!csvKey) {
        return null;
    }

    const rawValue = document[csvKey];

    if (
        typeof rawValue !== "string" ||
        !rawValue.trim()
    ) {
        return null;
    }

    const values = parseCSVLine(rawValue);

    // Expected structure:
    //
    // 0  LG_ST_Code
    // 1  State
    // 2  LG_DT_Code
    // 3  District
    // 4  Pincode
    // 5  RegistrationDate
    // 6  EnterpriseName
    // 7  CommunicationAddress
    // 8  Activities

    return {
        _id: document._id,

        state: values[1] || "",
        stateCode: values[0] || "",

        district: values[3] || "",

        pincode: values[4] || "",

        village: "",

        locality: "",

        area: "",

        businessName: values[6] || "",

        category: "",

        businessCategory: "",

        address: values[7] || "",

        activities:
            values[8]
                ? [
                    {
                        description: values[8],
                    },
                ]
                : [],

        registrationDate:
            values[5] || "",

        lgDistrictCode:
            values[2] || "",

        rawCSV: rawValue,
    };
};

// =====================================================
// GET ACTIVITIES TEXT
// =====================================================

const getActivitiesText = (business) => {
    if (
        !business ||
        !Array.isArray(business.activities)
    ) {
        return "";
    }

    return business.activities
        .map((activity) => {
            if (typeof activity === "string") {
                return activity;
            }

            return activity?.description || "";
        })
        .filter(Boolean)
        .join(" ");
};

// =====================================================
// GET BUSINESS CATEGORY
// =====================================================

const getBusinessCategory = (business) => {
    if (!business) {
        return "General";
    }

    if (business.category) {
        return String(business.category).trim();
    }

    if (business.businessCategory) {
        return String(
            business.businessCategory
        ).trim();
    }

    const activities = getActivitiesText(
        business
    );

    if (activities) {
        return activities.substring(0, 120);
    }

    return "General";
};

// =====================================================
// BUSINESS SEARCH TEXT
// =====================================================

const getBusinessSearchText = (business) => {
    return normalize(
        [
            business?.businessName,
            business?.name,
            business?.category,
            business?.businessCategory,
            business?.district,
            business?.state,
            business?.stateCode,
            business?.pincode,
            business?.address,
            business?.village,
            business?.locality,
            business?.area,
            getActivitiesText(business),
        ]
            .filter(Boolean)
            .join(" ")
    );
};

// =====================================================
// CATEGORY KEYWORDS
// =====================================================

const getCategoryKeywords = (
    businessContext = {}
) => {
    const requestedCategory = normalize(
        businessContext.category ||
        businessContext.businessCategory ||
        businessContext.businessType
    );

    if (!requestedCategory) {
        return [];
    }

    const mappings = {
        "kirana store": [
            "kirana",
            "grocery",
            "groceries",
            "general store",
            "provision store",
            "food retail",
            "retail sale",
            "retail trade",
            "non-specialized store",
            "food",
            "beverages",
        ],

        kirana: [
            "kirana",
            "grocery",
            "groceries",
            "general store",
            "provision store",
            "food retail",
            "retail sale",
            "retail trade",
            "non-specialized store",
            "food",
            "beverages",
        ],

        grocery: [
            "kirana",
            "grocery",
            "groceries",
            "general store",
            "provision store",
            "food retail",
            "retail sale",
            "retail trade",
            "non-specialized store",
            "food",
            "beverages",
        ],

        restaurant: [
            "restaurant",
            "food",
            "eating",
            "serving",
            "cafe",
            "dhaba",
            "hotel",
        ],

        cafe: [
            "cafe",
            "coffee",
            "tea",
            "restaurant",
            "food",
            "beverage",
        ],

        "tea stall": [
            "tea",
            "beverage",
            "refreshment",
            "tea stall",
            "food",
        ],

        tea: [
            "tea",
            "beverage",
            "refreshment",
            "tea stall",
            "food",
        ],

        clothing: [
            "clothing",
            "garment",
            "apparel",
            "readymade",
            "textile",
            "retail",
        ],

        garments: [
            "clothing",
            "garment",
            "apparel",
            "readymade",
            "textile",
            "retail",
        ],

        "mobile shop": [
            "mobile",
            "smartphone",
            "telecommunication",
            "telephone",
            "accessories",
            "retail",
        ],

        mobile: [
            "mobile",
            "smartphone",
            "telecommunication",
            "telephone",
            "accessories",
            "retail",
        ],

        pharmacy: [
            "pharmacy",
            "medical",
            "medicine",
            "drug",
            "chemist",
        ],

        dairy: [
            "dairy",
            "milk",
            "animal",
            "cattle",
        ],

        bakery: [
            "bakery",
            "bread",
            "cake",
            "confectionery",
            "food",
        ],

        "computer shop": [
            "computer",
            "information",
            "technology",
            "electronics",
            "retail",
        ],

        hardware: [
            "hardware",
            "building",
            "construction",
            "material",
            "retail",
        ],

        salon: [
            "hair",
            "beauty",
            "salon",
            "personal care",
        ],

        "auto repair": [
            "repair",
            "maintenance",
            "automotive",
            "motor",
            "vehicle",
            "garage",
        ],

        "fertilizer shop": [
            "fertilizer",
            "agricultural",
            "farm",
            "agro",
        ],

        fertilizer: [
            "fertilizer",
            "agricultural",
            "farm",
            "agro",
        ],

        "seed shop": [
            "seed",
            "agricultural",
            "farm",
            "agro",
        ],

        agriculture: [
            "agriculture",
            "agricultural",
            "farm",
            "farming",
            "agro",
        ],
    };

    if (mappings[requestedCategory]) {
        return mappings[requestedCategory];
    }

    return requestedCategory
        .split(" ")
        .filter((word) => word.length >= 3);
};

// =====================================================
// CATEGORY MATCH DETAILS
// =====================================================

const getCategoryMatchDetails = (
    business,
    businessContext = {}
) => {
    const keywords =
        getCategoryKeywords(
            businessContext
        );

    if (!keywords.length) {
        return {
            matched: false,
            score: 0,
            matchedKeyword: null,
        };
    }

    const businessName = normalize(
        business?.businessName ||
        business?.name
    );

    const category = normalize(
        business?.category ||
        business?.businessCategory
    );

    const activities = normalize(
        getActivitiesText(business)
    );

    const address = normalize(
        business?.address
    );

    const completeText = normalize(
        [
            businessName,
            category,
            activities,
            address,
        ]
            .filter(Boolean)
            .join(" ")
    );

    // -------------------------------------------------
    // EXACT CATEGORY
    // -------------------------------------------------

    for (const keyword of keywords) {
        const key = normalize(keyword);

        if (
            category &&
            category.includes(key)
        ) {
            return {
                matched: true,
                score: 50,
                matchedKeyword: key,
            };
        }
    }

    // -------------------------------------------------
    // BUSINESS NAME
    // -------------------------------------------------

    for (const keyword of keywords) {
        const key = normalize(keyword);

        if (
            businessName &&
            businessName.includes(key)
        ) {
            return {
                matched: true,
                score: 45,
                matchedKeyword: key,
            };
        }
    }

    // -------------------------------------------------
    // ACTIVITIES
    // -------------------------------------------------

    for (const keyword of keywords) {
        const key = normalize(keyword);

        if (
            key.length >= 3 &&
            activities.includes(key)
        ) {
            return {
                matched: true,
                score: 40,
                matchedKeyword: key,
            };
        }
    }

    // -------------------------------------------------
    // COMPLETE TEXT
    // -------------------------------------------------

    for (const keyword of keywords) {
        const key = normalize(keyword);

        if (
            key.length >= 3 &&
            completeText.includes(key)
        ) {
            return {
                matched: true,
                score: 30,
                matchedKeyword: key,
            };
        }
    }

    return {
        matched: false,
        score: 0,
        matchedKeyword: null,
    };
};

// =====================================================
// LOCATION SCORE
// =====================================================

const getLocationScore = (
    business,
    location = {}
) => {
    const village = normalize(
        location.village
    );

    const locality = normalize(
        location.locality
    );

    const area = normalize(
        location.area
    );

    const district = normalize(
        location.district
    );

    const state = normalize(
        location.state
    );

    const pincode = normalize(
        location.pincode
    );

    const businessVillage = normalize(
        business?.village
    );

    const businessLocality = normalize(
        business?.locality
    );

    const businessArea = normalize(
        business?.area
    );

    const businessDistrict = normalize(
        business?.district
    );

    const businessState = normalize(
        business?.state
    );

    const businessPincode = normalize(
        business?.pincode
    );

    const address = normalize(
        business?.address
    );

    let score = 0;
    let matchType = null;

    // -------------------------------------------------
    // PINCODE
    // -------------------------------------------------

    if (
        pincode &&
        businessPincode &&
        businessPincode === pincode
    ) {
        score += 100;
        matchType = "pincode";
    }

    // -------------------------------------------------
    // LOCALITY
    // -------------------------------------------------

    if (
        locality &&
        (
            businessLocality === locality ||
            businessArea === locality ||
            address.includes(locality)
        )
    ) {
        score += 80;

        if (!matchType) {
            matchType = "locality";
        }
    }

    // -------------------------------------------------
    // AREA
    // -------------------------------------------------

    if (
        area &&
        (
            businessArea === area ||
            address.includes(area)
        )
    ) {
        score += 70;

        if (!matchType) {
            matchType = "area";
        }
    }

    // -------------------------------------------------
    // VILLAGE
    // -------------------------------------------------

    if (
        village &&
        (
            businessVillage === village ||
            address.includes(village)
        )
    ) {
        score += 60;

        if (!matchType) {
            matchType = "village";
        }
    }

    // -------------------------------------------------
    // DISTRICT
    // -------------------------------------------------

    if (
        district &&
        businessDistrict === district
    ) {
        score += 40;

        if (!matchType) {
            matchType = "district";
        }
    }

    // -------------------------------------------------
    // STATE
    // -------------------------------------------------

    if (
        state &&
        businessState === state
    ) {
        score += 15;

        if (!matchType) {
            matchType = "state";
        }
    }

    // -------------------------------------------------
    // ADDRESS LOCATION FALLBACK
    // -------------------------------------------------

    if (!matchType) {
        const locationValues = [
            village,
            locality,
            area,
            district,
            state,
            pincode,
        ].filter(
            (value) =>
                value &&
                value.length >= 3
        );

        const businessText =
            getBusinessSearchText(
                business
            );

        for (const value of locationValues) {
            if (
                businessText.includes(value)
            ) {
                score += 10;
                matchType = "broader";
                break;
            }
        }
    }

    return {
        score,
        matchType,
    };
};

// =====================================================
// CALCULATE SCORE
// =====================================================

const calculateScore = (
    business,
    location = {},
    businessContext = {}
) => {
    const locationResult =
        getLocationScore(
            business,
            location
        );

    const categoryResult =
        getCategoryMatchDetails(
            business,
            businessContext
        );

    let score =
        locationResult.score +
        categoryResult.score;

    // Extra category + exact location bonuses
    if (
        categoryResult.matched &&
        locationResult.matchType ===
        "pincode"
    ) {
        score += 50;
    }

    if (
        categoryResult.matched &&
        locationResult.matchType ===
        "locality"
    ) {
        score += 35;
    }

    if (
        categoryResult.matched &&
        locationResult.matchType ===
        "area"
    ) {
        score += 30;
    }

    if (
        categoryResult.matched &&
        locationResult.matchType ===
        "village"
    ) {
        score += 25;
    }

    if (
        categoryResult.matched &&
        locationResult.matchType ===
        "district"
    ) {
        score += 20;
    }

    return score;
};

// =====================================================
// NORMALIZE LOCATION MATCH TYPE
// =====================================================

const getMatchType = (
    business,
    location = {}
) => {
    return getLocationScore(
        business,
        location
    ).matchType;
};

// =====================================================
// TOP CATEGORIES
// =====================================================

const buildTopCategories = (
    businesses
) => {
    const counter = {};

    businesses.forEach(
        (business) => {
            const category =
                normalize(
                    getBusinessCategory(
                        business
                    )
                );

            if (
                !category ||
                category === "general"
            ) {
                return;
            }

            // Don't allow very long activity descriptions
            const cleanCategory =
                category.length > 80
                    ? category.substring(
                        0,
                        80
                    )
                    : category;

            counter[cleanCategory] =
                (counter[
                    cleanCategory
                ] || 0) + 1;
        }
    );

    return Object.entries(counter)
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(0, 15)
        .map(
            ([category, count]) => ({
                category,
                count,
            })
        );
};

// =====================================================
// FETCH ALL MARKET DATA
// IMPORTANT:
// We DO NOT query pincode/district directly because
// your imported CSV is currently stored as one field.
// =====================================================

const fetchMarketData = async () => {
    const rawBusinesses =
        await MarketBusiness.find({})
            .lean()
            .limit(1000);

    const businesses =
        rawBusinesses
            .map(
                parseRawMarketDocument
            )
            .filter(Boolean);

    return {
        businesses,
        level: "BROADER",
    };
};

// =====================================================
// HYPER LOCAL MARKET ANALYSIS
// =====================================================

const getMarketBusinesses = async (
    location = {},
    businessContext = {}
) => {
    try {
        // -------------------------------------------------
        // FETCH RAW DATA
        // -------------------------------------------------

        const marketResult =
            await fetchMarketData();

        const businesses =
            Array.isArray(
                marketResult.businesses
            )
                ? marketResult.businesses
                : [];

        if (!businesses.length) {
            return {
                success: true,
                hasData: false,
                totalRecords: 0,
                matchedRecords: 0,
                exactLocationMatches: 0,
                exactLocationMatch: false,
                categoryMatches: 0,
                dataLevel: "NO_DATA",
                topCategories: [],
                businesses: [],
                note:
                    "No market data available.",
            };
        }

        // -------------------------------------------------
        // SCORE EVERY BUSINESS
        // -------------------------------------------------

        const scoredBusinesses =
            businesses
                .map((business) => {
                    const locationResult =
                        getLocationScore(
                            business,
                            location
                        );

                    const categoryResult =
                        getCategoryMatchDetails(
                            business,
                            businessContext
                        );

                    const score =
                        calculateScore(
                            business,
                            location,
                            businessContext
                        );

                    return {
                        ...business,

                        category:
                            getBusinessCategory(
                                business
                            ),

                        relevanceScore:
                            score,

                        locationMatchType:
                            locationResult.matchType ||
                            "broader",

                        categoryMatched:
                            categoryResult.matched,

                        matchedCategoryKeyword:
                            categoryResult.matchedKeyword,
                    };
                })
                .sort(
                    (a, b) =>
                        b.relevanceScore -
                        a.relevanceScore
                );

        // -------------------------------------------------
        // CATEGORY MATCHED
        // -------------------------------------------------

        const categoryBusinesses =
            scoredBusinesses.filter(
                (business) =>
                    business.categoryMatched
            );

        // -------------------------------------------------
        // EXACT LOCAL
        // -------------------------------------------------

        const exactLocalBusinesses =
            categoryBusinesses.filter(
                (business) =>
                    [
                        "pincode",
                        "locality",
                        "area",
                        "village",
                    ].includes(
                        business.locationMatchType
                    )
            );

        // -------------------------------------------------
        // DISTRICT + CATEGORY
        // -------------------------------------------------

        const districtBusinesses =
            categoryBusinesses.filter(
                (business) =>
                    business.locationMatchType ===
                    "district"
            );

        // -------------------------------------------------
        // STATE + CATEGORY
        // -------------------------------------------------

        const stateBusinesses =
            categoryBusinesses.filter(
                (business) =>
                    business.locationMatchType ===
                    "state"
            );

        // -------------------------------------------------
        // POSITIVE LOCATION MATCHES
        // -------------------------------------------------

        const relevantBusinesses =
            scoredBusinesses.filter(
                (business) =>
                    business.relevanceScore > 0
            );

        // -------------------------------------------------
        // SELECT FINAL BUSINESSES
        // -------------------------------------------------

        let selectedBusinesses = [];

        if (
            exactLocalBusinesses.length
        ) {
            selectedBusinesses =
                exactLocalBusinesses.slice(
                    0,
                    50
                );
        } else if (
            districtBusinesses.length
        ) {
            selectedBusinesses =
                districtBusinesses.slice(
                    0,
                    50
                );
        } else if (
            stateBusinesses.length
        ) {
            selectedBusinesses =
                stateBusinesses.slice(
                    0,
                    50
                );
        } else if (
            categoryBusinesses.length
        ) {
            selectedBusinesses =
                categoryBusinesses
                    .sort(
                        (a, b) =>
                            b.relevanceScore -
                            a.relevanceScore
                    )
                    .slice(0, 50);
        } else {
            // If category isn't found, use
            // location-relevant records.
            selectedBusinesses =
                relevantBusinesses.slice(
                    0,
                    50
                );
        }

        // -------------------------------------------------
        // EXACT LOCATION COUNT
        // -------------------------------------------------

        const exactLocationMatches =
            scoredBusinesses.filter(
                (business) =>
                    [
                        "pincode",
                        "locality",
                        "area",
                        "village",
                    ].includes(
                        business.locationMatchType
                    )
            ).length;

        // -------------------------------------------------
        // DATA LEVEL
        // -------------------------------------------------

        let dataLevel = "BROADER";

        if (
            exactLocalBusinesses.length
        ) {
            dataLevel = "EXACT_LOCAL";
        } else if (
            districtBusinesses.length
        ) {
            dataLevel = "DISTRICT";
        } else if (
            stateBusinesses.length
        ) {
            dataLevel = "STATE";
        } else if (
            categoryBusinesses.length
        ) {
            dataLevel = "BROADER";
        } else if (
            relevantBusinesses.length
        ) {
            dataLevel = "BROADER";
        } else {
            dataLevel = "NO_DATA";
        }

        // -------------------------------------------------
        // NOTE
        // -------------------------------------------------

        let note =
            "Broader market records are being used.";

        if (
            exactLocalBusinesses.length
        ) {
            note =
                "Exact local market records matching the requested category are available.";
        } else if (
            districtBusinesses.length
        ) {
            note =
                "District-level market records matching the requested category are being used.";
        } else if (
            stateBusinesses.length
        ) {
            note =
                "State-level market records matching the requested category are being used.";
        } else if (
            categoryBusinesses.length
        ) {
            note =
                "Market records matching the requested business category were found.";
        } else if (
            relevantBusinesses.length
        ) {
            note =
                "Location-related market records were found, but an exact category match was not available.";
        } else {
            note =
                "No relevant market records were found.";
        }

        // -------------------------------------------------
        // RETURN
        // -------------------------------------------------

        return {
            success: true,

            hasData:
                selectedBusinesses.length >
                0,

            totalRecords:
                businesses.length,

            matchedRecords:
                selectedBusinesses.length,

            exactLocationMatches,

            exactLocationMatch:
                exactLocalBusinesses.length >
                0,

            categoryMatches:
                categoryBusinesses.length,

            dataLevel,

            topCategories:
                buildTopCategories(
                    scoredBusinesses
                ),

            businesses:
                selectedBusinesses,

            note,
        };
    } catch (error) {
        console.error(
            "❌ getMarketBusinesses Error:",
            error
        );

        return {
            success: false,
            hasData: false,
            totalRecords: 0,
            matchedRecords: 0,
            exactLocationMatches: 0,
            exactLocationMatch: false,
            categoryMatches: 0,
            dataLevel: "NO_DATA",
            topCategories: [],
            businesses: [],
            note:
                "Market database analysis unavailable.",
        };
    }
};

// =====================================================
// COMPATIBILITY FUNCTION
// =====================================================

const getMarketAnalysis = async ({
    location = {},
    businessContext = {},
    question = "",
}) => {
    const marketData =
        await getMarketBusinesses(
            location,
            businessContext
        );

    return {
        ...marketData,
        question,
    };
};

// =====================================================
// BUILD MARKET CONTEXT
// =====================================================

const buildMarketContext = (
    marketData,
    location = {},
    businessContext = {}
) => {
    if (
        !marketData ||
        !Array.isArray(
            marketData.businesses
        ) ||
        !marketData.businesses.length
    ) {
        return `
==================================================
REAL MARKET DATABASE
==================================================

No matching business records were found.

Do NOT invent local businesses.

==================================================
`;
    }

    const businessLines =
        marketData.businesses
            .map(
                (business, index) => {
                    const activities =
                        getActivitiesText(
                            business
                        );

                    return `
${index + 1}. BUSINESS RECORD

Business Name:
${business.businessName || "Not available"}

Category:
${getBusinessCategory(business)}

Business Category:
${business.businessCategory || "Not available"}

District:
${business.district || "Not available"}

State:
${business.state || "Not available"}

Pincode:
${business.pincode || "Not available"}

Village:
${business.village || "Not available"}

Locality:
${business.locality || "Not available"}

Area:
${business.area || "Not available"}

Address:
${business.address || "Not available"}

Business Activity:
${activities || "Not available"}

Location Match Type:
${business.locationMatchType || "Not available"}

Category Match:
${business.categoryMatched ? "YES" : "NO"}

Matched Category Keyword:
${business.matchedCategoryKeyword || "Not available"}

Relevance Score:
${business.relevanceScore || 0}

Target Customers:
${business.targetCustomers || business.customers || "Not available"}

Estimated Investment:
${business.investment || business.startingInvestment || "Not available"}

`;
                }
            )
            .join("\n");

    const categoriesText =
        (
            marketData.topCategories ||
            []
        )
            .map(
                (item) =>
                    `${item.category}: ${item.count}`
            )
            .join("\n");

    return `
==================================================
REAL MARKET DATABASE CONTEXT
==================================================

USER LOCATION

Village:
${location.village || "Not available"}

Locality:
${location.locality || "Not available"}

Area:
${location.area || "Not available"}

District:
${location.district || "Not available"}

State:
${location.state || "Not available"}

Pincode:
${location.pincode || "Not available"}

USER BUSINESS CONTEXT

Business Name:
${businessContext.businessName || "Not specified"}

Business Category:
${businessContext.category ||
        businessContext.businessCategory ||
        businessContext.businessType ||
        "Not specified"
        }

Budget:
${businessContext.budget || "Not specified"}

Skills:
${businessContext.skills || "Not specified"}

Target Customers:
${businessContext.targetCustomers || "Not specified"}

==================================================
MARKET DATABASE STATUS
==================================================

Data Level:
${marketData.dataLevel || "NO_DATA"}

Total Records Retrieved:
${marketData.totalRecords || 0}

Selected/Matched Records:
${marketData.matchedRecords || 0}

Exact Locality Matches:
${marketData.exactLocationMatches || 0}

Category Matches:
${marketData.categoryMatches || 0}

Exact Local Match:
${marketData.exactLocationMatch
            ? "YES"
            : "NO"
        }

Database Note:
${marketData.note || "Not available"}

==================================================
TOP BUSINESS ACTIVITIES
==================================================

${categoriesText ||
        "No category summary available."
        }

==================================================
BUSINESSES FROM MONGODB
==================================================

${businessLines}

==================================================
IMPORTANT MARKET DATA RULES
==================================================

1. These records come from the Vyapar Sathi
   MongoDB marketbusinesses collection.

2. Use these records for location-specific reasoning.

3. Prefer exact pincode, locality, area or village
   matches.

4. Use district-level records when exact local
   records are unavailable.

5. Prefer businesses matching the requested
   business category.

6. Do not invent businesses.

7. Do not invent customer counts.

8. Do not invent exact demand numbers.

9. Do not invent exact competition numbers.

10. Do not claim database records prove profit,
    revenue or business success.

11. If the database does not contain a required
    value, clearly say that the value is not
    available in the database.

==================================================
`;
};

// =====================================================
// EXPORT
// =====================================================

export {
    getMarketBusinesses,
    getMarketAnalysis,
    buildMarketContext,
};