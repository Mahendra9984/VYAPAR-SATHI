const Application = require("../models/Application");
const User = require("../models/User");

// =====================================================
// GENERATE APPLICATION NUMBER
// =====================================================

const generateApplicationNumber = () => {
    const year = new Date().getFullYear();

    const random = Math.floor(
        100000 + Math.random() * 900000
    );

    return `VY-${year}-${random}`;
};

// =====================================================
// CREATE APPLICATION
// =====================================================

const createApplication = async (req, res) => {
    try {
        const userId = req.user;

        const {
            schemeId,
            schemeName,
            applicationType,
            category,
            applicantName,
            applicantEmail,
            mobile,
            age,
            state,
            occupation,
            annualIncome,
            loanAmount,
            purpose,
            businessName,
            businessType,
            description,
            documents,
        } = req.body;

        if (!schemeId || !schemeName) {
            return res.status(400).json({
                success: false,
                message: "Scheme information is required.",
            });
        }

        // Get logged-in user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Prevent accidental duplicate active applications
        const existingApplication =
            await Application.findOne({
                user: userId,
                schemeId,
                status: {
                    $in: [
                        "submitted",
                        "under_review",
                        "documents_required",
                    ],
                },
            });

        if (existingApplication) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have an active application for this scheme.",
                application: existingApplication,
            });
        }

        const applicationNumber =
            generateApplicationNumber();

        const application =
            await Application.create({
                user: userId,

                schemeId,

                schemeName,

                applicationType:
                    applicationType || "scheme",

                category:
                    category || "",

                applicantName:
                    applicantName ||
                    user.name,

                applicantEmail:
                    applicantEmail ||
                    user.email,

                mobile:
                    mobile || "",

                age:
                    age || null,

                state:
                    state || "",

                occupation:
                    occupation || "",

                annualIncome:
                    annualIncome || null,

                loanAmount:
                    loanAmount || null,

                purpose:
                    purpose || "",

                businessName:
                    businessName || "",

                businessType:
                    businessType || "",

                description:
                    description || "",

                documents:
                    documents || [],

                status: "submitted",

                statusMessage:
                    "Your application has been submitted and is waiting for review.",

                applicationNumber,

                timeline: [
                    {
                        title: "Application Submitted",
                        description:
                            "Your application has been successfully submitted.",
                        status: "completed",
                        date: new Date(),
                    },

                    {
                        title: "Application Under Review",
                        description:
                            "The application will be reviewed by the concerned authority.",
                        status: "current",
                        date: new Date(),
                    },

                    {
                        title: "Decision",
                        description:
                            "Application approval or rejection will be updated here.",
                        status: "pending",
                        date: new Date(),
                    },

                    {
                        title: "Disbursement / Benefit",
                        description:
                            "Benefit or loan amount will be processed after approval.",
                        status: "pending",
                        date: new Date(),
                    },
                ],
            });

        res.status(201).json({
            success: true,
            message:
                "Application submitted successfully.",
            application,
        });
    } catch (error) {
        console.error(
            "Create Application Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to create application.",
            error: error.message,
        });
    }
};

// =====================================================
// GET MY APPLICATIONS
// =====================================================

const getMyApplications = async (req, res) => {
    try {
        const userId = req.user;

        const applications =
            await Application.find({
                user: userId,
            }).sort({
                createdAt: -1,
            });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications,
        });
    } catch (error) {
        console.error(
            "Get Applications Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load your applications.",
            error: error.message,
        });
    }
};

// =====================================================
// GET SINGLE APPLICATION
// =====================================================

const getApplicationById = async (req, res) => {
    try {
        const userId = req.user;

        const application =
            await Application.findOne({
                _id: req.params.id,
                user: userId,
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message:
                    "Application not found.",
            });
        }

        res.status(200).json({
            success: true,
            application,
        });
    } catch (error) {
        console.error(
            "Get Application Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load application.",
            error: error.message,
        });
    }
};

// =====================================================
// UPDATE APPLICATION
// =====================================================

const updateApplication = async (req, res) => {
    try {
        const userId = req.user;

        const application =
            await Application.findOne({
                _id: req.params.id,
                user: userId,
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message:
                    "Application not found.",
            });
        }

        // Only allow editing while under initial processing
        if (
            ![
                "submitted",
                "documents_required",
            ].includes(application.status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This application can no longer be edited.",
            });
        }

        const allowedFields = [
            "mobile",
            "state",
            "occupation",
            "annualIncome",
            "loanAmount",
            "purpose",
            "businessName",
            "businessType",
            "description",
            "documents",
        ];

        allowedFields.forEach((field) => {
            if (
                req.body[field] !==
                undefined
            ) {
                application[field] =
                    req.body[field];
            }
        });

        await application.save();

        res.status(200).json({
            success: true,
            message:
                "Application updated successfully.",
            application,
        });
    } catch (error) {
        console.error(
            "Update Application Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update application.",
            error: error.message,
        });
    }
};

// =====================================================
// CANCEL APPLICATION
// =====================================================

const cancelApplication = async (req, res) => {
    try {
        const userId = req.user;

        const application =
            await Application.findOne({
                _id: req.params.id,
                user: userId,
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message:
                    "Application not found.",
            });
        }

        if (
            [
                "approved",
                "rejected",
                "disbursed",
            ].includes(application.status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This application cannot be cancelled.",
            });
        }

        application.status =
            "rejected";

        application.statusMessage =
            "Application cancelled by applicant.";

        application.timeline =
            application.timeline.map(
                (item) => {
                    if (
                        item.status ===
                        "current"
                    ) {
                        return {
                            ...item.toObject(),
                            status:
                                "completed",
                        };
                    }

                    return item;
                }
            );

        await application.save();

        res.status(200).json({
            success: true,
            message:
                "Application cancelled successfully.",
            application,
        });
    } catch (error) {
        console.error(
            "Cancel Application Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to cancel application.",
            error: error.message,
        });
    }
};

