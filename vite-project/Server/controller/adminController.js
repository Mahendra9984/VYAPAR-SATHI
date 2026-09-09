import User from "../model/User.js";
import Application from "../model/Application.js";

// =====================================================
// ADMIN DASHBOARD
// =====================================================

export const getAdminDashboard = async (req, res) => {
    try {
        // =====================================================
        // USER COUNTS
        // =====================================================

        const totalUsers = await User.countDocuments();

        const totalAdmins = await User.countDocuments({
            role: "admin",
        });

        const totalNormalUsers = await User.countDocuments({
            role: "user",
        });

        const totalEntrepreneurs = totalNormalUsers;

        // =====================================================
        // APPLICATION COUNTS
        // =====================================================

        const totalApplications =
            await Application.countDocuments();

        const pendingApplications =
            await Application.countDocuments({
                status: {
                    $in: [
                        "submitted",
                        "under_review",
                        "documents_required",
                    ],
                },
            });

        const approvedApplications =
            await Application.countDocuments({
                status: "approved",
            });

        const rejectedApplications =
            await Application.countDocuments({
                status: "rejected",
            });

        // =====================================================
        // DISBURSED LOANS
        // =====================================================

        const disbursedResult =
            await Application.aggregate([
                {
                    $match: {
                        status: "disbursed",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $ifNull: [
                                    "$loanAmount",
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]);

        const disbursedLoans =
            disbursedResult.length > 0
                ? disbursedResult[0].total
                : 0;

        // =====================================================
        // RECENT APPLICATIONS
        // =====================================================

        const recentApplications =
            await Application.find()
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean();

        const formattedRecentApplications =
            recentApplications.map(
                (application) => ({
                    _id: application._id,

                    name:
                        application.applicantName ||
                        application.user?.name ||
                        "Unknown",

                    applicantName:
                        application.applicantName ||
                        application.user?.name ||
                        "Unknown",

                    email:
                        application.applicantEmail ||
                        application.user?.email ||
                        "",

                    scheme:
                        application.schemeName ||
                        "Not Available",

                    schemeName:
                        application.schemeName ||
                        "Not Available",

                    district:
                        application.state ||
                        "Not Available",

                    state:
                        application.state ||
                        "Not Available",

                    amount:
                        application.loanAmount ?? 0,

                    status:
                        application.status ||
                        "submitted",

                    applicationNumber:
                        application.applicationNumber ||
                        "N/A",

                    createdAt:
                        application.createdAt,
                })
            );

        // =====================================================
        // APPLICATIONS BY SCHEME
        // =====================================================

        const applicationsByScheme =
            await Application.aggregate([
                {
                    $group: {
                        _id: "$schemeName",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]);

        const schemeSummary =
            applicationsByScheme.map(
                (scheme) => ({
                    name:
                        scheme._id ||
                        "Unknown",

                    count: scheme.count,
                })
            );

        // =====================================================
        // APPLICATIONS BY STATUS
        // =====================================================

        const applicationsByStatus =
            await Application.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]);

        const statusSummary =
            applicationsByStatus.map(
                (status) => ({
                    name: status._id,
                    count: status.count,
                })
            );

        // =====================================================
        // STATE / DISTRICT SUMMARY
        // =====================================================
        // Application model mein district field nahi hai.
        // Isliye state ko location summary ke liye use kar rahe hain.

        const districtSummary =
            await Application.aggregate([
                {
                    $match: {
                        state: {
                            $exists: true,
                            $ne: "",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$state",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
                {
                    $limit: 10,
                },
            ]);

        const formattedDistrictSummary =
            districtSummary.map(
                (district) => ({
                    name:
                        district._id ||
                        "Not Available",

                    count: district.count,
                })
            );

        // =====================================================
        // APPLICATION ACTIVITY - LAST 7 DAYS
        // =====================================================

        const sevenDaysAgo =
            new Date();

        sevenDaysAgo.setDate(
            sevenDaysAgo.getDate() - 6
        );

        sevenDaysAgo.setHours(
            0,
            0,
            0,
            0
        );

        const applicationActivityRaw =
            await Application.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: sevenDaysAgo,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%d %b",
                                date: "$createdAt",
                            },
                        },

                        value: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]);

        const applicationActivity =
            applicationActivityRaw.map(
                (item) => ({
                    label: item._id,
                    value: item.value,
                })
            );

        // =====================================================
        // NOTIFICATIONS
        // =====================================================
        // Notification model abhi available nahi hai.

        const notificationsCount = 0;

        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({
            success: true,

            message:
                "Admin dashboard loaded successfully.",

            stats: {
                totalUsers,
                totalAdmins,
                totalNormalUsers,
                totalEntrepreneurs,

                totalApplications,
                pendingApplications,
                approvedApplications,
                rejectedApplications,

                disbursedLoans,
            },

            totalUsers,
            totalAdmins,
            totalNormalUsers,
            totalEntrepreneurs,

            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,

            disbursedLoans,

            recentApplications:
                formattedRecentApplications,

            schemeSummary,

            applicationsByScheme,

            applicationsByStatus:
                statusSummary,

            districtSummary:
                formattedDistrictSummary,

            applicationActivity,

            // JSX ke chart ke liye
            applicationOverview:
                applicationActivity,

            notificationsCount,
        });
    } catch (error) {
        console.error(
            "Get Admin Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Unable to load admin dashboard.",

            error: error.message,
        });
    }
};

// =====================================================
// CHECK ADMIN ACCESS
// =====================================================

export const checkAdminAccess = async (
    req,
    res
) => {
    try {
        return res.status(200).json({
            success: true,

            isAdmin: true,

            message:
                "Admin access verified.",
        });
    } catch (error) {
        console.error(
            "Check Admin Access Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Unable to verify admin access.",
        });
    }
};

// =====================================================
// GET ALL USERS
// =====================================================

export const getAllUsers = async (
    req,
    res
) => {
    try {
        const users =
            await User.find()
                .select(
                    "-password -otp -otpExpire"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,

            users,
        });
    } catch (error) {
        console.error(
            "Get All Users Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Unable to load users.",

            error: error.message,
        });
    }
};

// =====================================================
// CHANGE USER ROLE
// =====================================================

export const changeUserRole = async (
    req,
    res
) => {
    try {
        const { userId, role } =
            req.body;

        // =====================================================
        // CHECK USER ID
        // =====================================================

        if (!userId) {
            return res.status(400).json({
                success: false,

                message:
                    "User ID is required.",
            });
        }

        // =====================================================
        // CHECK ROLE
        // =====================================================

        if (
            !["user", "admin"].includes(role)
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid role.",
            });
        }

        // =====================================================
        // ADMIN CANNOT CHANGE OWN ROLE
        // =====================================================

        if (
            String(req.user) ===
            String(userId)
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "You cannot change your own admin role.",
            });
        }

        // =====================================================
        // UPDATE ROLE
        // =====================================================

        const user =
            await User.findByIdAndUpdate(
                userId,
                {
                    role,
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).select(
                "-password -otp -otpExpire"
            );

        // =====================================================
        // USER NOT FOUND
        // =====================================================

        if (!user) {
            return res.status(404).json({
                success: false,

                message:
                    "User not found.",
            });
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({
            success: true,

            message:
                "User role updated successfully.",

            user,
        });
    } catch (error) {
        console.error(
            "Change User Role Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Unable to change user role.",

            error: error.message,
        });
    }
};