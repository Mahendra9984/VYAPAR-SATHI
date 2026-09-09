import express from "express";

import {
    getMyDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentById,
} from "../controller/documentController.js";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET all documents
router.get(
    "/",
    protect,
    getMyDocuments
);

// Upload document
router.post(
    "/",
    protect,
    upload.single("document"),
    uploadDocument
);

// Get single document
router.get(
    "/:id",
    protect,
    getDocumentById
);

// Delete document
router.delete(
    "/:id",
    protect,
    deleteDocument
);

export default router;