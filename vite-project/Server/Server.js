import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import governmentSchemeRoutes from "./routes/governmentSchemeRoutes.js";
import financialCalculatorRoutes from "./routes/financialCalculatorRoutes.js";
import eligibilityRoutes from "./routes/eligibilityRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// 👇 HYPER LOCAL ROUTE
import hyperLocalRoutes from "./routes/hyperLocalRoutes.js";

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// STATIC UPLOAD FILES
// =====================================================

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);

// =====================================================
// API ROUTES
// =====================================================

// USER
app.use("/api/users", userRoutes);

// AI
app.use("/api/ai", aiRoutes);

// GOVERNMENT SCHEMES
app.use(
    "/api/government-schemes",
    governmentSchemeRoutes
);

// FINANCIAL CALCULATOR
app.use(
    "/api/financial-calculator",
    financialCalculatorRoutes
);

// ELIGIBILITY
app.use("/api/eligibility", eligibilityRoutes);

// DOCUMENTS
app.use("/api/documents", documentRoutes);

// PROFILE
app.use("/api/profile", profileRoutes);

// SUPPORT
app.use("/api/support", supportRoutes);

// ADMIN
app.use("/api/admin", adminRoutes);

// 👇 HYPER LOCAL ADVISORY
app.use("/api/hyper-local", hyperLocalRoutes);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Vyapar Sathi Backend is running",
    });
});

// =====================================================
// 404 API HANDLER
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
    console.error("Server Error:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File size must be less than 10 MB.",
        });
    }

    if (
        error.message &&
        error.message.includes("Only PDF")
    ) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    return res.status(500).json({
        success: false,
        message:
            error.message || "Internal server error.",
    });
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});