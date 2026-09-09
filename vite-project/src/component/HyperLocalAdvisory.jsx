import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./HyperLocalAdvisory.css";

const HyperLocalAdvisory = () => {
    const navigate = useNavigate();

    const [location, setLocation] = useState({
        village: "",
        locality: "",
        area: "",
        district: "",
        state: "Uttar Pradesh",
        pincode: "",
    });

    const [businessContext, setBusinessContext] = useState({
        category: "",
        budget: "",
        skills: "",
        targetCustomers: "",
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // LOCATION CHANGE
    // =====================================================

    const handleLocationChange = (e) => {
        const { name, value } = e.target;

        setLocation((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // BUSINESS CONTEXT CHANGE
    // =====================================================

    const handleBusinessChange = (e) => {
        const { name, value } = e.target;

        setBusinessContext((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // GENERATE ADVISORY
    // =====================================================

    const handleGenerateAdvisory = async (e) => {
        e.preventDefault();

        setError("");
        setResult(null);

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        if (!location.district.trim()) {
            setError("Please enter your district.");
            return;
        }

        if (!businessContext.category.trim()) {
            setError("Please enter your business category.");
            return;
        }

        if (!businessContext.budget.trim()) {
            setError("Please enter your budget.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/hyper-local",
                {
                    location,
                    businessContext,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data?.success) {
                setResult(response.data);
            } else {
                setError(
                    response.data?.message ||
                    "Unable to generate Hyper-Local Advisory."
                );
            }
        } catch (err) {
            console.error("Hyper Local Advisory Error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Hyper Local Advisory is temporarily unavailable."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // RESET
    // =====================================================

    const handleReset = () => {
        setLocation({
            village: "",
            locality: "",
            area: "",
            district: "",
            state: "Uttar Pradesh",
            pincode: "",
        });

        setBusinessContext({
            category: "",
            budget: "",
            skills: "",
            targetCustomers: "",
        });

        setResult(null);
        setError("");
    };

    // =====================================================
    // CURRENCY FORMAT
    // =====================================================

    const formatCurrency = (value) => {
        if (!value) return "Not available";

        const number = Number(value);

        if (Number.isNaN(number)) {
            return value;
        }

        return `₹${number.toLocaleString("en-IN")}`;
    };

    // =====================================================
    // POTENTIAL CLASS
    // =====================================================

    const getPotentialClass = (level) => {
        if (!level) return "moderate";

        if (level.includes("HIGH") || level.includes("🔥")) {
            return "high";
        }

        if (level.includes("GOOD") || level.includes("🟢")) {
            return "good";
        }

        return "moderate";
    };

    // =====================================================
    // SCORE CLASS
    // =====================================================

    const getScoreClass = (score) => {
        if (score >= 100) return "score-high";
        if (score >= 60) return "score-good";

        return "score-moderate";
    };

    return (
        <div className="hyper-local-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="hyper-local-header">
                <div
                    className="hyper-local-back"
                    onClick={() => navigate("/dashboard")}
                >
                    ←
                </div>

                <div className="hyper-local-header-content">
                    <div className="hyper-local-icon">
                        ⌖
                    </div>

                    <div>
                        <h1>Hyper-Local Advisory</h1>

                        <p>
                            Discover business opportunities based on your
                            local market
                        </p>
                    </div>
                </div>

                <button
                    className="dashboard-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </button>
            </header>

            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="hyper-local-container">

                {/* =====================================================
                    INTRO
                ===================================================== */}

                <section className="hyper-local-intro">
                    <div>
                        <span className="intro-label">
                            LOCAL BUSINESS INTELLIGENCE
                        </span>

                        <h2>
                            Find the right business opportunity
                            <br />
                            for your locality
                        </h2>

                        <p>
                            Enter your location, budget and business
                            preferences. Vyapar Sathi will analyse the
                            available local market data and show relevant
                            opportunities.
                        </p>
                    </div>

                    <div className="intro-visual">
                        <div className="visual-circle">
                            ⌖
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (
                    <div className="hyper-local-error">
                        <span>⚠</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* =====================================================
                    FORM
                ===================================================== */}

                <section className="hyper-local-form-card">
                    <div className="form-card-header">
                        <div>
                            <h2>Your Business & Location</h2>

                            <p>
                                Provide details to get a local market
                                advisory.
                            </p>
                        </div>

                        <div className="form-step">
                            1
                        </div>
                    </div>

                    <form onSubmit={handleGenerateAdvisory}>

                        {/* =================================================
                            LOCATION
                        ================================================= */}

                        <div className="form-section">
                            <div className="form-section-title">
                                <span>⌖</span>

                                <div>
                                    <h3>Location Details</h3>

                                    <p>
                                        Tell us where you want to start
                                        your business.
                                    </p>
                                </div>
                            </div>

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>Village</label>

                                    <input
                                        type="text"
                                        name="village"
                                        value={location.village}
                                        onChange={handleLocationChange}
                                        placeholder="Enter village"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Locality</label>

                                    <input
                                        type="text"
                                        name="locality"
                                        value={location.locality}
                                        onChange={handleLocationChange}
                                        placeholder="Enter locality"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Area</label>

                                    <input
                                        type="text"
                                        name="area"
                                        value={location.area}
                                        onChange={handleLocationChange}
                                        placeholder="Enter area"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>District *</label>

                                    <input
                                        type="text"
                                        name="district"
                                        value={location.district}
                                        onChange={handleLocationChange}
                                        placeholder="e.g. Mirzapur"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>State</label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={location.state}
                                        onChange={handleLocationChange}
                                        placeholder="Enter state"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Pincode</label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={location.pincode}
                                        onChange={handleLocationChange}
                                        placeholder="e.g. 231001"
                                        maxLength="6"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* =================================================
                            BUSINESS
                        ================================================= */}

                        <div className="form-section">
                            <div className="form-section-title">
                                <span>◈</span>

                                <div>
                                    <h3>Business Preferences</h3>

                                    <p>
                                        Help us understand what kind of
                                        business you want to start.
                                    </p>
                                </div>
                            </div>

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>
                                        Business Category *
                                    </label>

                                    <input
                                        type="text"
                                        name="category"
                                        value={businessContext.category}
                                        onChange={handleBusinessChange}
                                        placeholder="e.g. Kirana Store"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Budget *</label>

                                    <input
                                        type="number"
                                        name="budget"
                                        value={businessContext.budget}
                                        onChange={handleBusinessChange}
                                        placeholder="e.g. 100000"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Skills</label>

                                    <input
                                        type="text"
                                        name="skills"
                                        value={businessContext.skills}
                                        onChange={handleBusinessChange}
                                        placeholder="e.g. basic business skills"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Target Customers
                                    </label>

                                    <input
                                        type="text"
                                        name="targetCustomers"
                                        value={
                                            businessContext.targetCustomers
                                        }
                                        onChange={handleBusinessChange}
                                        placeholder="e.g. local families"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="reset-btn"
                                onClick={handleReset}
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                className="generate-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Analysing Market...
                                    </>
                                ) : (
                                    <>
                                        ✦ Generate Local Advisory
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </section>

                {/* =====================================================
                    RESULT
                ===================================================== */}

                {result && (
                    <section className="hyper-local-results">

                        {/* =================================================
                            RESULT HEADER
                        ================================================= */}

                        <div className="results-header">
                            <div>
                                <span className="intro-label">
                                    ADVISORY RESULT
                                </span>

                                <h2>
                                    Your Hyper-Local Market Insights
                                </h2>

                                <p>
                                    Based on the location and business
                                    information you provided.
                                </p>
                            </div>

                            <div className="data-level-badge">
                                {result.dataLevel || "BROADER"}
                            </div>
                        </div>

                        {/* =================================================
                            MARKET SUMMARY
                        ================================================= */}

                        <div className="market-summary-card">
                            <div className="summary-title">
                                <span>◉</span>

                                <div>
                                    <h3>Market Summary</h3>

                                    <p>
                                        Available local market data
                                    </p>
                                </div>
                            </div>

                            <div className="summary-grid">

                                <div className="summary-item">
                                    <span>Location</span>

                                    <strong>
                                        {result.marketSummary?.location
                                            ?.district ||
                                            location.district}
                                    </strong>

                                    <small>
                                        {result.marketSummary?.location
                                            ?.state ||
                                            location.state}
                                    </small>
                                </div>

                                <div className="summary-item">
                                    <span>Business Category</span>

                                    <strong>
                                        {result.marketSummary
                                            ?.businessContext
                                            ?.category ||
                                            businessContext.category}
                                    </strong>

                                    <small>
                                        Requested category
                                    </small>
                                </div>

                                <div className="summary-item">
                                    <span>Total Records</span>

                                    <strong>
                                        {result.marketSummary
                                            ?.totalRecords ??
                                            result.totalRecords ??
                                            0}
                                    </strong>

                                    <small>
                                        Available market records
                                    </small>
                                </div>

                                <div className="summary-item">
                                    <span>Matched Records</span>

                                    <strong>
                                        {result.marketSummary
                                            ?.matchedRecords ??
                                            result.matchedRecords ??
                                            0}
                                    </strong>

                                    <small>
                                        Matching market records
                                    </small>
                                </div>

                                <div className="summary-item">
                                    <span>
                                        Exact Location Matches
                                    </span>

                                    <strong>
                                        {result.marketSummary
                                            ?.exactLocationMatches ??
                                            result.exactLocationMatches ??
                                            0}
                                    </strong>

                                    <small>
                                        Exact locality matches
                                    </small>
                                </div>

                                <div className="summary-item">
                                    <span>Category Matches</span>

                                    <strong>
                                        {result.marketSummary
                                            ?.categoryMatches ??
                                            result.categoryMatches ??
                                            0}
                                    </strong>

                                    <small>
                                        Category-related records
                                    </small>
                                </div>

                            </div>
                        </div>

                        {/* =================================================
                            RECOMMENDATIONS
                        ================================================= */}

                        <div className="recommendations-section">
                            <div className="recommendations-heading">
                                <div>
                                    <h2>
                                        Recommended Opportunities
                                    </h2>

                                    <p>
                                        Top opportunities from the available
                                        market data.
                                    </p>
                                </div>

                                <span>
                                    {result.recommendations?.length || 0} Results
                                </span>
                            </div>

                            <div className="recommendation-cards">

                                {result.recommendations &&
                                    result.recommendations.length > 0 ? (
                                    result.recommendations.map(
                                        (recommendation, index) => {
                                            const score = Number(
                                                recommendation.relevanceScore || 0
                                            );

                                            return (
                                                <div
                                                    className="opportunity-card"
                                                    key={
                                                        recommendation._id ||
                                                        `${recommendation.businessName}-${index}`
                                                    }
                                                >

                                                    {/* CARD TOP */}

                                                    <div className="opportunity-top">
                                                        <div className="rank-circle">
                                                            {recommendation.rank ||
                                                                index + 1}
                                                        </div>

                                                        <div className="opportunity-title">
                                                            <h3>
                                                                {
                                                                    recommendation.businessName
                                                                }
                                                            </h3>

                                                            <span>
                                                                {
                                                                    recommendation.category
                                                                }
                                                            </span>
                                                        </div>

                                                        <div
                                                            className={`potential-badge ${getPotentialClass(
                                                                recommendation.potentialLevel
                                                            )}`}
                                                        >
                                                            {
                                                                recommendation.potentialLevel
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* SCORE */}

                                                    <div className="score-section">
                                                        <div>
                                                            <span>
                                                                Relevance Score
                                                            </span>

                                                            <strong
                                                                className={getScoreClass(
                                                                    score
                                                                )}
                                                            >
                                                                {score}
                                                            </strong>
                                                        </div>

                                                        <div className="score-bar">
                                                            <div
                                                                className="score-progress"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        score,
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* DETAILS */}

                                                    <div className="opportunity-details">

                                                        <div className="detail-box">
                                                            <span>
                                                                Location Match
                                                            </span>

                                                            <strong>
                                                                {
                                                                    recommendation.locationMatch ||
                                                                    "Broader"
                                                                }
                                                            </strong>
                                                        </div>

                                                        <div className="detail-box">
                                                            <span>
                                                                Target Customers
                                                            </span>

                                                            <strong>
                                                                {
                                                                    recommendation.targetCustomers ||
                                                                    "Local customers"
                                                                }
                                                            </strong>
                                                        </div>

                                                        <div className="detail-box">
                                                            <span>
                                                                Investment
                                                            </span>

                                                            <strong>
                                                                {typeof recommendation.estimatedInvestment ===
                                                                    "number"
                                                                    ? formatCurrency(
                                                                        recommendation.estimatedInvestment
                                                                    )
                                                                    : recommendation.estimatedInvestment ||
                                                                    "Not available"}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-box">
                                                            <span>
                                                                Difficulty
                                                            </span>

                                                            <strong>
                                                                {
                                                                    recommendation.difficultyLevel ||
                                                                    "Medium"
                                                                }
                                                            </strong>
                                                        </div>

                                                    </div>

                                                    {/* WHY */}

                                                    <div className="why-box">
                                                        <span>
                                                            Why it may work
                                                        </span>

                                                        <p>
                                                            {
                                                                recommendation.whyItMayWork
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* COMPETITION */}

                                                    <div className="insight-row">
                                                        <div>
                                                            <span>
                                                                Competition
                                                            </span>

                                                            <p>
                                                                {
                                                                    recommendation.competition ||
                                                                    "Based on available local business records."
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* PROFIT */}

                                                    <div className="insight-row">
                                                        <div>
                                                            <span>
                                                                Profit Opportunity
                                                            </span>

                                                            <p>
                                                                {
                                                                    recommendation.profitOpportunity ||
                                                                    "Depends on local demand, pricing and operating costs."
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* RISKS */}

                                                    <div className="risk-box">
                                                        <span>
                                                            ⚠ Main Risks
                                                        </span>

                                                        <p>
                                                            {
                                                                recommendation.mainRisks ||
                                                                "Competition, operating costs and local demand may affect results."
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* DATABASE SUPPORT */}

                                                    {recommendation.databaseSupport && (
                                                        <details className="database-details">
                                                            <summary>
                                                                View Database Support
                                                            </summary>

                                                            <div className="database-grid">

                                                                <div>
                                                                    <span>
                                                                        Source
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            recommendation
                                                                                .databaseSupport
                                                                                .source ||
                                                                            "Vyapar Sathi MongoDB"
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        Business
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            recommendation
                                                                                .databaseSupport
                                                                                .businessName ||
                                                                            "-"
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        Category
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            recommendation
                                                                                .databaseSupport
                                                                                .category ||
                                                                            "-"
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        District
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            recommendation
                                                                                .databaseSupport
                                                                                .district ||
                                                                            "-"
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        State
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            recommendation
                                                                                .databaseSupport
                                                                                .state ||
                                                                            "-"
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <span>
                                                                        Pincode
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            recommendation
                                                                                .databaseSupport
                                                                                .pincode ||
                                                                            "-"
                                                                        }
                                                                    </p>
                                                                </div>

                                                            </div>
                                                        </details>
                                                    )}

                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <div className="no-results">
                                        <div>⌖</div>

                                        <h3>
                                            No Recommendations Found
                                        </h3>

                                        <p>
                                            No matching local market data was
                                            found for the selected location
                                            and business category.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* =================================================
                            ACTION PLAN
                        ================================================= */}

                        {result.actionPlan &&
                            result.actionPlan.length > 0 && (
                                <div className="action-plan-card">

                                    <div className="action-plan-header">
                                        <div className="action-plan-icon">
                                            ✓
                                        </div>

                                        <div>
                                            <h2>
                                                Your Action Plan
                                            </h2>

                                            <p>
                                                Practical steps to validate
                                                and start your business.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="action-plan-list">
                                        {result.actionPlan.map(
                                            (step, index) => (
                                                <div
                                                    className="action-plan-item"
                                                    key={index}
                                                >
                                                    <div className="action-number">
                                                        {index + 1}
                                                    </div>

                                                    <p>
                                                        {typeof step === "string"
                                                            ? step.replace(
                                                                /^Step\s+\d+\s*:\s*/i,
                                                                ""
                                                            )
                                                            : step?.step ||
                                                            step?.description ||
                                                            String(step)}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* =================================================
                            DISCLAIMER
                        ================================================= */}

                        <div className="advisory-disclaimer">
                            <span>ⓘ</span>

                            <p>
                                <strong>Important:</strong> These insights
                                are based on available market records and
                                should be used for preliminary business
                                planning. Actual demand, competition,
                                investment requirements and profitability
                                may vary by locality.
                            </p>
                        </div>

                    </section>
                )}

            </main>
        </div>
    );
};

export default HyperLocalAdvisory;