// =====================================================
// GET ENTREPRENEUR DASHBOARD DATA
// =====================================================

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user;

        // Get logged-in user
        const user =
            await User.findById(userId).select(
                "name email"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }

        // Get all applications of logged-in user
        const applications =
            await Application.find({
                user: userId,
            }).sort({
                createdAt: -1,
            });

        // =====================================================
        // TOTAL APPLICATIONS
        // =====================================================

        const totalApplications =
            applications.length;

        // =====================================================
        // APPLICATION STATUS COUNTS
        // =====================================================

        const approvedApplications =
            applications.filter(
                (app) =>
                    app.status ===
                    "approved"
            ).length;

        const underReviewApplications =
            applications.filter(
                (app) =>
                    app.status ===
                    "under_review"
            ).length;

        const pendingApplications =
            applications.filter(
                (app) =>
                    app.status ===
                    "submitted" ||
                    app.status ===
                    "documents_required"
            ).length;

        // =====================================================
        // ACTIVE APPLICATIONS
        // =====================================================

        const activeApplications =
            applications.filter(
                (app) =>
                    [
                        "submitted",
                        "under_review",
                        "documents_required",
                    ].includes(
                        app.status
                    )
            ).length;

        // =====================================================
        // SCHEMES APPLIED
        // =====================================================

        const uniqueSchemes =
            new Set(
                applications
                    .filter(
                        (app) =>
                            app.applicationType ===
                            "scheme"
                    )
                    .map(
                        (app) =>
                            app.schemeId
                    )
            );

        const schemesApplied =
            uniqueSchemes.size;

        // =====================================================
        // CURRENT MONTH
        // =====================================================

        const now = new Date();

        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const applicationsThisMonth =
            applications.filter(
                (app) =>
                    new Date(
                        app.createdAt
                    ) >=
                    startOfMonth
            ).length;

        // =====================================================
        // TOTAL PROJECTS
        // =====================================================

        const uniqueProjects =
            new Set(
                applications
                    .map(
                        (app) =>
                            app.businessName
                                ?.trim()
                    )
                    .filter(Boolean)
            );

        const totalProjects =
            uniqueProjects.size;

        const projectsThisMonth =
            new Set(
                applications
                    .filter(
                        (app) =>
                            app.businessName
                                ?.trim() &&
                            new Date(
                                app.createdAt
                            ) >=
                            startOfMonth
                    )
                    .map(
                        (app) =>
                            app.businessName
                                .trim()
                    )
            ).size;

        // =====================================================
        // FINANCIAL SNAPSHOT
        // =====================================================

        const totalFunding =
            applications.reduce(
                (total, app) =>
                    total +
                    (Number(
                        app.loanAmount
                    ) || 0),
                0
            );

        const approvedFunding =
            applications
                .filter(
                    (app) =>
                        app.status ===
                        "approved"
                )
                .reduce(
                    (total, app) =>
                        total +
                        (Number(
                            app.loanAmount
                        ) || 0),
                    0
                );

        const underReviewFunding =
            applications
                .filter(
                    (app) =>
                        app.status ===
                        "under_review"
                )
                .reduce(
                    (total, app) =>
                        total +
                        (Number(
                            app.loanAmount
                        ) || 0),
                    0
                );

        const pendingFunding =
            applications
                .filter(
                    (app) =>
                        app.status ===
                        "submitted" ||
                        app.status ===
                        "documents_required"
                )
                .reduce(
                    (total, app) =>
                        total +
                        (Number(
                            app.loanAmount
                        ) || 0),
                    0
                );

        // =====================================================
        // RECENT APPLICATIONS
        // =====================================================

        const recentApplications =
            applications
                .slice(0, 5)
                .map((app) => ({
                    id: app._id,
                    applicationNumber:
                        app.applicationNumber,
                    schemeId:
                        app.schemeId,
                    schemeName:
                        app.schemeName,
                    applicationType:
                        app.applicationType,
                    amount:
                        app.loanAmount || 0,
                    status:
                        app.status,
                    statusMessage:
                        app.statusMessage,
                    date:
                        app.createdAt,
                }));

        // =====================================================
        // DASHBOARD RESPONSE
        // =====================================================

        res.status(200).json({
            success: true,

            user: {
                name: user.name,
                email: user.email,
            },

            stats: {
                totalProjects,
                projectsThisMonth,

                activeApplications,
                underReviewApplications,

                schemesApplied,
                applicationsThisMonth,
            },

            applicationStatus: {
                total:
                    totalApplications,

                approved:
                    approvedApplications,

                underReview:
                    underReviewApplications,

                pending:
                    pendingApplications,
            },

            financialSnapshot: {
                totalFunding,
                approvedFunding,
                underReviewFunding,
                pendingFunding,
            },

            recentApplications,
        });
    } catch (error) {
        console.error(
            "Get Dashboard Data Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load dashboard data.",
            error: error.message,
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createApplication,
    getMyApplications,
    getApplicationById,
    updateApplication,
    cancelApplication,
    getDashboardData,
};