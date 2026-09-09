import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: [
                "General",
                "Government Scheme",
                "Loan",
                "Application",
                "Documents",
                "AI Advisor",
                "Technical",
            ],
            default: "General",
        },

        subject: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["open", "in_progress", "resolved"],
            default: "open",
        },

        adminReply: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Support = mongoose.model("Support", supportSchema);

export default Support;