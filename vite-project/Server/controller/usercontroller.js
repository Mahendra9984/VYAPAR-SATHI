import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// =====================================================
// REGISTER USER
// =====================================================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must be at least 2 characters",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const existingUser = await User.findOne({
            email: cleanEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered. Please login.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Every newly registered account is a normal user.
        // Admin will be assigned separately.

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            role: "user",
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// =====================================================
// SEND OTP
// =====================================================

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // =================================================
        // SEND EMAIL FIRST
        // =================================================

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cleanEmail,
            subject: "Vyapar Sathi Login OTP",
            text: `Your Vyapar Sathi login OTP is ${otp}. It is valid for 2 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        // =================================================
        // SAVE OTP ONLY AFTER EMAIL SUCCESS
        // =================================================

        user.otp = otp;

        user.otpExpire = new Date(
            Date.now() + 2 * 60 * 1000
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("Send OTP error FULL:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to send OTP",
        });
    }
};

// =====================================================
// VERIFY OTP
// =====================================================

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check OTP
        if (
            !user.otp ||
            user.otp !== otp.toString()
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Check expiry
        if (
            !user.otpExpire ||
            user.otpExpire < new Date()
        ) {
            return res.status(401).json({
                success: false,
                message: "OTP expired",
            });
        }

        // Clear OTP
        user.otp = null;
        user.otpExpire = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("Verify OTP error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// =====================================================
// LOGIN USER
// =====================================================

const loginUser = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        if (!email || !password || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, password, and OTP are required",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // =================================================
        // PASSWORD CHECK
        // =================================================

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // =================================================
        // OTP CHECK
        // =================================================

        if (
            !user.otp ||
            user.otp !== otp.toString()
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // =================================================
        // OTP EXPIRY CHECK
        // =================================================

        if (
            !user.otpExpire ||
            user.otpExpire < new Date()
        ) {
            return res.status(401).json({
                success: false,
                message: "OTP expired",
            });
        }

        // =================================================
        // CLEAR OTP
        // =================================================

        user.otp = null;
        user.otpExpire = null;

        await user.save();

        // =================================================
        // CREATE JWT
        // =================================================

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // =================================================
        // LOGIN RESPONSE
        // =================================================

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

export {
    registerUser,
    sendOtp,
    verifyOtp,
    loginUser,
};