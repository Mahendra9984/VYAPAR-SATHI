import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH ADMIN DASHBOARD DATA
    // =====================================================
    useEffect(() => {
        const fetchAdminDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/admin/dashboard",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                // Read response safely
                const contentType =
                    response.headers.get("content-type") || "";

                let data;

                if (contentType.includes("application/json")) {
                    data = await response.json();
                } else {
                    const text = await response.text();

                    console.error(
                        "Non-JSON Admin Dashboard Response:",
                        text
                    );

                    throw new Error(
                        `Server returned non-JSON response (${response.status}). Check that http://localhost:5000 is running and /api/admin/dashboard exists.`
                    );
                }

                console.log("Admin Dashboard Response:", data);

                // =====================================================
                // AUTH ERROR
                // =====================================================
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");

                        navigate("/login");
                        return;
                    }

                    if (response.status === 403) {
                        setError(
                            "You do not have admin access."
                        );
                        return;
                    }

                    throw new Error(
                        data?.message ||
                        "Unable to load admin dashboard."
                    );
                }

                // =====================================================
                // SAVE DATA
                // =====================================================
                setDashboardData(data);
            } catch (err) {
                console.error(
                    "Admin Dashboard Error:",
                    err
                );

                setError(
                    err?.message ||
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAdminDashboard();
    }, [navigate]);

    // =====================================================
    // LOGGED-IN USER
    // =====================================================
    let loggedUser = {};

    try {
        const storedUser =
            localStorage.getItem("user");

        loggedUser = storedUser
            ? JSON.parse(storedUser)
            : {};
    } catch (err) {
        console.error(
            "Invalid user data in localStorage:",
            err
        );

        loggedUser = {};
    }

    // =====================================================
    // LOGOUT
    // =====================================================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // =====================================================
    // LOADING
    // =====================================================
    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>

                <h2>
                    Loading Admin Dashboard...
                </h2>

                <p>
                    Please wait while we load your
                    dashboard.
                </p>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================
    if (error) {
        return (
            <div className="admin-loading">
                <div className="error-icon">
                    !
                </div>

                <h2>
                    Unable to load dashboard
                </h2>

                <p>{error}</p>

                <div className="error-actions">
                    <button
                        className="retry-btn"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Retry
                    </button>

                    <button
                        className="back-login-btn"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // =====================================================
    // DYNAMIC STATS
    // =====================================================
    const apiStats =
        dashboardData?.stats || {};

    const totalUsers =
        apiStats.totalUsers ?? 0;

    const totalAdmins =
        apiStats.totalAdmins ?? 0;

    const totalNormalUsers =
        apiStats.totalNormalUsers ?? 0;

    const totalApplications =
        apiStats.totalApplications ?? 0;

    const pendingApplications =
        apiStats.pendingApplications ?? 0;

    const approvedApplications =
        apiStats.approvedApplications ?? 0;

    const rejectedApplications =
        apiStats.rejectedApplications ?? 0;

    const disbursedLoans =
        apiStats.disbursedLoans ?? "₹0";

    const stats = [
        {
            title: "Total Entrepreneurs",
            value: totalNormalUsers,
            icon: "👥",
        },
        {
            title: "Total Applications",
            value: totalApplications,
            icon: "📄",
        },
        {
            title: "Pending Applications",
            value: pendingApplications,
            icon: "⏳",
        },
        {
            title: "Approved Applications",
            value: approvedApplications,
            icon: "✓",
        },
        {
            title: "Rejected Applications",
            value: rejectedApplications,
            icon: "✕",
        },
        {
            title: "Disbursed Loans",
            value: disbursedLoans,
            icon: "₹",
        },
    ];

    // =====================================================
    // RECENT APPLICATIONS
    // =====================================================
    const recentApplications =
        dashboardData?.recentApplications || [];

    // =====================================================
    // SCHEME SUMMARY
    // =====================================================
    const schemeSummary =
        dashboardData?.schemeSummary || [];

    // =====================================================
    // DISTRICT SUMMARY
    // =====================================================
    const districtSummary =
        dashboardData?.districtSummary || [];

    // =====================================================
    // APPLICATION OVERVIEW
    // =====================================================
    const applicationOverview =
        dashboardData?.applicationOverview || [
            45,
            70,
            55,
            90,
            75,
            110,
            130,
            105,
            145,
            125,
            165,
            150,
        ];

    // =====================================================
    // STATUS CLASS
    // =====================================================
    const getStatusClass = (status) => {
        return `status status-${String(
            status || ""
        )
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
    };

    // =====================================================
    // RETURN
    // =====================================================
    return (
        <div className="admin-layout">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}
            <aside className="admin-sidebar">

                <div className="admin-logo">
                    <h2>
                        Vyapar Sathi
                    </h2>

                    <span>
                        Admin Panel
                    </span>
                </div>

                <nav className="admin-nav">

                    <button
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate(
                                "/admin-dashboard"
                            )
                        }
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/entrepreneurs"
                            )
                        }
                    >
                        <span>👨‍💼</span>
                        Entrepreneurs
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/applications"
                            )
                        }
                    >
                        <span>📄</span>
                        Applications
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/schemes"
                            )
                        }
                    >
                        <span>🏛️</span>
                        Schemes
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/documents"
                            )
                        }
                    >
                        <span>📑</span>
                        Documents Verification
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/users"
                            )
                        }
                    >
                        <span>👥</span>
                        Users Management
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/reports"
                            )
                        }
                    >
                        <span>📈</span>
                        Reports & Analytics
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/notifications"
                            )
                        }
                    >
                        <span>🔔</span>
                        Notifications

                        <span className="notification-badge">
                            5
                        </span>
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/settings"
                            )
                        }
                    >
                        <span>⚙️</span>
                        Settings
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/help")
                        }
                    >
                        <span>❓</span>
                        Help & Support
                    </button>

                </nav>

                <button
                    className="admin-logout"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    Logout
                </button>

            </aside>

            {/* =====================================================
                MAIN
            ===================================================== */}
            <main className="admin-main">

                {/* =====================================================
                    HEADER
                ===================================================== */}
                <header className="admin-header">

                    <div className="admin-header-left">
                        <h1>
                            Dashboard Overview
                        </h1>

                        <p>
                            Manage and monitor
                            Vyapar Sathi activity.
                        </p>
                    </div>

                    <div className="admin-user">

                        <div className="admin-avatar">
                            {loggedUser?.name
                                ? loggedUser.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "A"}
                        </div>

                        <div className="admin-user-info">

                            <strong>
                                {loggedUser?.name ||
                                    "Admin User"}
                            </strong>

                            <small>
                                {loggedUser?.role ===
                                    "admin"
                                    ? "Super Admin"
                                    : "User"}
                            </small>

                        </div>

                    </div>

                </header>

                {/* =====================================================
                    FILTERS
                ===================================================== */}
                <div className="admin-filters">

                    <select defaultValue="all">
                        <option value="all">
                            All Districts
                        </option>

                        <option value="Mirzapur">
                            Mirzapur
                        </option>

                        <option value="Chunar">
                            Chunar
                        </option>

                        <option value="Vindhyachal">
                            Vindhyachal
                        </option>

                        <option value="Lalganj">
                            Lalganj
                        </option>
                    </select>

                    <select defaultValue="all">
                        <option value="all">
                            All Time
                        </option>

                        <option value="7">
                            Last 7 Days
                        </option>

                        <option value="30">
                            Last 30 Days
                        </option>

                        <option value="year">
                            This Year
                        </option>
                    </select>

                </div>

                {/* =====================================================
                    STATS
                ===================================================== */}
                <section className="stats-grid">

                    {stats.map(
                        (stat, index) => (
                            <div
                                className="stat-card"
                                key={index}
                            >

                                <div className="stat-icon">
                                    {stat.icon}
                                </div>

                                <div className="stat-content">

                                    <p>
                                        {stat.title}
                                    </p>

                                    <h2>
                                        {stat.value}
                                    </h2>

                                    <span className="positive">
                                        Live
                                    </span>

                                </div>

                            </div>
                        )
                    )}

                </section>

                {/* =====================================================
                    ANALYTICS
                ===================================================== */}
                <section className="analytics-grid">

                    {/* =================================================
                        APPLICATION OVERVIEW
                    ================================================= */}
                    <div className="analytics-card overview-card">

                        <div className="card-title">

                            <div>
                                <h2>
                                    Applications
                                    Overview
                                </h2>

                                <p>
                                    Application activity
                                    over time
                                </p>
                            </div>

                            <select defaultValue="Daily">
                                <option value="Daily">
                                    Daily
                                </option>

                                <option value="Weekly">
                                    Weekly
                                </option>

                                <option value="Monthly">
                                    Monthly
                                </option>
                            </select>

                        </div>

                        <div className="bar-chart">

                            {applicationOverview.map(
                                (
                                    height,
                                    index
                                ) => (
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${height}px`,
                                        }}
                                        key={index}
                                        title={`Applications: ${height}`}
                                    />
                                )
                            )}

                        </div>

                        <div className="chart-labels">

                            <span>14 May</span>
                            <span>15 May</span>
                            <span>16 May</span>
                            <span>17 May</span>
                            <span>18 May</span>
                            <span>19 May</span>
                            <span>20 May</span>

                        </div>

                    </div>

                    {/* =================================================
                        SCHEME
                    ================================================= */}
                    <div className="analytics-card">

                        <h2>
                            Applications by
                            Scheme
                        </h2>

                        <p className="card-subtitle">
                            Distribution by
                            government scheme
                        </p>

                        <div className="donut scheme-donut">

                            <div>
                                <strong>
                                    {totalApplications}
                                </strong>

                                <span>
                                    Total
                                </span>
                            </div>

                        </div>

                        <div className="legend">

                            {schemeSummary.length >
                                0 ? (
                                schemeSummary.map(
                                    (
                                        scheme,
                                        index
                                    ) => (
                                        <p
                                            key={
                                                index
                                            }
                                        >
                                            <span
                                                className={`dot dot-${(index %
                                                        4) +
                                                    1
                                                    }`}
                                            ></span>

                                            <span className="legend-name">
                                                {scheme.name}
                                            </span>

                                            <strong>
                                                {
                                                    scheme.count
                                                }
                                            </strong>
                                        </p>
                                    )
                                )
                            ) : (
                                <>
                                    <p>
                                        <span className="dot dot-1"></span>

                                        <span className="legend-name">
                                            Micro Finance Scheme
                                        </span>

                                        <strong>
                                            0
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="dot dot-2"></span>

                                        <span className="legend-name">
                                            PMEGP Scheme
                                        </span>

                                        <strong>
                                            0
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="dot dot-3"></span>

                                        <span className="legend-name">
                                            Stand Up India
                                        </span>

                                        <strong>
                                            0
                                        </strong>
                                    </p>
                                </>
                            )}

                        </div>

                    </div>

                    {/* =================================================
                        STATUS
                    ================================================= */}
                    <div className="analytics-card">

                        <h2>
                            Applications by
                            Status
                        </h2>

                        <p className="card-subtitle">
                            Current application
                            status
                        </p>

                        <div className="donut status-donut">

                            <div>
                                <strong>
                                    {totalApplications}
                                </strong>

                                <span>
                                    Total
                                </span>
                            </div>

                        </div>

                        <div className="legend">

                            <p>
                                <span className="dot dot-approved"></span>

                                <span className="legend-name">
                                    Approved
                                </span>

                                <strong>
                                    {
                                        approvedApplications
                                    }
                                </strong>
                            </p>

                            <p>
                                <span className="dot dot-pending"></span>

                                <span className="legend-name">
                                    Pending
                                </span>

                                <strong>
                                    {
                                        pendingApplications
                                    }
                                </strong>
                            </p>

                            <p>
                                <span className="dot dot-rejected"></span>

                                <span className="legend-name">
                                    Rejected
                                </span>

                                <strong>
                                    {
                                        rejectedApplications
                                    }
                                </strong>
                            </p>

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    BOTTOM GRID
                ===================================================== */}
                <section className="bottom-grid">

                    {/* =================================================
                        RECENT APPLICATIONS
                    ================================================= */}
                    <div className="table-card">

                        <div className="table-header">

                            <div>
                                <h2>
                                    Recent
                                    Applications
                                </h2>

                                <p>
                                    Latest applications
                                    submitted
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/applications"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>

                        <div className="table-wrapper">

                            <table>

                                <thead>
                                    <tr>
                                        <th>
                                            Applicant
                                            Name
                                        </th>

                                        <th>
                                            Scheme
                                        </th>

                                        <th>
                                            District
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {recentApplications.length >
                                        0 ? (
                                        recentApplications.map(
                                            (
                                                application,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        application?._id ||
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        {application?.name ||
                                                            application
                                                                ?.user
                                                                ?.name ||
                                                            "N/A"}
                                                    </td>

                                                    <td>
                                                        {application?.scheme ||
                                                            "N/A"}
                                                    </td>

                                                    <td>
                                                        {application?.district ||
                                                            "N/A"}
                                                    </td>

                                                    <td>
                                                        {application?.amount ??
                                                            "₹0"}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={getStatusClass(
                                                                application?.status
                                                            )}
                                                        >
                                                            {application?.status ||
                                                                "Pending"}
                                                        </span>

                                                    </td>

                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="empty-table"
                                            >
                                                No recent
                                                applications
                                                found
                                            </td>

                                        </tr>
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* =================================================
                        DISTRICT SUMMARY
                    ================================================= */}
                    <div className="table-card district-card">

                        <div className="table-header">

                            <div>
                                <h2>
                                    District Wise
                                    Summary
                                </h2>

                                <p>
                                    Entrepreneur
                                    activity by
                                    district
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/reports"
                                    )
                                }
                            >
                                Full Report
                            </button>

                        </div>

                        <div className="district-list">

                            {districtSummary.length >
                                0 ? (
                                districtSummary.map(
                                    (
                                        district,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                district?._id ||
                                                index
                                            }
                                        >
                                            <span>
                                                {
                                                    district?.name
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    district?.count
                                                }
                                            </strong>
                                        </div>
                                    )
                                )
                            ) : (
                                <div>
                                    <span>
                                        No district
                                        data
                                    </span>

                                    <strong>
                                        0
                                    </strong>
                                </div>
                            )}

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    ADMIN INFORMATION
                ===================================================== */}
                <section className="admin-information">

                    <div>
                        <span>
                            Total Users
                        </span>

                        <strong>
                            {totalUsers}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Total Admins
                        </span>

                        <strong>
                            {totalAdmins}
                        </strong>
                    </div>

                </section>

            </main>

        </div>
    );
};

export default AdminDashboard;