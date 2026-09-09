import express from "express";
import protect from "../middleware/protect.js";

import {
    createSupportRequest,
    getMySupportRequests,
} from "../controller/supportController.js";

const router = express.Router();

router.post(
    "/create",
    protect,
    createSupportRequest
);

router.get(
    "/my",
    protect,
    getMySupportRequests
);

export default router;