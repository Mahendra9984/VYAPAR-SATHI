import React, { useMemo, useState } from "react";

import {
    FaArrowLeft,
    FaArrowRight,
    FaSearch,
    FaFilter,
    FaTimes,
    FaCheckCircle,
    FaLandmark,
    FaMapMarkerAlt,
    FaBuilding,
    FaTag,
    FaCalendarAlt,
    FaLayerGroup,
    FaInfoCircle,
    FaExternalLinkAlt,
} from "react-icons/fa";

import "./GovernmentSchemes.css";

/* =========================================================
   GOVERNMENT SCHEMES - STATIC DATA VERSION
   No external API
   No axios
   No authentication required
   ========================================================= */

const SCHEMES_DATA = [
    {
        id: "pm-kisan",
        scheme_name: "PM-KISAN",
        short_title: "Pradhan Mantri Kisan Samman Nidhi",
        brief:
            "Provides income support to eligible farmer families to help meet agricultural and household needs.",
        level: "Central Government",
        ministry: "Ministry of Agriculture & Farmers Welfare",
        beneficiary_state: "All India",
        categories: "Agriculture, Farmers",
        scheme_for: "Eligible landholding farmer families",
        assistance: "₹6,000 per year",
        tags: "Farmer, Agriculture, Income Support, Kisan",
        close_date: "As per government guidelines",
        official_url: "https://pmkisan.gov.in/",
    },

    {
        id: "kcc",
        scheme_name: "Kisan Credit Card",
        short_title: "KCC",
        brief:
            "Provides timely credit support to farmers for cultivation, post-harvest expenses and related agricultural needs.",
        level: "Central Government",
        ministry: "Ministry of Agriculture & Farmers Welfare",
        beneficiary_state: "All India",
        categories: "Agriculture, Credit",
        scheme_for: "Farmers and eligible agricultural borrowers",
        assistance: "Credit facility as per eligibility",
        tags: "KCC, Farmer Loan, Agriculture, Credit",
        close_date: "As per lender/government rules",
        official_url: "https://www.myscheme.gov.in/",
    },

    {
        id: "mudra",
        scheme_name: "Pradhan Mantri Mudra Yojana",
        short_title: "PMMY / MUDRA",
        brief:
            "Supports micro and small businesses by facilitating institutional credit for eligible non-corporate and non-farm enterprises.",
        level: "Central Government",
        ministry: "Ministry of Finance",
        beneficiary_state: "All India",
        categories: "Business, MSME, Loan",
        scheme_for: "Micro and small business entrepreneurs",
        assistance: "Loans under Shishu, Kishor and Tarun categories",
        tags: "Business Loan, MSME, MUDRA, Entrepreneur",
        close_date: "As per scheme and lender guidelines",
        official_url: "https://www.mudra.org.in/",
    },

    {
        id: "stand-up-india",
        scheme_name: "Stand-Up India",
        short_title: "Stand-Up India",
        brief:
            "Facilitates bank loans to eligible entrepreneurs for setting up greenfield enterprises.",
        level: "Central Government",
        ministry: "Ministry of Finance",
        beneficiary_state: "All India",
        categories: "Business, Entrepreneurship, Loan",
        scheme_for: "Eligible SC/ST and women entrepreneurs",
        assistance: "Bank loan support as per eligibility",
        tags: "Women Entrepreneur, SC/ST, Business, Loan",
        close_date: "As per scheme guidelines",
        official_url: "https://www.standupmitra.in/",
    },

    {
        id: "pmegp",
        scheme_name: "Prime Minister's Employment Generation Programme",
        short_title: "PMEGP",
        brief:
            "Promotes self-employment by supporting eligible new micro-enterprises through credit-linked subsidy.",
        level: "Central Government",
        ministry: "Ministry of Micro, Small & Medium Enterprises",
        beneficiary_state: "All India",
        categories: "MSME, Business, Employment",
        scheme_for: "Eligible individuals and micro-enterprise applicants",
        assistance: "Credit-linked margin money subsidy",
        tags: "MSME, Employment, Startup, Subsidy",
        close_date: "As per application portal guidelines",
        official_url:
            "https://www.kviconline.gov.in/pmegpeportal/",
    },

    {
        id: "pm-svanidhi",
        scheme_name: "PM SVANidhi",
        short_title: "PM Street Vendor's AtmaNirbhar Nidhi",
        brief:
            "Provides working-capital support to eligible street vendors to help restart and strengthen their businesses.",
        level: "Central Government",
        ministry: "Ministry of Housing & Urban Affairs",
        beneficiary_state: "All India",
        categories: "Business, Street Vendors, Loan",
        scheme_for: "Eligible street vendors",
        assistance: "Working-capital loan as per current guidelines",
        tags: "Street Vendor, Business Loan, Working Capital",
        close_date: "As per scheme guidelines",
        official_url: "https://pmsvanidhi.mohua.gov.in/",
    },

    {
        id: "aif",
        scheme_name: "Agriculture Infrastructure Fund",
        short_title: "AIF",
        brief:
            "Supports investment in agriculture infrastructure and post-harvest management projects through financing facilities.",
        level: "Central Government",
        ministry: "Ministry of Agriculture & Farmers Welfare",
        beneficiary_state: "All India",
        categories: "Agriculture, Infrastructure, Credit",
        scheme_for:
            "Eligible farmers, agri-entrepreneurs, FPOs and other beneficiaries",
        assistance: "Financing support as per scheme guidelines",
        tags: "Infrastructure, Agriculture, FPO, Credit",
        close_date: "As per current scheme guidelines",
        official_url: "https://agriinfra.dac.gov.in/",
    },

    {
        id: "livestock-mission",
        scheme_name: "National Livestock Mission",
        short_title: "NLM",
        brief:
            "Promotes employment and entrepreneurship in livestock, poultry, sheep, goat and related activities.",
        level: "Central Government",
        ministry: "Department of Animal Husbandry & Dairying",
        beneficiary_state: "All India",
        categories: "Agriculture, Livestock, Entrepreneurship",
        scheme_for:
            "Eligible individuals, entrepreneurs, groups and organisations",
        assistance: "Support/subsidy as per component and eligibility",
        tags: "Livestock, Dairy, Poultry, Entrepreneurship",
        close_date: "As per current guidelines",
        official_url: "https://nlm.udyamimitra.in/",
    },

    {
        id: "pmfme",
        scheme_name: "PM Formalisation of Micro Food Processing Enterprises",
        short_title: "PMFME",
        brief:
            "Supports formalisation and upgradation of eligible micro food-processing enterprises.",
        level: "Central Government",
        ministry: "Ministry of Food Processing Industries",
        beneficiary_state: "All India",
        categories: "Food Processing, MSME, Business",
        scheme_for: "Eligible micro food-processing enterprises",
        assistance: "Financial support as per scheme guidelines",
        tags: "Food Processing, MSME, Business, Subsidy",
        close_date: "As per current guidelines",
        official_url: "https://pmfme.mofpi.gov.in/",
    },

    {
        id: "nsic",
        scheme_name: "NSIC Support Services",
        short_title: "NSIC",
        brief:
            "Provides support services to micro and small enterprises in areas such as marketing, credit facilitation and technology.",
        level: "Central Government",
        ministry: "Ministry of Micro, Small & Medium Enterprises",
        beneficiary_state: "All India",
        categories: "MSME, Business",
        scheme_for: "Micro and small enterprises",
        assistance: "Support services as per applicable programme",
        tags: "MSME, Marketing, Credit, Business",
        close_date: "As per programme guidelines",
        official_url: "https://www.nsic.co.in/",
    },

    {
        id: "mudra-shishu",
        scheme_name: "MUDRA Shishu",
        short_title: "Shishu Loan",
        brief:
            "A MUDRA loan category intended for very small businesses at the initial stage of their business journey.",
        level: "Central Government",
        ministry: "Ministry of Finance",
        beneficiary_state: "All India",
        categories: "Business, Loan, MSME",
        scheme_for: "Eligible micro and small business owners",
        assistance: "Loan support up to the applicable Shishu limit",
        tags: "Small Business, MUDRA, Startup, Loan",
        close_date: "As per lender guidelines",
        official_url: "https://www.mudra.org.in/",
    },

    {
        id: "pm-fasal-bima",
        scheme_name: "Pradhan Mantri Fasal Bima Yojana",
        short_title: "PMFBY",
        brief:
            "Provides crop insurance support to eligible farmers against specified crop losses and risks.",
        level: "Central Government",
        ministry: "Ministry of Agriculture & Farmers Welfare",
        beneficiary_state: "All India",
        categories: "Agriculture, Insurance",
        scheme_for: "Eligible farmers",
        assistance:
            "Crop insurance coverage as per notified crops and terms",
        tags: "Crop Insurance, Farmer, Agriculture, Risk Protection",
        close_date: "Season and state specific",
        official_url: "https://pmfby.gov.in/",
    },

    {
        id: "pm-kusum",
        scheme_name: "PM-KUSUM",
        short_title:
            "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan",
        brief:
            "Promotes the use of solar energy in agriculture through support for solar pumps and other renewable-energy applications.",
        level: "Central Government",
        ministry: "Ministry of New and Renewable Energy",
        beneficiary_state: "All India",
        categories: "Agriculture, Solar, Energy",
        scheme_for:
            "Eligible farmers, farmer groups and other approved beneficiaries",
        assistance: "Support as per component and applicable guidelines",
        tags: "Solar, Farmer, Renewable Energy, Agriculture",
        close_date: "As per current guidelines",
        official_url: "https://pmkusum.mnre.gov.in/",
    },

    {
        id: "pmay",
        scheme_name: "Pradhan Mantri Awas Yojana",
        short_title: "PMAY",
        brief:
            "Supports eligible beneficiaries in accessing housing assistance under applicable rural or urban housing components.",
        level: "Central Government",
        ministry: "Ministry of Housing & Urban Affairs",
        beneficiary_state: "All India",
        categories: "Housing, Welfare",
        scheme_for: "Eligible households",
        assistance: "Housing assistance as per applicable component",
        tags: "Housing, Welfare, Home, Government",
        close_date: "As per current guidelines",
        official_url: "https://pmaymis.gov.in/",
    },

    {
        id: "pmjjby",
        scheme_name: "Pradhan Mantri Jeevan Jyoti Bima Yojana",
        short_title: "PMJJBY",
        brief:
            "Provides life insurance coverage to eligible subscribers under the government-backed insurance scheme.",
        level: "Central Government",
        ministry: "Ministry of Finance",
        beneficiary_state: "All India",
        categories: "Insurance, Social Security",
        scheme_for: "Eligible bank account holders",
        assistance: "Life insurance coverage as per scheme terms",
        tags: "Insurance, Life Cover, Social Security",
        close_date: "Renewal based on scheme rules",
        official_url: "https://financialservices.gov.in/",
    },

    {
        id: "pmsby",
        scheme_name: "Pradhan Mantri Suraksha Bima Yojana",
        short_title: "PMSBY",
        brief:
            "Provides accident insurance coverage to eligible subscribers at an affordable premium.",
        level: "Central Government",
        ministry: "Ministry of Finance",
        beneficiary_state: "All India",
        categories: "Insurance, Social Security",
        scheme_for: "Eligible bank account holders",
        assistance: "Accident insurance coverage as per scheme terms",
        tags: "Accident Insurance, Social Security, Insurance",
        close_date: "Renewal based on scheme rules",
        official_url: "https://financialservices.gov.in/",
    },

    {
        id: "atal-pension",
        scheme_name: "Atal Pension Yojana",
        short_title: "APY",
        brief:
            "Provides a pension-focused social security option for eligible subscribers.",
        level: "Central Government",
        ministry: "Ministry of Finance",
        beneficiary_state: "All India",
        categories: "Pension, Social Security",
        scheme_for: "Eligible Indian citizens",
        assistance:
            "Pension benefits based on contribution and applicable rules",
        tags: "Pension, Retirement, Social Security",
        close_date: "As per scheme rules",
        official_url: "https://financialservices.gov.in/",
    },
];

