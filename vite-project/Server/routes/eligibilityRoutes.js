import express from "express";

import { checkEligibility } from "../controller/eligibilityController.js";

const router = express.Router();

router.post("/check", checkEligibility);

export default router;