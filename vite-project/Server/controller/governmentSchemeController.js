import GovernmentScheme from "../model/GovernmentScheme.js";

// ================= GET ALL ACTIVE SCHEMES =================

export const getGovernmentSchemes = async (req, res) => {
    try {
        const schemes = await GovernmentScheme.find({
            active: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            schemes
        });
    } catch (error) {
        console.error("Get Government Schemes Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch government schemes"
        });
    }
};


// ================= GET SINGLE SCHEME =================

export const getGovernmentSchemeById = async (req, res) => {
    try {
        const { id } = req.params;

        const scheme = await GovernmentScheme.findOne({
            _id: id,
            active: true
        });

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: "Government scheme not found"
            });
        }

        res.status(200).json({
            success: true,
            scheme
        });
    } catch (error) {
        console.error("Get Government Scheme Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch government scheme"
        });
    }
};


// ================= GET DYNAMIC CATEGORIES =================

export const getSchemeCategories = async (req, res) => {
    try {
        const categories = await GovernmentScheme.distinct(
            "category",
            {
                active: true
            }
        );

        res.status(200).json({
            success: true,
            categories: categories
                .filter(Boolean)
                .sort()
        });
    } catch (error) {
        console.error("Get Scheme Categories Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch scheme categories"
        });
    }
};


// ================= GET DYNAMIC STATES =================

export const getSchemeStates = async (req, res) => {
    try {
        const states = await GovernmentScheme.distinct(
            "state",
            {
                active: true
            }
        );

        res.status(200).json({
            success: true,
            states: states
                .filter(Boolean)
                .sort()
        });
    } catch (error) {
        console.error("Get Scheme States Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch scheme states"
        });
    }
};


// ================= CREATE SCHEME =================

export const createGovernmentScheme = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            eligibility,
            benefits,
            documents,
            applicationProcess,
            officialWebsite,
            imageUrl,
            state,
            active
        } = req.body;

        if (!name || !description || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, description and category are required"
            });
        }

        const scheme = await GovernmentScheme.create({
            name: name.trim(),

            description: description.trim(),

            category: category.trim(),

            eligibility: Array.isArray(eligibility)
                ? eligibility.filter(Boolean)
                : [],

            benefits: Array.isArray(benefits)
                ? benefits.filter(Boolean)
                : [],

            documents: Array.isArray(documents)
                ? documents.filter(Boolean)
                : [],

            applicationProcess: Array.isArray(applicationProcess)
                ? applicationProcess.filter(Boolean)
                : [],

            officialWebsite:
                typeof officialWebsite === "string"
                    ? officialWebsite.trim()
                    : "",

            imageUrl:
                typeof imageUrl === "string"
                    ? imageUrl.trim()
                    : "",

            state:
                typeof state === "string" && state.trim()
                    ? state.trim()
                    : "All India",

            active:
                typeof active === "boolean"
                    ? active
                    : true
        });

        res.status(201).json({
            success: true,
            message: "Government scheme created successfully",
            scheme
        });
    } catch (error) {
        console.error("Create Government Scheme Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create government scheme"
        });
    }
};


// ================= UPDATE SCHEME =================

export const updateGovernmentScheme = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedScheme =
            await GovernmentScheme.findByIdAndUpdate(
                id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedScheme) {
            return res.status(404).json({
                success: false,
                message: "Government scheme not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Government scheme updated successfully",
            scheme: updatedScheme
        });
    } catch (error) {
        console.error("Update Government Scheme Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update government scheme"
        });
    }
};


// ================= DELETE SCHEME =================
// Soft delete

export const deleteGovernmentScheme = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedScheme =
            await GovernmentScheme.findByIdAndUpdate(
                id,
                {
                    active: false
                },
                {
                    new: true
                }
            );

        if (!deletedScheme) {
            return res.status(404).json({
                success: false,
                message: "Government scheme not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Government scheme removed successfully",
            scheme: deletedScheme
        });
    } catch (error) {
        console.error("Delete Government Scheme Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete government scheme"
        });
    }
};
// =========================================================
// MANDI / COMMODITY PRICE API
// =========================================================

export const getMandiPrices = async (req, res) => {
    try {
        const {
            state = "",
            district = "",
            market = "",
            commodity = "",
            limit = "50"
        } = req.query;

        const apiKey =
            process.env.DATA_GOV_API_KEY ||
            process.env.DATA_GOV_IN_API_KEY ||
            process.env.MANDI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "Data.gov.in API key is not configured in .env"
            });
        }

        const resourceId =
            "9ef84268-d588-465a-a308-a864a43d0070";

        const apiUrl =
            `https://api.data.gov.in/resource/${resourceId}`;

        const params = new URLSearchParams();

        params.append("api-key", apiKey);
        params.append("format", "json");

        const safeLimit = Math.min(
            Math.max(parseInt(limit, 10) || 50, 1),
            100
        );

        params.append("limit", safeLimit.toString());

        if (state.trim()) {
            params.append(
                "filters[state.keyword]",
                state.trim()
            );
        }

        if (district.trim()) {
            params.append(
                "filters[district]",
                district.trim()
            );
        }

        if (market.trim()) {
            params.append(
                "filters[market]",
                market.trim()
            );
        }

        if (commodity.trim()) {
            params.append(
                "filters[commodity]",
                commodity.trim()
            );
        }

        const response = await fetch(
            `${apiUrl}?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(
                "Data.gov.in API Error:",
                data
            );

            return res.status(response.status).json({
                success: false,
                message:
                    data?.error ||
                    data?.message ||
                    "Unable to fetch mandi prices"
            });
        }

        const records = Array.isArray(data.records)
            ? data.records
            : [];

        const prices = records.map((item) => ({
            state: item.state || "",
            district: item.district || "",
            market: item.market || "",
            commodity: item.commodity || "",
            variety: item.variety || "",
            grade: item.grade || "",
            arrivalDate: item.arrival_date || "",
            minPrice: Number(item.min_price) || 0,
            maxPrice: Number(item.max_price) || 0,
            modalPrice: Number(item.modal_price) || 0
        }));

        return res.status(200).json({
            success: true,
            count: prices.length,
            prices
        });

    } catch (error) {
        console.error(
            "Mandi Price Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch mandi prices",
            error: error.message
        });
    }
};