/* =========================================================
   HELPERS
   ========================================================= */

const getTags = (tags) => {
    if (!tags) return [];

    return String(tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 4);
};

const getCategory = (categories) => {
    if (!categories) return "Government Scheme";

    return (
        String(categories).split(",")[0].trim() ||
        "Government Scheme"
    );
};

/* =========================================================
   COMPONENT
   ========================================================= */

const GovernmentSchemes = ({ onBack }) => {
    const [search, setSearch] = useState("");
    const [level, setLevel] = useState("");
    const [state, setState] = useState("");
    const [category, setCategory] = useState("");
    const [selectedScheme, setSelectedScheme] = useState(null);

    /* =====================================================
       STATE OPTIONS
       ===================================================== */

    const stateOptions = useMemo(() => {
        const states = SCHEMES_DATA.map(
            (scheme) => scheme.beneficiary_state
        )
            .filter(Boolean)
            .flatMap((item) =>
                String(item)
                    .split(",")
                    .map((value) => value.trim())
            );

        return [...new Set(states)]
            .filter(
                (item) =>
                    item &&
                    item.toLowerCase() !== "all"
            )
            .sort();
    }, []);

    /* =====================================================
       CATEGORY OPTIONS
       ===================================================== */

    const categoryOptions = useMemo(() => {
        const categories = SCHEMES_DATA.map(
            (scheme) => scheme.categories
        )
            .filter(Boolean)
            .flatMap((item) =>
                String(item)
                    .split(",")
                    .map((value) => value.trim())
            );

        return [...new Set(categories)]
            .filter(Boolean)
            .sort();
    }, []);

    /* =====================================================
       FILTER SCHEMES
       ===================================================== */

    const filteredSchemes = useMemo(() => {
        const query = search.trim().toLowerCase();

        return SCHEMES_DATA.filter((scheme) => {
            const searchableText = [
                scheme.scheme_name,
                scheme.short_title,
                scheme.brief,
                scheme.ministry,
                scheme.beneficiary_state,
                scheme.categories,
                scheme.tags,
                scheme.scheme_for,
                scheme.assistance,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query ||
                searchableText.includes(query);

            const matchesLevel =
                !level ||
                String(scheme.level || "")
                    .toLowerCase()
                    .includes(level.toLowerCase());

            const matchesState =
                !state ||
                String(scheme.beneficiary_state || "")
                    .toLowerCase()
                    .includes(state.toLowerCase());

            const matchesCategory =
                !category ||
                String(scheme.categories || "")
                    .toLowerCase()
                    .includes(category.toLowerCase());

            return (
                matchesSearch &&
                matchesLevel &&
                matchesState &&
                matchesCategory
            );
        });
    }, [search, level, state, category]);

    /* =====================================================
       CLEAR FUNCTIONS
       ===================================================== */

    const clearSearch = () => {
        setSearch("");
    };

    const clearAllFilters = () => {
        setSearch("");
        setLevel("");
        setState("");
        setCategory("");
    };

    /* =====================================================
       MODAL
       ===================================================== */

    const openScheme = (scheme) => {
        setSelectedScheme(scheme);
        document.body.style.overflow = "hidden";
    };

    const closeScheme = () => {
        setSelectedScheme(null);
        document.body.style.overflow = "";
    };

    /* =====================================================
       BACK
       ===================================================== */

    const handleBack = () => {
        document.body.style.overflow = "";

        if (typeof onBack === "function") {
            onBack();
        } else {
            window.history.back();
        }
    };

    /* =====================================================
       OFFICIAL WEBSITE
       ===================================================== */

    const openOfficialPortal = () => {
        if (!selectedScheme?.official_url) return;

        window.open(
            selectedScheme.official_url,
            "_blank",
            "noopener,noreferrer"
        );
    };

    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <div className="government-schemes-page">

            {/* HEADER */}

            <header className="schemes-header">

                <button
                    type="button"
                    className="back-button"
                    onClick={handleBack}
                >
                    <FaArrowLeft />
                    <span>Back</span>
                </button>

                <div className="schemes-header-content">

                    <div className="schemes-header-icon">
                        <FaLandmark />
                    </div>

                    <div>
                        <h1>Government Schemes</h1>

                        <p>
                            Discover government schemes, benefits
                            and opportunities available for farmers
                            and businesses.
                        </p>
                    </div>

                </div>

            </header>

            {/* MAIN */}

            <main className="schemes-main">

                {/* INTRO */}

                <section className="schemes-intro">

                    <div>

                        <span className="intro-badge">
                            <FaLandmark />
                            Government of India
                        </span>

                        <h2>
                            Explore Government Schemes
                        </h2>

                        <p>
                            Find schemes by name, state, category
                            and government level.
                        </p>

                    </div>

                    <div className="scheme-count">

                        <strong>
                            {filteredSchemes.length}
                        </strong>

                        <span>
                            Schemes Available
                        </span>

                    </div>

                </section>

                {/* SEARCH + FILTER */}

                <section className="scheme-search-section">

                    <div className="search-box">

                        <FaSearch />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search schemes like PM-KISAN, Mudra, pension..."
                            autoComplete="off"
                            spellCheck="false"
                        />

                        {search && (
                            <button
                                type="button"
                                className="clear-search"
                                onClick={clearSearch}
                                aria-label="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}

                    </div>

                    <div className="filter-box">

                        <FaFilter />

                        {/* LEVEL */}

                        <select
                            value={level}
                            onChange={(e) =>
                                setLevel(e.target.value)
                            }
                        >
                            <option value="">
                                All Levels
                            </option>

                            <option value="Central Government">
                                Central Government
                            </option>

                            <option value="State Government">
                                State Government
                            </option>
                        </select>

                        {/* STATE */}

                        <select
                            value={state}
                            onChange={(e) =>
                                setState(e.target.value)
                            }
                        >
                            <option value="">
                                All States
                            </option>

                            {stateOptions.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>

                        {/* CATEGORY */}

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                        >
                            <option value="">
                                All Categories
                            </option>

                            {categoryOptions.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>

                    </div>

                </section>

                {/* ACTIVE FILTERS */}

                {(search ||
                    level ||
                    state ||
                    category) && (

                        <div className="active-filters">

                            <span>
                                Active filters:
                            </span>

                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                >
                                    Search: {search}
                                    <FaTimes />
                                </button>
                            )}

                            {level && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLevel("")
                                    }
                                >
                                    Level: {level}
                                    <FaTimes />
                                </button>
                            )}

                            {state && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setState("")
                                    }
                                >
                                    State: {state}
                                    <FaTimes />
                                </button>
                            )}

                            {category && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCategory("")
                                    }
                                >
                                    Category: {category}
                                    <FaTimes />
                                </button>
                            )}

                            <button
                                type="button"
                                className="clear-all"
                                onClick={clearAllFilters}
                            >
                                Clear all
                            </button>

                        </div>
                    )}

                {/* NO RESULTS */}

                {filteredSchemes.length === 0 && (

                    <div className="no-schemes">

                        <div className="no-schemes-icon">
                            <FaSearch />
                        </div>

                        <h3>
                            No Government Schemes Found
                        </h3>

                        <p>
                            Try another search term or remove
                            some filters.
                        </p>

                        <button
                            type="button"
                            onClick={clearAllFilters}
                        >
                            Clear Filters
                        </button>

                    </div>
                )}

                {/* SCHEME CARDS */}

                {filteredSchemes.length > 0 && (

                    <section className="schemes-grid">

                        {filteredSchemes.map((scheme) => {

                            const tags = getTags(
                                scheme.tags
                            );

                            return (

                                <article
                                    className="scheme-card"
                                    key={scheme.id}
                                >

                                    {/* IMAGE / ICON AREA */}

                                    <div className="scheme-image-wrapper">

                                        <div className="scheme-image-placeholder">

                                            <FaLandmark />

                                            <span>
                                                GOVERNMENT SCHEME
                                            </span>

                                        </div>

                                    </div>

                                    {/* CARD TOP */}

                                    <div className="scheme-card-top">

                                        <div className="scheme-icon">
                                            <FaLandmark />
                                        </div>

                                        <span className="scheme-category">
                                            {getCategory(
                                                scheme.categories
                                            )}
                                        </span>

                                    </div>

                                    {/* TITLE */}

                                    <h3>
                                        {scheme.scheme_name ||
                                            scheme.short_title ||
                                            "Government Scheme"}
                                    </h3>

                                    {/* DESCRIPTION */}

                                    <p className="scheme-description">
                                        {scheme.brief ||
                                            "Government scheme details and benefits are available through the scheme information portal."}
                                    </p>

                                    {/* ASSISTANCE */}

                                    <div className="scheme-assistance">

                                        <div>

                                            <span>
                                                Financial / Scheme Support
                                            </span>

                                            <strong>
                                                {scheme.assistance ||
                                                    "As per eligibility"}
                                            </strong>

                                        </div>

                                        <FaBuilding />

                                    </div>

                                    {/* TAGS */}

                                    {tags.length > 0 && (

                                        <div className="scheme-preview">

                                            <strong>
                                                Popular Tags
                                            </strong>

                                            <ul>

                                                {tags.map(
                                                    (tag, tagIndex) => (

                                                        <li
                                                            key={`${tag}-${tagIndex}`}
                                                        >
                                                            <FaCheckCircle />

                                                            <span>
                                                                {tag}
                                                            </span>
                                                        </li>

                                                    )
                                                )}

                                            </ul>

                                        </div>

                                    )}

                                    {/* ELIGIBILITY */}

                                    <div className="scheme-eligibility">

                                        <FaMapMarkerAlt />

                                        <span>
                                            {scheme.beneficiary_state
                                                ? `Available for: ${scheme.beneficiary_state}`
                                                : "Check beneficiary eligibility"}
                                        </span>

                                    </div>

                                    {/* VIEW DETAILS */}

                                    <button
                                        type="button"
                                        className="view-scheme-btn"
                                        onClick={() =>
                                            openScheme(scheme)
                                        }
                                    >

                                        <span>
                                            View Scheme Details
                                        </span>

                                        <span>
                                            <FaArrowRight />
                                        </span>

                                    </button>

                                </article>

                            );
                        })}

                    </section>

                )}

            </main>

            {/* MODAL */}

            {selectedScheme && (

                <div
                    className="scheme-modal-overlay"
                    onClick={(e) => {

                        if (
                            e.target === e.currentTarget
                        ) {
                            closeScheme();
                        }

                    }}
                >

                    <div className="scheme-modal">

                        {/* CLOSE */}

                        <button
                            type="button"
                            className="modal-close"
                            onClick={closeScheme}
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>

                        {/* ICON */}

                        <div className="modal-icon">
                            <FaLandmark />
                        </div>

                        {/* TITLE */}

                        <h2>
                            {selectedScheme.scheme_name ||
                                selectedScheme.short_title ||
                                "Government Scheme"}
                        </h2>

                        {/* SHORT TITLE */}

                        {selectedScheme.short_title && (

                            <div className="modal-short-title">
                                {selectedScheme.short_title}
                            </div>

                        )}

                        {/* DESCRIPTION */}

                        <p className="modal-description">
                            {selectedScheme.brief ||
                                "Detailed information about this government scheme is available through the official scheme information source."}
                        </p>

                        {/* INFORMATION */}

                        <div className="modal-section">

                            <h3>
                                Scheme Information
                            </h3>

                            <ul className="modal-list">

                                <li>

                                    <FaBuilding />

                                    <span>
                                        <strong>
                                            Government Level:
                                        </strong>{" "}
                                        {selectedScheme.level ||
                                            "Not specified"}
                                    </span>

                                </li>

                                <li>

                                    <FaLandmark />

                                    <span>
                                        <strong>
                                            Ministry:
                                        </strong>{" "}
                                        {selectedScheme.ministry ||
                                            "Not specified"}
                                    </span>

                                </li>

                                <li>

                                    <FaMapMarkerAlt />

                                    <span>
                                        <strong>
                                            Beneficiary State:
                                        </strong>{" "}
                                        {selectedScheme.beneficiary_state ||
                                            "All India"}
                                    </span>

                                </li>

                                <li>

                                    <FaLayerGroup />

                                    <span>
                                        <strong>
                                            Category:
                                        </strong>{" "}
                                        {selectedScheme.categories ||
                                            "Not specified"}
                                    </span>

                                </li>

                                {selectedScheme.scheme_for && (

                                    <li>

                                        <FaInfoCircle />

                                        <span>
                                            <strong>
                                                Scheme For:
                                            </strong>{" "}
                                            {selectedScheme.scheme_for}
                                        </span>

                                    </li>

                                )}

                                {selectedScheme.close_date && (

                                    <li>

                                        <FaCalendarAlt />

                                        <span>
                                            <strong>
                                                Application / Validity:
                                            </strong>{" "}
                                            {selectedScheme.close_date}
                                        </span>

                                    </li>

                                )}

                            </ul>

                        </div>

                        {/* TAGS */}

                        {selectedScheme.tags && (

                            <div className="modal-section">

                                <h3>
                                    Scheme Tags
                                </h3>

                                <div className="modal-tags">

                                    {getTags(
                                        selectedScheme.tags
                                    ).map(
                                        (tag, index) => (

                                            <span
                                                key={`${tag}-${index}`}
                                            >
                                                <FaTag />
                                                {tag}
                                            </span>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                        {/* ASSISTANCE */}

                        <div className="modal-assistance">

                            <span>
                                Scheme Support
                            </span>

                            <strong>
                                {selectedScheme.assistance ||
                                    "As per eligibility"}
                            </strong>

                        </div>

                        {/* ACTIONS */}

                        <div className="modal-actions">

                            <button
                                type="button"
                                className="modal-secondary-btn"
                                onClick={closeScheme}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="modal-primary-btn"
                                onClick={openOfficialPortal}
                            >
                                <FaExternalLinkAlt />
                                Official Scheme Portal
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default GovernmentSchemes;