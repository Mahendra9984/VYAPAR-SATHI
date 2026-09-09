import mongoose from "mongoose";

const marketBusinessSchema = new mongoose.Schema(
    {
        // ================= LOCATION =================

        state: {
            type: String,
            trim: true,
        },

        stateCode: {
            type: String,
            trim: true,
        },

        district: {
            type: String,
            trim: true,
            index: true,
        },

        pincode: {
            type: String,
            trim: true,
            index: true,
        },

        village: {
            type: String,
            trim: true,
            index: true,
        },

        locality: {
            type: String,
            trim: true,
        },

        area: {
            type: String,
            trim: true,
        },

        // ================= BUSINESS =================

        businessName: {
            type: String,
            trim: true,
            index: true,
        },

        category: {
            type: String,
            trim: true,
            index: true,
        },

        businessCategory: {
            type: String,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
        },

        // ================= BUSINESS DETAILS =================

        targetCustomers: {
            type: String,
            trim: true,
        },

        customers: {
            type: String,
            trim: true,
        },

        investment: {
            type: String,
            trim: true,
        },

        startingInvestment: {
            type: String,
            trim: true,
        },

        // ================= ACTIVITIES =================

        activities: [
            {
                nic5DigitId: {
                    type: String,
                    trim: true,
                },

                description: {
                    type: String,
                    trim: true,
                },
            },
        ],

        // ================= ANALYSIS =================

        relevanceScore: {
            type: Number,
            default: 0,
        },

        locationMatchType: {
            type: String,
            enum: [
                "exact",
                "village",
                "locality",
                "area",
                "pincode",
                "district",
                "state",
                "broader",
            ],
            default: "broader",
        },
    },
    {
        timestamps: true,
        collection: "marketbusinesses",
    }
);

export default mongoose.model(
    "MarketBusiness",
    marketBusinessSchema
);