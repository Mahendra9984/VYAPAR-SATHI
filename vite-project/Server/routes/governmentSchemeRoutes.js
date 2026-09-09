import express from "express";

import {
    getGovernmentSchemes,
    getGovernmentSchemeById,
    getSchemeCategories,
    createGovernmentScheme,
    updateGovernmentScheme,
    deleteGovernmentScheme,
    getMandiPrices
} from "../controller/governmentSchemeController.js";

const router = express.Router();

router.get("/", getGovernmentSchemes);

router.get(
    "/categories",
    getSchemeCategories
);

// ================= MANDI / COMMODITY PRICES =================
router.get(
    "/mandi-prices",
    getMandiPrices
);

router.get(
    "/:id",
    getGovernmentSchemeById
);

router.post(
    "/",
    createGovernmentScheme
);

router.put(
    "/:id",
    updateGovernmentScheme
);

router.delete(
    "/:id",
    deleteGovernmentScheme
);

export default router;