import express from "express";

import {
    getProfile,
    updateProfile,
    changePassword,
} from "../controller/profileController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// GET PROFILE
// =====================================================

router.get(
    "/",
    protect,
    getProfile
);

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put(
    "/",
    protect,
    updateProfile
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
    "/change-password",
    protect,
    changePassword
);

export default router;
