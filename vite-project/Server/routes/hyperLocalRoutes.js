import express from "express";

import {
    hyperLocalAdvisory,
} from "../controller/hyperLocalController.js";

const router = express.Router();

router.post("/", hyperLocalAdvisory);

export default router;