import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        fileName: {
            type: String,
            required: true,
            trim: true,
        },

        documentType: {
            type: String,
            required: true,
            trim: true,
        },

        applicationId: {
            type: String,
            default: "",
            trim: true,
        },

        applicationNumber: {
            type: String,
            default: "",
            trim: true,
        },

        filePath: {
            type: String,
            required: true,
        },

        url: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
            default: "",
        },

        fileSize: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },

        statusMessage: {
            type: String,
            default: "Document is waiting for verification.",
        },
    },
    {
        timestamps: true,
    }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;