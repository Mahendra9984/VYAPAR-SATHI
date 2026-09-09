import mongoose from "mongoose";

const governmentSchemeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        eligibility: {
            type: [String],
            default: []
        },

        benefits: {
            type: [String],
            default: []
        },

        documents: {
            type: [String],
            default: []
        },

        applicationProcess: {
            type: [String],
            default: []
        },

        officialWebsite: {
            type: String,
            default: ""
        },

        imageUrl: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: "All India"
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const GovernmentScheme = mongoose.model(
    "GovernmentScheme",
    governmentSchemeSchema
);

export default GovernmentScheme;