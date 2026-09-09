import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
    try {
        // =====================================================
        // GET AUTHORIZATION HEADER
        // =====================================================

        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER:", authHeader);

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login.",
            });
        }

        // =====================================================
        // GET TOKEN
        // =====================================================

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login.",
            });
        }

        console.log("TOKEN RECEIVED:", !!token);

        // =====================================================
        // VERIFY TOKEN
        // =====================================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED TOKEN:", decoded);

        // =====================================================
        // SET USER ID
        // =====================================================

        req.user = decoded.id;

        // =====================================================
        // CONTINUE
        // =====================================================

        next();

    } catch (error) {
        console.error(
            "Auth Middleware Error:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

export default protect;