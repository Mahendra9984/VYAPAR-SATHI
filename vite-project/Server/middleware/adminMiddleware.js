import User from "../model/User.js";
import jwt from "jsonwebtoken";

const adminOnly = async (req, res, next) => {
    try {
        // =====================================================
        // GET USER ID FROM req.user
        // =====================================================

        let userId = req.user;

        // Agar req.user object hai
        if (
            userId &&
            typeof userId === "object" &&
            userId.id
        ) {
            userId = userId.id;
        }

        // =====================================================
        // FALLBACK: GET ID DIRECTLY FROM JWT
        // =====================================================

        if (!userId) {
            const authHeader =
                req.headers.authorization;

            if (
                !authHeader ||
                !authHeader.startsWith("Bearer ")
            ) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not authorized. Please login.",
                });
            }

            const token =
                authHeader.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            userId = decoded.id;
        }

        // =====================================================
        // USER ID CHECK
        // =====================================================

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "Not authorized. Please login.",
            });
        }

        // =====================================================
        // FIND USER
        // =====================================================

        const user = await User.findById(
            userId
        ).select("role name email");

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "User not found.",
            });
        }

        // =====================================================
        // ADMIN CHECK
        // =====================================================

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "Admin access required.",
            });
        }

        // =====================================================
        // ADMIN VERIFIED
        // =====================================================

        req.admin = user;

        // req.user ko bhi ID ke form mein set kar do
        req.user = user._id;

        next();
    } catch (error) {
        console.error(
            "Admin Middleware Error:",
            error
        );

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired token.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Admin authorization failed.",
        });
    }
};

export default adminOnly;