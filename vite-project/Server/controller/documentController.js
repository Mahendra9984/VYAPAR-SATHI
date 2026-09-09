import Document from "../model/Document.js";
import mongoose from "mongoose";
import fs from "fs";

// =====================================================
// BASE URL
// =====================================================

const getBaseUrl = (req) => {
    return `${req.protocol}://${req.get("host")}`;
};

// =====================================================
// GET MY DOCUMENTS
// =====================================================

export const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user;

        const documents = await Document.find({
            user: userId,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: documents.length,
            documents,
        });
    } catch (error) {
        console.error("Get Documents Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load documents.",
            error: error.message,
        });
    }
};

// =====================================================
// UPLOAD DOCUMENT
// =====================================================

export const uploadDocument = async (req, res) => {
    try {
        const userId = req.user;

        // =================================================
        // CHECK FILE
        // =================================================

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a document.",
            });
        }

        const {
            name,
            documentType,
            applicationId,
        } = req.body;

        // =================================================
        // DOCUMENT NAME
        // =================================================

        if (!name || !name.trim()) {
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                success: false,
                message: "Document name is required.",
            });
        }

        // =================================================
        // DOCUMENT TYPE
        // =================================================

        if (!documentType || !documentType.trim()) {
            if (
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                success: false,
                message: "Document type is required.",
            });
        }

        // =================================================
        // APPLICATION DETAILS
        // =================================================

        let applicationNumber = "";
        let linkedApplicationId = "";

        if (
            applicationId &&
            applicationId.trim()
        ) {
            const enteredApplication =
                applicationId.trim();

            /*
             * We are not importing Application.js here.
             *
             * The value entered by the user is stored as
             * applicationId. If it is a MongoDB ObjectId,
             * it is also stored as the linked application id.
             *
             * This avoids Application.js export/import errors.
             */

            if (
                mongoose.Types.ObjectId.isValid(
                    enteredApplication
                )
            ) {
                linkedApplicationId =
                    enteredApplication;
            } else {
                applicationNumber =
                    enteredApplication;
            }
        }

        // =================================================
        // FILE URL
        // =================================================

        const fileUrl =
            `${getBaseUrl(req)}/uploads/documents/${req.file.filename}`;

        // =================================================
        // CREATE DOCUMENT
        // =================================================

        const document =
            await Document.create({
                user: userId,

                name: name.trim(),

                fileName:
                    req.file.originalname,

                documentType:
                    documentType.trim(),

                applicationId:
                    linkedApplicationId,

                applicationNumber,

                filePath:
                    req.file.path,

                url:
                    fileUrl,

                mimeType:
                    req.file.mimetype,

                fileSize:
                    req.file.size,

                status:
                    "pending",

                statusMessage:
                    "Document is waiting for verification.",
            });

        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({
            success: true,

            message:
                "Document uploaded successfully.",

            document,
        });

    } catch (error) {
        console.error(
            "Upload Document Error:",
            error
        );

        // =================================================
        // DELETE FILE IF DATABASE SAVE FAILS
        // =================================================

        if (
            req.file?.path &&
            fs.existsSync(req.file.path)
        ) {
            try {
                fs.unlinkSync(
                    req.file.path
                );
            } catch (deleteError) {
                console.error(
                    "Temporary file delete error:",
                    deleteError.message
                );
            }
        }

        // =================================================
        // MULTER FILE SIZE ERROR
        // =================================================

        if (
            error.code ===
            "LIMIT_FILE_SIZE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "File size must be less than 10 MB.",
            });
        }

        // =================================================
        // GENERAL ERROR
        // =================================================

        return res.status(500).json({
            success: false,
            message:
                "Unable to upload document.",
            error:
                error.message,
        });
    }
};

// =====================================================
// DELETE DOCUMENT
// =====================================================

export const deleteDocument = async (
    req,
    res
) => {
    try {
        const userId = req.user;
        const documentId = req.params.id;

        // =================================================
        // FIND DOCUMENT
        // =================================================

        const document =
            await Document.findOne({
                _id: documentId,
                user: userId,
            });

        if (!document) {
            return res.status(404).json({
                success: false,
                message:
                    "Document not found.",
            });
        }

        // =================================================
        // DELETE PHYSICAL FILE
        // =================================================

        if (
            document.filePath &&
            fs.existsSync(
                document.filePath
            )
        ) {
            try {
                fs.unlinkSync(
                    document.filePath
                );
            } catch (fileError) {
                console.error(
                    "File delete error:",
                    fileError.message
                );
            }
        }

        // =================================================
        // DELETE DATABASE RECORD
        // =================================================

        await Document.findByIdAndDelete(
            documentId
        );

        return res.status(200).json({
            success: true,
            message:
                "Document deleted successfully.",
        });

    } catch (error) {
        console.error(
            "Delete Document Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete document.",
            error:
                error.message,
        });
    }
};

// =====================================================
// GET SINGLE DOCUMENT
// =====================================================

export const getDocumentById = async (
    req,
    res
) => {
    try {
        const userId = req.user;
        const documentId = req.params.id;

        // =================================================
        // CHECK VALID OBJECT ID
        // =================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                documentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid document ID.",
            });
        }

        // =================================================
        // FIND DOCUMENT
        // =================================================

        const document =
            await Document.findOne({
                _id: documentId,
                user: userId,
            });

        if (!document) {
            return res.status(404).json({
                success: false,
                message:
                    "Document not found.",
            });
        }

        return res.status(200).json({
            success: true,
            document,
        });

    } catch (error) {
        console.error(
            "Get Document Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load document.",
            error:
                error.message,
        });
    }
};