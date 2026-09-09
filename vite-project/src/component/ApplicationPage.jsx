import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./ApplicationPage.css";

const STATUS_STEPS = [
    "Submitted",
    "Under Review",
    "Document Verification",
    "Approved",
    "Disbursed",
];

const getToken = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.token || localStorage.getItem("token") || "";
    } catch {
        return localStorage.getItem("token") || "";
    }
};

const getStatusIndex = (status) => {
    const normalized = String(status || "")
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .trim();

    if (normalized.includes("reject")) return -1;
    if (normalized.includes("disburs")) return 4;
    if (normalized.includes("approv")) return 3;
    if (normalized.includes("document") || normalized.includes("verif"))
        return 2;
    if (normalized.includes("review")) return 1;
    return 0;
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") {
        return "Not specified";
    }

    const number = Number(amount);

    if (Number.isNaN(number)) return amount;

    return `₹${number.toLocaleString("en-IN")}`;
};

const getSchemeIcon = (application) => {
    if (application?.schemeIcon) return application.schemeIcon;

    const name = String(
        application?.schemeName ||
        application?.scheme ||
        application?.schemeTitle ||
        ""
    ).toLowerCase();

    if (name.includes("kisan") || name.includes("pm-kisan")) return "🌾";
    if (name.includes("mudra")) return "🏪";
    if (name.includes("pmegp")) return "🏭";
    if (name.includes("svanidhi")) return "🛒";
    if (name.includes("stand-up")) return "🚀";
    if (name.includes("livestock")) return "🐄";
    if (name.includes("food")) return "🍅";
    if (name.includes("fasal") || name.includes("bima")) return "🌱";
    if (name.includes("infrastructure")) return "🏗️";
    if (name.includes("nsic")) return "🏢";

    return "📄";
};

const getSchemeName = (application) => {
    return (
        application?.schemeName ||
        application?.scheme ||
        application?.schemeTitle ||
        application?.loanType ||
        "Government Scheme"
    );
};

const getApplicationId = (application) => {
    return (
        application?.applicationId ||
        application?.applicationID ||
        application?.id ||
        application?._id ||
        "—"
    );
};

