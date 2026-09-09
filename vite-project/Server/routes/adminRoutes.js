import express from "express";

import {
    getAdminDashboard,
    checkAdminAccess,
    getAllUsers,
    changeUserRole,
} from "../controller/adminController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// =====================================================
// ADMIN ACCESS CHECK
// =====================================================

router.get(
    "/check",
    protect,
    adminOnly,
    checkAdminAccess
);

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    protect,
    adminOnly,
    getAdminDashboard
);

// =====================================================
// GET ALL USERS
// =====================================================

router.get(
    "/users",
    protect,
    adminOnly,
    getAllUsers
);

// =====================================================
// CHANGE USER ROLE
// ONLY ADMIN
// =====================================================

router.put(
    "/users/role",
    protect,
    adminOnly,
    changeUserRole
);

export default router;