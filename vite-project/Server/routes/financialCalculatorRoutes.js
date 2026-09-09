// Server/routes/financialCalculatorRoutes.js

import express from "express";

import {
    calculateFinancialData
} from "../controller/financialCalculatorController.js";

const router = express.Router();

// Calculate financial data
router.post(
    "/calculate",
    calculateFinancialData
);

export default router;