const ApplicationPage = ({ onBack }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [schemeFilter, setSchemeFilter] = useState("All");
    const [selectedApplication, setSelectedApplication] = useState(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            const response = await axios.get(
                "http://localhost:5000/api/applications/my-applications",
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                }
            );

            const data = response?.data;

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
            console.error("Application fetch error:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load your applications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const schemeNames = useMemo(() => {
        const names = applications
            .map((application) => getSchemeName(application))
            .filter(Boolean);

        return ["All", ...new Set(names)];
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return applications.filter((application) => {
            const schemeName = getSchemeName(application).toLowerCase();

            const applicationId = String(
                getApplicationId(application)
            ).toLowerCase();

            const currentStatus = String(
                application?.status || "Submitted"
            ).toLowerCase();

            const matchesSearch =
                !query ||
                schemeName.includes(query) ||
                applicationId.includes(query);

            const matchesStatus =
                statusFilter === "All" ||
                currentStatus.includes(statusFilter.toLowerCase());

            const matchesScheme =
                schemeFilter === "All" ||
                schemeName === schemeFilter.toLowerCase();

            return (
                matchesSearch &&
                matchesStatus &&
                matchesScheme
            );
        });
    }, [
        applications,
        search,
        statusFilter,
        schemeFilter,
    ]);

    const stats = useMemo(() => {
        const total = applications.length;

        const active = applications.filter((application) => {
            const status = String(
                application?.status || ""
            ).toLowerCase();

            return (
                !status.includes("reject") &&
                !status.includes("disburs") &&
                !status.includes("approv")
            );
        }).length;

        const approved = applications.filter((application) =>
            String(application?.status || "")
                .toLowerCase()
                .includes("approv")
        ).length;

        const disbursed = applications.filter((application) =>
            String(application?.status || "")
                .toLowerCase()
                .includes("disburs")
        ).length;

        return {
            total,
            active,
            approved,
            disbursed,
        };
    }, [applications]);

    const handleBack = () => {
        if (typeof onBack === "function") {
            onBack();
        } else {
            window.history.back();
        }
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("All");
        setSchemeFilter("All");
    };

    return (
        <div className="application-page">
            {/* Header */}
            <header className="application-header">
                <button
                    type="button"
                    className="application-back"
                    onClick={handleBack}
                >
                    <span>←</span>
                    Back
                </button>

                <div className="application-header-content">
                    <div className="application-header-icon">
                        📄
                    </div>

                    <div>
                        <div className="application-eyebrow">
                            VYAPAR SATHI
                        </div>

                        <h1>
                            Application / Loan Journey
                        </h1>

                        <p>
                            Apply for schemes and track your
                            application status.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="refresh-button"
                    onClick={fetchApplications}
                    disabled={loading}
                    title="Refresh applications"
                >
                    ↻
                    <span>Refresh</span>
                </button>
            </header>

            <main className="application-container">
                {/* Top intro */}
                <section className="application-intro">
                    <div>
                        <span className="application-badge">
                            Application Center
                        </span>

                        <h2>
                            Your Applications
                        </h2>

                        <p>
                            Track your government scheme and
                            loan applications from submission
                            to final decision.
                        </p>
                    </div>

                    <div className="application-security">
                        <div className="security-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Secure Tracking
                            </strong>

                            <span>
                                Your applications are linked
                                to your account.
                            </span>
                        </div>
                    </div>
                </section>

                {/* Statistics */}
                <section className="application-stats">
                    <div className="stat-card">
                        <div className="stat-icon">
                            📋
                        </div>

                        <div>
                            <span>Total Applications</span>
                            <strong>{stats.total}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ⏳
                        </div>

                        <div>
                            <span>Active Applications</span>
                            <strong>{stats.active}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ✓
                        </div>

                        <div>
                            <span>Approved</span>
                            <strong>{stats.approved}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            💰
                        </div>

                        <div>
                            <span>Disbursed</span>
                            <strong>{stats.disbursed}</strong>
                        </div>
                    </div>
                </section>

                {/* Loading */}
                {loading && (
                    <section className="application-loading">
                        <div className="loading-spinner"></div>

                        <h3>
                            Loading your applications
                        </h3>

                        <p>
                            Please wait while we fetch your
                            latest application details.
                        </p>
                    </section>
                )}

                {/* Error */}
                {!loading && error && (
                    <section className="application-error">
                        <div className="error-icon">
                            !
                        </div>

                        <div>
                            <h3>
                                Unable to load applications
                            </h3>

                            <p>{error}</p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchApplications}
                        >
                            Try Again
                        </button>
                    </section>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    applications.length === 0 && (
                        <section className="application-empty">
                            <div className="empty-illustration">
                                📋
                            </div>

                            <span className="empty-badge">
                                No Applications
                            </span>

                            <h2>
                                No Applications Yet
                            </h2>

                            <p>
                                You have not submitted any
                                scheme or loan applications yet.
                                Once you apply, your application
                                will appear here automatically.
                            </p>

                            <button
                                type="button"
                                className="empty-action"
                                onClick={handleBack}
                            >
                                Explore Schemes
                                <span>→</span>
                            </button>
                        </section>
                    )}

                {/* Applications */}
                {!loading &&
                    !error &&
                    applications.length > 0 && (
                        <>
                            {/* Filters */}
                            <section className="application-toolbar">
                                <div className="toolbar-title">
                                    <span>
                                        APPLICATIONS
                                    </span>

                                    <strong>
                                        {filteredApplications.length}
                                    </strong>
                                </div>

                                <div className="toolbar-controls">
                                    <div className="search-box">
                                        <span>⌕</span>

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Search application..."
                                        />

                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearch("")
                                                }
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>

                                    <select
                                        value={schemeFilter}
                                        onChange={(e) =>
                                            setSchemeFilter(
                                                e.target.value
                                            )
                                        }
                                    >
                                        {schemeNames.map(
                                            (scheme) => (
                                                <option
                                                    key={scheme}
                                                    value={scheme}
                                                >
                                                    {scheme ===
                                                        "All"
                                                        ? "All Schemes"
                                                        : scheme}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="All">
                                            All Status
                                        </option>
                                        <option value="Submitted">
                                            Submitted
                                        </option>
                                        <option value="Review">
                                            Under Review
                                        </option>
                                        <option value="Document">
                                            Document Verification
                                        </option>
                                        <option value="Approved">
                                            Approved
                                        </option>
                                        <option value="Disbursed">
                                            Disbursed
                                        </option>
                                        <option value="Rejected">
                                            Rejected
                                        </option>
                                    </select>

                                    {(search ||
                                        schemeFilter !==
                                        "All" ||
                                        statusFilter !==
                                        "All") && (
                                            <button
                                                type="button"
                                                className="clear-filter"
                                                onClick={
                                                    handleClearFilters
                                                }
                                            >
                                                Clear
                                            </button>
                                        )}
                                </div>
                            </section>

                            {/* No filter result */}
                            {filteredApplications.length ===
                                0 && (
                                    <section className="filtered-empty">
                                        <div>🔎</div>

                                        <h3>
                                            No matching applications
                                        </h3>

                                        <p>
                                            Try changing your search
                                            or filters.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                handleClearFilters
                                            }
                                        >
                                            Clear Filters
                                        </button>
                                    </section>
                                )}

                            {/* Cards */}
                            <section className="applications-grid">
                                {filteredApplications.map(
                                    (application) => {
                                        const status =
                                            application?.status ||
                                            "Submitted";

                                        const currentIndex =
                                            getStatusIndex(
                                                status
                                            );

                                        const rejected =
                                            String(status)
                                                .toLowerCase()
                                                .includes(
                                                    "reject"
                                                );

                                        const schemeName =
                                            getSchemeName(
                                                application
                                            );

                                        const applicationId =
                                            getApplicationId(
                                                application
                                            );

                                        return (
                                            <article
                                                className={`application-card ${rejected
                                                        ? "application-rejected"
                                                        : ""
                                                    }`}
                                                key={
                                                    application?._id ||
                                                    applicationId
                                                }
                                            >
                                                <div className="card-top">
                                                    <div className="scheme-info">
                                                        <div className="scheme-icon">
                                                            {getSchemeIcon(
                                                                application
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span>
                                                                Government
                                                                Scheme
                                                            </span>

                                                            <h3>
                                                                {
                                                                    schemeName
                                                                }
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`status-badge status-${rejected
                                                            ? "rejected"
                                                            : status
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )}`}
                                                    >
                                                        <i></i>
                                                        {status}
                                                    </span>
                                                </div>

                                                <div className="application-meta">
                                                    <div>
                                                        <span>
                                                            Application
                                                            ID
                                                        </span>

                                                        <strong>
                                                            {
                                                                applicationId
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Submitted
                                                        </span>

                                                        <strong>
                                                            {formatDate(
                                                                application?.createdAt ||
                                                                application?.submittedAt ||
                                                                application?.date
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Loan / Support
                                                        </span>

                                                        <strong>
                                                            {formatAmount(
                                                                application?.loanAmount ||
                                                                application?.amount
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>

                                                <div className="journey-section">
                                                    <div className="journey-heading">
                                                        <span>
                                                            Application
                                                            Journey
                                                        </span>

                                                        <small>
                                                            {rejected
                                                                ? "Application Rejected"
                                                                : currentIndex ===
                                                                    4
                                                                    ? "Completed"
                                                                    : `${currentIndex + 1}/5`}
                                                        </small>
                                                    </div>

                                                    <div
                                                        className={`journey ${rejected
                                                                ? "journey-rejected"
                                                                : ""
                                                            }`}
                                                    >
                                                        {STATUS_STEPS.map(
                                                            (
                                                                step,
                                                                index
                                                            ) => {
                                                                const isDone =
                                                                    !rejected &&
                                                                    index <=
                                                                    currentIndex;

                                                                const isCurrent =
                                                                    !rejected &&
                                                                    index ===
                                                                    currentIndex;

                                                                return (
                                                                    <div
                                                                        className={`journey-step ${isDone
                                                                                ? "done"
                                                                                : ""
                                                                            } ${isCurrent
                                                                                ? "current"
                                                                                : ""
                                                                            }`}
                                                                        key={
                                                                            step
                                                                        }
                                                                    >
                                                                        <div className="step-dot">
                                                                            {isDone
                                                                                ? "✓"
                                                                                : index +
                                                                                1}
                                                                        </div>

                                                                        <span>
                                                                            {
                                                                                step
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>

                                                {application?.remarks && (
                                                    <div className="application-remark">
                                                        <span>
                                                            Latest Update
                                                        </span>

                                                        <p>
                                                            {
                                                                application.remarks
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="card-bottom">
                                                    <button
                                                        type="button"
                                                        className="view-application"
                                                        onClick={() =>
                                                            setSelectedApplication(
                                                                application
                                                            )
                                                        }
                                                    >
                                                        View Application
                                                        <span>
                                                            →
                                                        </span>
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </section>
                        </>
                    )}

                <div className="application-disclaimer">
                    <span>ⓘ</span>

                    <p>
                        Application status shown here is based
                        on information available in Vyapar Sathi.
                        Final approval, rejection, document
                        verification and disbursement are
                        determined by the concerned government
                        department, bank or lending authority.
                    </p>
                </div>
            </main>

            {/* Details Modal */}
            {selectedApplication && (
                <div
                    className="application-modal-overlay"
                    onClick={() =>
                        setSelectedApplication(null)
                    }
                >
                    <div
                        className="application-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="modal-header">
                            <div>
                                <span>
                                    APPLICATION DETAILS
                                </span>

                                <h2>
                                    {getSchemeName(
                                        selectedApplication
                                    )}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedApplication(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-status">
                            <span>Status</span>

                            <strong>
                                {selectedApplication?.status ||
                                    "Submitted"}
                            </strong>
                        </div>

                        <div className="modal-details-grid">
                            <div>
                                <span>
                                    Application ID
                                </span>

                                <strong>
                                    {getApplicationId(
                                        selectedApplication
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Application Date
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedApplication?.createdAt ||
                                        selectedApplication?.submittedAt
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Applicant Name
                                </span>

                                <strong>
                                    {selectedApplication?.name ||
                                        selectedApplication
                                            ?.applicantName ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Mobile
                                </span>

                                <strong>
                                    {selectedApplication?.mobile ||
                                        selectedApplication
                                            ?.phone ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Loan / Support Amount
                                </span>

                                <strong>
                                    {formatAmount(
                                        selectedApplication?.loanAmount ||
                                        selectedApplication?.amount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    State
                                </span>

                                <strong>
                                    {selectedApplication?.state ||
                                        "—"}
                                </strong>
                            </div>
                        </div>

                        {selectedApplication?.purpose && (
                            <div className="modal-purpose">
                                <span>
                                    Purpose
                                </span>

                                <p>
                                    {
                                        selectedApplication.purpose
                                    }
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            className="modal-close"
                            onClick={() =>
                                setSelectedApplication(null)
                            }
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationPage;