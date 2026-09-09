import express from "express";

import {
    registerUser,
    loginUser,
    sendOtp,
    verifyOtp
} from "../controller/usercontroller.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/login", loginUser);

export default router;