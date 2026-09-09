import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
    try {
        console.log(
            "AUTH HEADER:",
            req.headers.authorization
        );

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login.",
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("TOKEN RECEIVED:", !!token);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED TOKEN:", decoded);

        req.user = decoded.id;

        next();
    } catch (error) {
        console.error(
            "AUTH ERROR:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

export default protect;