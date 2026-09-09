import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Scheme / Loan information
        schemeId: {
            type: String,
            required: true,
        },

        schemeName: {
            type: String,
            required: true,
        },

        applicationType: {
            type: String,
            enum: ["scheme", "loan"],
            default: "scheme",
        },

        category: {
            type: String,
            default: "",
        },

        // Applicant details
        applicantName: {
            type: String,
            required: true,
        },

        applicantEmail: {
            type: String,
            required: true,
        },

        mobile: {
            type: String,
            default: "",
        },

        age: {
            type: Number,
            default: null,
        },

        state: {
            type: String,
            default: "",
        },

        occupation: {
            type: String,
            default: "",
        },

        annualIncome: {
            type: Number,
            default: null,
        },

        // Application specific information
        loanAmount: {
            type: Number,
            default: null,
        },

        purpose: {
            type: String,
            default: "",
        },

        businessName: {
            type: String,
            default: "",
        },

        businessType: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        // Documents
        documents: [
            {
                name: {
                    type: String,
                    required: true,
                },

                documentType: {
                    type: String,
                    default: "",
                },

                status: {
                    type: String,
                    enum: ["pending", "verified", "rejected"],
                    default: "pending",
                },

                url: {
                    type: String,
                    default: "",
                },
            },
        ],

        // Application status
        status: {
            type: String,
            enum: [
                "submitted",
                "under_review",
                "documents_required",
                "approved",
                "rejected",
                "disbursed",
            ],
            default: "submitted",
        },

        statusMessage: {
            type: String,
            default: "Application submitted successfully.",
        },

        // Tracking timeline
        timeline: [
            {
                title: {
                    type: String,
                    required: true,
                },

                description: {
                    type: String,
                    default: "",
                },

                status: {
                    type: String,
                    enum: ["completed", "current", "pending"],
                    default: "pending",
                },

                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Reference number
        applicationNumber: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const Application = mongoose.model(
    "Application",
    applicationSchema
);

export default Application;