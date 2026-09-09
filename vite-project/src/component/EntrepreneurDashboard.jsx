import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EntrepreneurDashboard.css";

const EntrepreneurDashboard = () => {
    const navigate = useNavigate();

    const [activeMenu, setActiveMenu] = useState("Dashboard");
    const [showNotifications, setShowNotifications] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    const userName = user?.name || "Mahendra Kumar";

    const menuItems = [
        { name: "Dashboard", icon: "⌂", path: "/dashboard" },

        { name: "AI Advisor", icon: "✦", path: "/ai-advisor" },

        {
            name: "Financial Calculator",
            icon: "▣",
            path: "/financial-calculator",
        },

        {
            name: "Government Schemes",
            icon: "▤",
            path: "/government-schemes",
        },

        {
            name: "Eligibility Checker",
            icon: "✓",
            path: "/eligibility-checker",
        },

        {
            name: "Hyper-Local Advisory",
            icon: "⌖",
            path: "/hyper-local-advisory",
        },

        { name: "Applications", icon: "▥", path: "/applications" },

        { name: "Documents", icon: "▱", path: "/documents" },
    ];

    // ================= FETCH APPLICATIONS =================

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    "/api/applications/my-applications",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = response.data;

                if (Array.isArray(data)) {
                    setApplications(data);
                } else if (Array.isArray(data?.applications)) {
                    setApplications(data.applications);
                } else if (Array.isArray(data?.data)) {
                    setApplications(data.data);
                } else {
                    setApplications([]);
                }
            } catch (err) {
                console.error("Dashboard applications error:", err);

                setError(
                    err?.response?.data?.message ||
                    "Unable to load application data."
                );

                setApplications([]);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchApplications();
        } else {
            setLoading(false);
        }
    }, [token]);

    // ================= DYNAMIC STATS =================

    const stats = useMemo(() => {
        const totalApplications = applications.length;

        // Active applications
        const activeStatuses = [
            "submitted",
            "under_review",
            "documents_required",
        ];

        const activeApplications = applications.filter((application) =>
            activeStatuses.includes(application.status)
        ).length;

        const underReviewCount = applications.filter(
            (application) => application.status === "under_review"
        ).length;

        // Scheme applications
        const schemesApplied = applications.filter(
            (application) => application.applicationType === "scheme"
        ).length;

        // Unique projects based on businessName
        const projectNames = applications
            .map((application) => application.businessName?.trim())
            .filter(Boolean);

        const uniqueProjects = [...new Set(projectNames)];

        const totalProjects =
            uniqueProjects.length > 0
                ? uniqueProjects.length
                : totalApplications;

        // This month
        const now = new Date();

        const thisMonthApplications = applications.filter((application) => {
            const applicationDate = new Date(
                application.createdAt ||
                application.startDate ||
                application.date
            );

            if (Number.isNaN(applicationDate.getTime())) {
                return false;
            }

            return (
                applicationDate.getMonth() === now.getMonth() &&
                applicationDate.getFullYear() === now.getFullYear()
            );
        });

        const projectsThisMonth = thisMonthApplications.filter(
            (application) => application.businessName?.trim()
        ).length;

        const schemesThisMonth = thisMonthApplications.filter(
            (application) => application.applicationType === "scheme"
        ).length;

        // Profile completion
        const profileFields = [
            user?.name,
            user?.email,
            user?.mobile,
            user?.age,
            user?.state,
            user?.occupation,
            user?.annualIncome,
            user?.businessName,
            user?.businessType,
            user?.address,
        ];

        const filledFields = profileFields.filter(
            (field) =>
                field !== undefined &&
                field !== null &&
                String(field).trim() !== ""
        ).length;

        const profileCompletion =
            profileFields.length > 0
                ? Math.round((filledFields / profileFields.length) * 100)
                : 0;

        return [
            {
                title: "Total Projects",
                value: String(totalProjects).padStart(2, "0"),
                change:
                    projectsThisMonth > 0
                        ? `+${projectsThisMonth} this month`
                        : "No new projects",
                icon: "◈",
                type: "green",
            },

            {
                title: "Active Applications",
                value: String(activeApplications).padStart(2, "0"),
                change:
                    underReviewCount > 0
                        ? `${underReviewCount} under review`
                        : "No applications under review",
                icon: "◉",
                type: "blue",
            },

            {
                title: "Schemes Applied",
                value: String(schemesApplied).padStart(2, "0"),
                change:
                    schemesThisMonth > 0
                        ? `+${schemesThisMonth} this month`
                        : "No new schemes this month",
                icon: "▤",
                type: "purple",
            },

            {
                title: "Profile Completion",
                value: `${profileCompletion}%`,
                change:
                    profileCompletion >= 90
                        ? "Almost complete"
                        : profileCompletion >= 70
                            ? "Good progress"
                            : "Complete your profile",
                icon: "◔",
                type: "orange",
            },
        ];
    }, [applications, user]);

    // ================= APPLICATION STATUS =================

    const applicationStats = useMemo(() => {
        const approved = applications.filter(
            (application) => application.status === "approved"
        ).length;

        const underReview = applications.filter(
            (application) => application.status === "under_review"
        ).length;

        const pending = applications.filter(
            (application) =>
                application.status === "submitted" ||
                application.status === "documents_required"
        ).length;

        const total = applications.length;

        return {
            total,
            approved,
            underReview,
            pending,
        };
    }, [applications]);

    // ================= FINANCIAL SNAPSHOT =================

    const financialStats = useMemo(() => {
        const getAmount = (application) => {
            const amount =
                application.loanAmount ??
                application.amount ??
                0;

            const numberAmount = Number(amount);

            return Number.isNaN(numberAmount) ? 0 : numberAmount;
        };

        const totalFunding = applications.reduce(
            (total, application) => total + getAmount(application),
            0
        );

        const approved = applications
            .filter(
                (application) => application.status === "approved"
            )
            .reduce(
                (total, application) =>
                    total + getAmount(application),
                0
            );

        const underReview = applications
            .filter(
                (application) => application.status === "under_review"
            )
            .reduce(
                (total, application) =>
                    total + getAmount(application),
                0
            );

        const pending = applications
            .filter(
                (application) =>
                    application.status === "submitted" ||
                    application.status === "documents_required"
            )
            .reduce(
                (total, application) =>
                    total + getAmount(application),
                0
            );

        return {
            totalFunding,
            approved,
            underReview,
            pending,
        };
    }, [applications]);

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    // ================= RECOMMENDED =================

    const recommended = [
        {
            icon: "🌾",
            title: "Dairy Farming",
            description: "Suitable schemes for dairy businesses",
            tag: "High Match",
        },

        {
            icon: "🏭",
            title: "PMEGP Scheme",
            description: "Finance support for new enterprises",
            tag: "92% Match",
        },

        {
            icon: "🌱",
            title: "Mudra Loan",
            description: "Collateral-free business loan",
            tag: "88% Match",
        },
    ];

    // ================= NOTIFICATIONS =================

    const notifications = useMemo(() => {
        const list = [];

        applications
            .filter(
                (application) => application.status === "under_review"
            )
            .slice(0, 2)
            .forEach((application) => {
                list.push(
                    `${application.schemeName || "Your application"
                    } is under review.`
                );
            });

        applications
            .filter(
                (application) => application.status === "approved"
            )
            .slice(0, 1)
            .forEach((application) => {
                list.push(
                    `${application.schemeName || "Your application"
                    } has been approved.`
                );
            });

        if (list.length === 0) {
            list.push("No new application notifications.");
        }

        return list;
    }, [applications]);

    // ================= NAVIGATION =================

    const handleNavigation = (item) => {
        setActiveMenu(item.name);

        if (item.path) {
            navigate(item.path);
        }
    };

    // ================= LOGOUT =================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ================= DATE FORMAT =================

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="dashboard-wrapper">

            {/* ================= SIDEBAR ================= */}

            <aside className="dashboard-sidebar">

                <div className="brand-area">
                    <div className="brand-logo">🌿</div>

                    <div>
                        <h2>Vyapar Sathi</h2>
                        <span>Vyapar Sathi</span>
                    </div>
                </div>

                <div className="sidebar-profile">

                    <div className="profile-avatar">
                        {userName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <strong>{userName}</strong>
                        <span>Entrepreneur</span>
                    </div>

                </div>

                <nav className="sidebar-navigation">

                    <p className="nav-label">
                        MAIN MENU
                    </p>

                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            className={`sidebar-item ${activeMenu === item.name
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() =>
                                handleNavigation(item)
                            }
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span>{item.name}</span>
                        </button>
                    ))}

                    <p className="nav-label secondary-label">
                        ACCOUNT
                    </p>

                    <button
                        className="sidebar-item"
                        onClick={() => navigate("/profile")}
                    >
                        <span className="sidebar-icon">
                            ♙
                        </span>

                        <span>
                            Profile & Settings
                        </span>
                    </button>

                </nav>

                {/* ================= SIDEBAR BOTTOM ================= */}

                <div className="sidebar-bottom">

                    {/* NEED HELP → /help */}

                    <button
                        type="button"
                        className="help-card"
                        onClick={() => navigate("/help")}
                    >
                        <div className="help-icon">
                            ✦
                        </div>

                        <div>
                            <strong>Need help?</strong>
                            <p>Get help & support</p>
                        </div>
                    </button>

                    {/* LOGOUT */}

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                    <div className="sidebar-version">
                        RuralBiz AI <span>v1.0</span>
                    </div>

                </div>

            </aside>

            {/* ================= MAIN ================= */}

            <main className="dashboard-main">

                {/* ================= HEADER ================= */}

                <header className="dashboard-header">

                    <div className="header-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search schemes, applications, resources..."
                        />

                        <kbd>⌘ K</kbd>

                    </div>

                    <div className="header-actions">

                        <button
                            className="header-icon-button"
                            onClick={() =>
                                setShowNotifications(
                                    !showNotifications
                                )
                            }
                        >
                            🔔
                            <span className="notification-dot"></span>
                        </button>

                        {showNotifications && (
                            <div className="notification-dropdown">

                                <div className="notification-header">

                                    <strong>
                                        Notifications
                                    </strong>

                                    <span>
                                        {notifications.length} New
                                    </span>

                                </div>

                                {notifications.map(
                                    (
                                        notification,
                                        index
                                    ) => (
                                        <div
                                            className="notification-item"
                                            key={index}
                                        >
                                            <div className="notification-small-icon">
                                                ✓
                                            </div>

                                            <p>
                                                {notification}
                                            </p>
                                        </div>
                                    )
                                )}

                            </div>
                        )}

                        <div className="header-divider"></div>

                        <button
                            className="header-profile"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >

                            <div className="header-avatar">
                                {userName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="header-user">

                                <strong>
                                    {userName}
                                </strong>

                                <span>
                                    Entrepreneur
                                </span>

                            </div>

                            <span className="profile-arrow">
                                ⌄
                            </span>

                        </button>

                    </div>

                </header>

                {/* ================= CONTENT ================= */}

                <section className="dashboard-content">

                    {/* ================= WELCOME ================= */}

                    <div className="welcome-section">

                        <div>

                            <p className="welcome-label">
                                ENTREPRENEUR DASHBOARD
                            </p>

                            <h1>
                                Good Morning,{" "}
                                {userName.split(" ")[0]} 👋
                            </h1>

                            <p>
                                Here's what's happening with
                                your business today.
                            </p>

                        </div>

                        <div className="welcome-actions">

                            <button
                                className="secondary-action"
                                onClick={() =>
                                    navigate("/ai-advisor")
                                }
                            >
                                <span>✦</span>
                                Ask AI Advisor
                            </button>

                            <button
                                className="primary-action"
                                onClick={() =>
                                    navigate(
                                        "/government-schemes"
                                    )
                                }
                            >
                                <span>+</span>
                                Explore Schemes
                            </button>

                        </div>

                    </div>

                    {/* ================= DYNAMIC STAT CARDS ================= */}

                    <div className="stats-grid">

                        {stats.map((stat) => (
                            <div
                                className="stat-card"
                                key={stat.title}
                            >

                                <div className="stat-top">

                                    <div
                                        className={`stat-icon ${stat.type}`}
                                    >
                                        {stat.icon}
                                    </div>

                                    <span className="stat-menu">
                                        •••
                                    </span>

                                </div>

                                <div className="stat-title">
                                    {stat.title}
                                </div>

                                <div className="stat-bottom">

                                    <strong>
                                        {loading
                                            ? "..."
                                            : stat.value}
                                    </strong>

                                    <span
                                        className={`stat-change ${stat.type}`}
                                    >
                                        {loading
                                            ? "Loading..."
                                            : stat.change}
                                    </span>

                                </div>

                            </div>
                        ))}

                    </div>

                    {/* ================= ERROR ================= */}

                    {error && (
                        <div
                            style={{
                                padding: "12px 16px",
                                marginBottom: "15px",
                                borderRadius: "8px",
                                background: "#fff3f3",
                                color: "#c62828",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* ================= GRID ================= */}

                    <div className="dashboard-grid">

                        {/* ================= APPLICATION STATUS ================= */}

                        <section
                            className="dashboard-card application-card"
                            onClick={() =>
                                navigate("/applications")
                            }
                            style={{
                                cursor: "pointer",
                            }}
                        >

                            <div className="card-header">

                                <div>

                                    <h2>
                                        Application Status
                                    </h2>

                                    <p>
                                        Track your current
                                        applications
                                    </p>

                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                            "/applications"
                                        );
                                    }}
                                >
                                    View All →
                                </button>

                            </div>

                            <div className="application-content">

                                <div className="donut-chart">

                                    <div className="donut-inner">

                                        <strong>
                                            {loading
                                                ? "..."
                                                : applicationStats.total}
                                        </strong>

                                        <span>
                                            Total
                                        </span>

                                    </div>

                                </div>

                                <div className="application-legend">

                                    <div>

                                        <span className="legend-dot approved"></span>

                                        <p>
                                            Approved
                                        </p>

                                        <strong>
                                            {loading
                                                ? "..."
                                                : applicationStats.approved}
                                        </strong>

                                    </div>

                                    <div>

                                        <span className="legend-dot review"></span>

                                        <p>
                                            Under Review
                                        </p>

                                        <strong>
                                            {loading
                                                ? "..."
                                                : applicationStats.underReview}
                                        </strong>

                                    </div>

                                    <div>

                                        <span className="legend-dot pending"></span>

                                        <p>
                                            Pending
                                        </p>

                                        <strong>
                                            {loading
                                                ? "..."
                                                : applicationStats.pending}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* ================= RECOMMENDED ================= */}

                        <section className="dashboard-card recommended-card">

                            <div className="card-header">

                                <div>

                                    <h2>
                                        Recommended for You
                                    </h2>

                                    <p>
                                        Based on your business profile
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/government-schemes"
                                        )
                                    }
                                >
                                    View All →
                                </button>

                            </div>

                            <div className="recommendation-list">

                                {recommended.map(
                                    (item) => (
                                        <div
                                            className="recommendation-item"
                                            key={item.title}
                                        >

                                            <div className="recommendation-icon">
                                                {item.icon}
                                            </div>

                                            <div className="recommendation-info">

                                                <strong>
                                                    {item.title}
                                                </strong>

                                                <span>
                                                    {item.description}
                                                </span>

                                            </div>

                                            <div className="recommendation-match">

                                                <span>
                                                    {item.tag}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            "/government-schemes"
                                                        )
                                                    }
                                                >
                                                    →
                                                </button>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        </section>

                    </div>

                    {/* ================= BOTTOM GRID ================= */}

                    <div className="dashboard-grid bottom-grid">

                        {/* ================= RECENT APPLICATIONS ================= */}

                        <section className="dashboard-card table-card">

                            <div className="card-header">

                                <div>

                                    <h2>
                                        Recent Applications
                                    </h2>

                                    <p>
                                        Your latest loan and
                                        scheme applications
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/applications"
                                        )
                                    }
                                >
                                    View All →
                                </button>

                            </div>

                            <div className="application-table">

                                <div className="table-head">

                                    <span>SCHEME</span>
                                    <span>APPLICATION ID</span>
                                    <span>AMOUNT</span>
                                    <span>STATUS</span>
                                    <span></span>

                                </div>

                                {loading ? (
                                    <div className="table-row">
                                        <span>
                                            Loading applications...
                                        </span>
                                    </div>
                                ) : applications.length === 0 ? (
                                    <div className="table-row">
                                        <span>
                                            No applications found.
                                        </span>
                                    </div>
                                ) : (
                                    applications
                                        .slice(0, 3)
                                        .map(
                                            (
                                                application
                                            ) => {

                                                const statusText =
                                                    application.status ===
                                                        "under_review"
                                                        ? "Under Review"
                                                        : application.status ===
                                                            "documents_required"
                                                            ? "Documents Required"
                                                            : application.status
                                                                ? application.status
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase() +
                                                                application.status.slice(
                                                                    1
                                                                )
                                                                : "Pending";

                                                return (
                                                    <div
                                                        className="table-row"
                                                        key={
                                                            application._id ||
                                                            application.applicationNumber
                                                        }
                                                    >

                                                        <div className="scheme-name">

                                                            <div className="scheme-mini-icon">
                                                                ▤
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        application.schemeName ||
                                                                        "Government Scheme"
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {formatDate(
                                                                        application.createdAt
                                                                    )}
                                                                </span>

                                                            </div>

                                                        </div>

                                                        <span className="application-id">

                                                            {
                                                                application.applicationNumber ||
                                                                application._id?.slice(
                                                                    -8
                                                                ) ||
                                                                "-"
                                                            }

                                                        </span>

                                                        <strong>

                                                            {formatCurrency(
                                                                application.loanAmount
                                                            )}

                                                        </strong>

                                                        <span
                                                            className={`status-badge ${statusText
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )}`}
                                                        >
                                                            {statusText}
                                                        </span>

                                                        <button
                                                            className="row-arrow"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/applications/${application._id}`
                                                                )
                                                            }
                                                        >
                                                            →
                                                        </button>

                                                    </div>
                                                );
                                            }
                                        )
                                )}

                            </div>

                        </section>

                        {/* ================= FINANCIAL SNAPSHOT ================= */}

                        <section className="dashboard-card loan-card">

                            <div className="card-header">

                                <div>

                                    <h2>
                                        Financial Snapshot
                                    </h2>

                                    <p>
                                        Your business funding overview
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/financial-calculator"
                                        )
                                    }
                                >
                                    Details →
                                </button>

                            </div>

                            <div className="loan-summary">

                                <div className="loan-main">

                                    <span>
                                        Total Funding
                                    </span>

                                    <strong>
                                        {loading
                                            ? "..."
                                            : formatCurrency(
                                                financialStats.totalFunding
                                            )}
                                    </strong>

                                    <small>
                                        Across all applications
                                    </small>

                                </div>

                                <div className="loan-details">

                                    <div>

                                        <span>
                                            Approved
                                        </span>

                                        <strong>
                                            {loading
                                                ? "..."
                                                : formatCurrency(
                                                    financialStats.approved
                                                )}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Under Review
                                        </span>

                                        <strong>
                                            {loading
                                                ? "..."
                                                : formatCurrency(
                                                    financialStats.underReview
                                                )}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Pending
                                        </span>

                                        <strong>
                                            {loading
                                                ? "..."
                                                : formatCurrency(
                                                    financialStats.pending
                                                )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                            <button
                                className="calculator-button"
                                onClick={() =>
                                    navigate(
                                        "/financial-calculator"
                                    )
                                }
                            >
                                Open Financial Calculator
                                <span>→</span>
                            </button>

                        </section>

                    </div>

                    {/* ================= QUICK ACTIONS ================= */}

                    <section className="quick-section">

                        <div className="quick-heading">

                            <div>

                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Everything you need, right at your fingertips
                                </p>

                            </div>

                        </div>

                        <div className="quick-grid">

                            <button
                                onClick={() =>
                                    navigate(
                                        "/eligibility-checker"
                                    )
                                }
                            >

                                <span>✓</span>

                                <div>

                                    <strong>
                                        Check Eligibility
                                    </strong>

                                    <small>
                                        Find schemes you qualify for
                                    </small>

                                </div>

                                <b>→</b>

                            </button>

                            <button
                                onClick={() =>
                                    navigate("/documents")
                                }
                            >

                                <span>▱</span>

                                <div>

                                    <strong>
                                        Manage Documents
                                    </strong>

                                    <small>
                                        Upload & organize documents
                                    </small>

                                </div>

                                <b>→</b>

                            </button>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/hyper-local-advisory"
                                    )
                                }
                            >

                                <span>⌖</span>

                                <div>

                                    <strong>
                                        Local Business Insights
                                    </strong>

                                    <small>
                                        Discover opportunities near you
                                    </small>

                                </div>

                                <b>→</b>

                            </button>

                            <button
                                onClick={() =>
                                    navigate("/resources")
                                }
                            >

                                <span>▥</span>

                                <div>

                                    <strong>
                                        Learning Center
                                    </strong>

                                    <small>
                                        Learn how to grow your business
                                    </small>

                                </div>

                                <b>→</b>

                            </button>

                        </div>

                    </section>

                </section>

            </main>

        </div>
    );
};

export default EntrepreneurDashboard;