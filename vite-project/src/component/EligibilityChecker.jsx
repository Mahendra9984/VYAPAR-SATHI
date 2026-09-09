import React, { useMemo, useState } from "react";
import "./EligibilityChecker.css";

/*
|--------------------------------------------------------------------------
| GOVERNMENT SCHEME ELIGIBILITY CHECKER
|--------------------------------------------------------------------------
| Static frontend version.
| No external API required.
|
| IMPORTANT:
| This is a preliminary eligibility checker.
| Final eligibility is decided by the concerned Government department,
| bank, lender or official scheme portal.
|--------------------------------------------------------------------------
*/

const SCHEMES = [
    {
        id: "pm-kisan",
        name: "PM-KISAN",
        title: "Pradhan Mantri Kisan Samman Nidhi",
        icon: "🌾",
        category: "Agriculture",
        support: "₹6,000 per year",
        description:
            "Income support for eligible landholding farmer families.",
        officialUrl: "https://pmkisan.gov.in/",
    },

    {
        id: "kcc",
        name: "Kisan Credit Card",
        title: "KCC",
        icon: "💳",
        category: "Agriculture",
        support: "Agricultural credit facility",
        description:
            "Credit support for farmers for cultivation and related agricultural needs.",
        officialUrl: "https://www.myscheme.gov.in/",
    },

    {
        id: "mudra",
        name: "Pradhan Mantri Mudra Yojana",
        title: "PMMY / MUDRA",
        icon: "🏪",
        category: "Business",
        support: "Business loan support",
        description:
            "Institutional credit support for eligible micro and small businesses.",
        officialUrl: "https://www.mudra.org.in/",
    },

    {
        id: "stand-up-india",
        name: "Stand-Up India",
        title: "Stand-Up India",
        icon: "🚀",
        category: "Entrepreneurship",
        support: "Bank loan support",
        description:
            "Loan support for eligible SC/ST and women entrepreneurs establishing greenfield enterprises.",
        officialUrl: "https://www.standupmitra.in/",
    },

    {
        id: "pmegp",
        name: "PMEGP",
        title: "Prime Minister's Employment Generation Programme",
        icon: "🏭",
        category: "MSME",
        support: "Credit-linked subsidy",
        description:
            "Supports eligible new micro-enterprises through credit-linked subsidy.",
        officialUrl:
            "https://www.kviconline.gov.in/pmegpeportal/",
    },

    {
        id: "pm-svanidhi",
        name: "PM SVANidhi",
        title: "PM Street Vendor's AtmaNirbhar Nidhi",
        icon: "🛒",
        category: "Street Vendor",
        support: "Working-capital loan",
        description:
            "Working-capital support for eligible street vendors.",
        officialUrl: "https://pmsvanidhi.mohua.gov.in/",
    },

    {
        id: "aif",
        name: "Agriculture Infrastructure Fund",
        title: "AIF",
        icon: "🏗️",
        category: "Agriculture",
        support: "Financing support",
        description:
            "Financing support for eligible agriculture infrastructure and post-harvest projects.",
        officialUrl: "https://agriinfra.dac.gov.in/",
    },

    {
        id: "nlm",
        name: "National Livestock Mission",
        title: "NLM",
        icon: "🐄",
        category: "Livestock",
        support: "Support / subsidy",
        description:
            "Promotes entrepreneurship and employment in livestock and related activities.",
        officialUrl: "https://nlm.udyamimitra.in/",
    },

    {
        id: "pmfme",
        name: "PMFME",
        title: "PM Formalisation of Micro Food Processing Enterprises",
        icon: "🍅",
        category: "Food Processing",
        support: "Financial support",
        description:
            "Supports eligible micro food-processing enterprises.",
        officialUrl: "https://pmfme.mofpi.gov.in/",
    },

    {
        id: "nsic",
        name: "NSIC Support Services",
        title: "NSIC",
        icon: "🏢",
        category: "MSME",
        support: "Business support services",
        description:
            "Support services for micro and small enterprises including marketing and credit facilitation.",
        officialUrl: "https://www.nsic.co.in/",
    },

    {
        id: "mudra-shishu",
        name: "MUDRA Shishu",
        title: "Shishu Loan",
        icon: "💰",
        category: "Business",
        support: "Small business loan",
        description:
            "MUDRA category intended for very small businesses at the initial stage.",
        officialUrl: "https://www.mudra.org.in/",
    },

    {
        id: "pm-fasal-bima",
        name: "Pradhan Mantri Fasal Bima Yojana",
        title: "PMFBY",
        icon: "🌱",
        category: "Insurance",
        support: "Crop insurance coverage",
        description:
            "Crop insurance support against specified crop losses and risks.",
        officialUrl: "https://pmfby.gov.in/",
    },
];

/*
|--------------------------------------------------------------------------
| ELIGIBILITY RULES
|--------------------------------------------------------------------------
*/

const checkEligibility = (schemeId, data) => {
    const age = Number(data.age);
    const income = Number(data.income);

    const result = {
        eligible: false,
        status: "Not Eligible",
        reason: "",
        matched: [],
        missing: [],
        incomeNote: "",
    };

    switch (schemeId) {
        /*
        |--------------------------------------------------------------------------
        | PM-KISAN
        |--------------------------------------------------------------------------
        */
        case "pm-kisan": {
            if (
                data.occupation === "farmer" &&
                data.landOwnership === "yes"
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You selected farmer occupation and agricultural land ownership, which matches the basic preliminary profile for PM-KISAN.";

                result.matched = [
                    "Farmer",
                    "Agricultural land",
                ];
            } else {
                result.reason =
                    "PM-KISAN is intended for eligible landholding farmer families. Your selected profile does not match the basic preliminary criteria.";

                result.missing = [
                    "Eligible landholding farmer profile",
                ];
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | KCC
        |--------------------------------------------------------------------------
        */
        case "kcc": {
            if (
                data.occupation === "farmer" &&
                data.landOwnership === "yes"
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "Your farmer and agricultural land details match the basic preliminary profile for Kisan Credit Card.";

                result.matched = [
                    "Farmer",
                    "Agricultural land",
                ];
            } else {
                result.reason =
                    "Kisan Credit Card is primarily intended for eligible agricultural borrowers. Select farmer/agricultural activity details to match the basic criteria.";

                result.missing = [
                    "Eligible agricultural activity",
                ];
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | MUDRA + MUDRA SHISHU
        |--------------------------------------------------------------------------
        */
        case "mudra":
        case "mudra-shishu": {
            if (
                data.occupation === "business" ||
                data.business === "yes"
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You indicated business activity, which matches the basic profile for MUDRA business credit.";

                result.matched = [
                    "Business activity",
                    "Micro / small enterprise profile",
                ];
            } else {
                result.reason =
                    "MUDRA is intended for eligible micro and small business activities. A business activity is required for this preliminary check.";

                result.missing = [
                    "Business activity",
                ];
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | STAND-UP INDIA
        |--------------------------------------------------------------------------
        */
        case "stand-up-india": {
            const eligibleCategory =
                data.gender === "female" ||
                data.category === "sc_st";

            if (
                eligibleCategory &&
                data.business === "yes"
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "Your selected profile matches the basic beneficiary category for Stand-Up India and you indicated an enterprise/business.";

                result.matched = [
                    data.gender === "female"
                        ? "Woman entrepreneur"
                        : "SC/ST entrepreneur",
                    "Business / enterprise",
                ];
            } else {
                result.reason =
                    "The basic profile requires a woman entrepreneur or SC/ST entrepreneur and a proposed eligible greenfield enterprise.";

                result.missing = [];

                if (!eligibleCategory) {
                    result.missing.push(
                        "Woman or SC/ST entrepreneur profile"
                    );
                }

                if (data.business !== "yes") {
                    result.missing.push(
                        "Eligible greenfield enterprise"
                    );
                }
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | PMEGP
        |--------------------------------------------------------------------------
        */
        case "pmegp": {
            if (
                age >= 18 &&
                data.business === "yes"
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You meet the basic age requirement and indicated an enterprise/business activity for the preliminary PMEGP check.";

                result.matched = [
                    "Age 18+",
                    "Enterprise activity",
                ];
            } else {
                result.reason =
                    "For this preliminary check, PMEGP requires an adult applicant and an eligible enterprise proposal.";

                result.missing = [];

                if (age < 18) {
                    result.missing.push(
                        "Age 18 or above"
                    );
                }

                if (data.business !== "yes") {
                    result.missing.push(
                        "Enterprise proposal"
                    );
                }
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | PM SVANIDHI
        |--------------------------------------------------------------------------
        */
        case "pm-svanidhi": {
            if (
                data.streetVendor === "yes" &&
                age >= 18
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You indicated that you are a street vendor and are 18 or older.";

                result.matched = [
                    "Street vendor",
                    "Age 18+",
                ];
            } else {
                result.reason =
                    "PM SVANidhi is intended for eligible street vendors. Your selected profile does not meet the basic preliminary check.";

                result.missing = [];

                if (data.streetVendor !== "yes") {
                    result.missing.push(
                        "Street vendor activity"
                    );
                }

                if (age < 18) {
                    result.missing.push(
                        "Age 18 or above"
                    );
                }
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | AGRICULTURE INFRASTRUCTURE FUND
        |--------------------------------------------------------------------------
        */
        case "aif": {
            if (
                data.occupation === "farmer" ||
                data.agriInfrastructure === "yes"
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "Your agricultural activity or agriculture-infrastructure interest matches the basic purpose of the Agriculture Infrastructure Fund.";

                result.matched = [
                    "Agriculture / infrastructure activity",
                ];
            } else {
                result.reason =
                    "AIF is intended for eligible agriculture infrastructure and post-harvest projects.";

                result.missing = [
                    "Agriculture infrastructure activity",
                ];
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | NATIONAL LIVESTOCK MISSION
        |--------------------------------------------------------------------------
        */
        case "nlm": {
            if (data.livestock === "yes") {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You indicated livestock-related activity, which matches the basic purpose of the National Livestock Mission.";

                result.matched = [
                    "Livestock activity",
                ];
            } else {
                result.reason =
                    "NLM supports eligible livestock, poultry, sheep, goat and related entrepreneurial activities.";

                result.missing = [
                    "Livestock-related activity",
                ];
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | PMFME
        |--------------------------------------------------------------------------
        */
        case "pmfme": {
            if (
                data.foodProcessing === "yes" &&
                age >= 18
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You indicated food-processing activity and are 18 or older.";

                result.matched = [
                    "Food-processing activity",
                    "Age 18+",
                ];
            } else {
                result.reason =
                    "PMFME is intended for eligible micro food-processing enterprises.";

                result.missing = [];

                if (data.foodProcessing !== "yes") {
                    result.missing.push(
                        "Food-processing enterprise"
                    );
                }

                if (age < 18) {
                    result.missing.push(
                        "Age 18 or above"
                    );
                }
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | NSIC
        |--------------------------------------------------------------------------
        */
        case "nsic": {
            if (
                data.business === "yes" &&
                age >= 18
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You indicated an active business/enterprise and meet the basic adult-applicant condition for this preliminary check.";

                result.matched = [
                    "Business / MSME activity",
                    "Age 18+",
                ];
            } else {
                result.reason =
                    "NSIC support services are intended for micro and small enterprises.";

                result.missing = [];

                if (data.business !== "yes") {
                    result.missing.push(
                        "Micro / small enterprise activity"
                    );
                }

                if (age < 18) {
                    result.missing.push(
                        "Age 18 or above"
                    );
                }
            }

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | PM FASAL BIMA YOJANA
        |--------------------------------------------------------------------------
        */
        case "pm-fasal-bima": {
            if (
                data.occupation === "farmer" &&
                data.crop === "yes"
            ) {
                result.eligible = true;
                result.status = "Likely Eligible";

                result.reason =
                    "You indicated farming and crop cultivation, matching the basic preliminary purpose of PMFBY.";

                result.matched = [
                    "Farmer",
                    "Crop cultivation",
                ];
            } else {
                result.reason =
                    "PMFBY is intended for eligible farmers and notified crops under applicable season/state terms.";

                result.missing = [];

                if (data.occupation !== "farmer") {
                    result.missing.push(
                        "Farmer profile"
                    );
                }

                if (data.crop !== "yes") {
                    result.missing.push(
                        "Crop cultivation"
                    );
                }
            }

            break;
        }

        default: {
            result.reason =
                "No eligibility rule is available for this scheme.";

            break;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | INCOME INFORMATION
    |--------------------------------------------------------------------------
    | Income is displayed as additional information rather than being used
    | as a universal exclusion because income limits vary by scheme,
    | component and category.
    |--------------------------------------------------------------------------
    */

    if (income > 0) {
        result.incomeNote =
            `Declared annual income: ₹${income.toLocaleString("en-IN")}`;
    }

    return result;
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

const EligibilityChecker = ({ onBack }) => {
    const initialForm = {
        age: "",
        state: "",
        occupation: "",
        income: "",
        category: "",
        gender: "",
        landOwnership: "",
        business: "",
        streetVendor: "",
        agriInfrastructure: "",
        livestock: "",
        foodProcessing: "",
        crop: "",
    };

    const [form, setForm] = useState(initialForm);

    const [checked, setChecked] = useState(false);

    const [selectedScheme, setSelectedScheme] =
        useState("");

    const [showOnlyEligible, setShowOnlyEligible] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | UPDATE FIELD
    |--------------------------------------------------------------------------
    */

    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setChecked(false);

        setSelectedScheme("");

        setShowOnlyEligible(false);
    };

    /*
    |--------------------------------------------------------------------------
    | RESULTS
    |--------------------------------------------------------------------------
    */

    const results = useMemo(() => {
        if (!checked) {
            return [];
        }

        return SCHEMES.map((scheme) => ({
            scheme,
            result: checkEligibility(
                scheme.id,
                form
            ),
        }));
    }, [checked, form]);

    /*
    |--------------------------------------------------------------------------
    | FILTERED RESULTS
    |--------------------------------------------------------------------------
    */

    const visibleResults = useMemo(() => {
        let data = results;

        if (selectedScheme) {
            data = data.filter(
                (item) =>
                    item.scheme.id === selectedScheme
            );
        }

        if (showOnlyEligible) {
            data = data.filter(
                (item) =>
                    item.result.eligible
            );
        }

        return data;
    }, [
        results,
        selectedScheme,
        showOnlyEligible,
    ]);

    /*
    |--------------------------------------------------------------------------
    | ELIGIBLE COUNT
    |--------------------------------------------------------------------------
    */

    const eligibleCount = results.filter(
        (item) =>
            item.result.eligible
    ).length;

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event) => {
        event.preventDefault();

        const age = Number(form.age);

        if (!form.age || !form.occupation) {
            alert(
                "Please enter your age and occupation."
            );
            return;
        }

        if (
            Number.isNaN(age) ||
            age < 1 ||
            age > 120
        ) {
            alert(
                "Please enter a valid age between 1 and 120."
            );
            return;
        }

        setChecked(true);

        setTimeout(() => {
            const resultsSection =
                document.querySelector(
                    ".eligibility-results"
                );

            if (resultsSection) {
                resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 100);
    };

    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    const resetForm = () => {
        setForm(initialForm);

        setChecked(false);

        setSelectedScheme("");

        setShowOnlyEligible(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /*
    |--------------------------------------------------------------------------
    | BACK
    |--------------------------------------------------------------------------
    */

    const handleBack = () => {
        if (typeof onBack === "function") {
            onBack();
        } else {
            window.history.back();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="eligibility-page">

            {/* HEADER */}

            <header className="eligibility-header">

                <button
                    type="button"
                    className="eligibility-back"
                    onClick={handleBack}
                >
                    ← Back
                </button>

                <div className="eligibility-header-content">

                    <div className="eligibility-header-icon">
                        ✓
                    </div>

                    <div>
                        <h1>
                            Government Scheme Eligibility Checker
                        </h1>

                        <p>
                            Check your preliminary eligibility
                            for government schemes in one place.
                        </p>
                    </div>

                </div>
            </header>

            <main className="eligibility-container">

                {/* INTRO */}

                <section className="eligibility-intro">

                    <div>

                        <span className="eligibility-badge">
                            Government of India Schemes
                        </span>

                        <h2>
                            Check Your Eligibility
                        </h2>

                        <p>
                            Enter your basic details and we
                            will compare your profile with the
                            eligibility rules of the schemes
                            available on this page.
                        </p>

                    </div>

                    <div className="eligibility-stat">

                        <strong>
                            {SCHEMES.length}
                        </strong>

                        <span>
                            Schemes Checked
                        </span>

                    </div>

                </section>

                {/* FORM */}

                <section className="eligibility-form-card">

                    <div className="section-heading">

                        <h2>
                            Your Basic Details
                        </h2>

                        <p>
                            Fill in the information below to
                            get scheme recommendations.
                        </p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            {/* AGE */}

                            <div className="form-group">

                                <label>
                                    Age <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={form.age}
                                    onChange={(e) =>
                                        updateField(
                                            "age",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your age"
                                    required
                                />

                            </div>

                            {/* STATE */}

                            <div className="form-group">

                                <label>
                                    State
                                </label>

                                <select
                                    value={form.state}
                                    onChange={(e) =>
                                        updateField(
                                            "state",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select State
                                    </option>

                                    <option value="Uttar Pradesh">
                                        Uttar Pradesh
                                    </option>

                                    <option value="Bihar">
                                        Bihar
                                    </option>

                                    <option value="Madhya Pradesh">
                                        Madhya Pradesh
                                    </option>

                                    <option value="Rajasthan">
                                        Rajasthan
                                    </option>

                                    <option value="Delhi">
                                        Delhi
                                    </option>

                                    <option value="Maharashtra">
                                        Maharashtra
                                    </option>

                                    <option value="Gujarat">
                                        Gujarat
                                    </option>

                                    <option value="Haryana">
                                        Haryana
                                    </option>

                                    <option value="Punjab">
                                        Punjab
                                    </option>

                                    <option value="Uttarakhand">
                                        Uttarakhand
                                    </option>

                                    <option value="West Bengal">
                                        West Bengal
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* OCCUPATION */}

                            <div className="form-group">

                                <label>
                                    Occupation <span>*</span>
                                </label>

                                <select
                                    value={form.occupation}
                                    onChange={(e) =>
                                        updateField(
                                            "occupation",
                                            e.target.value
                                        )
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Occupation
                                    </option>

                                    <option value="farmer">
                                        Farmer
                                    </option>

                                    <option value="business">
                                        Business Owner
                                    </option>

                                    <option value="student">
                                        Student
                                    </option>

                                    <option value="employee">
                                        Salaried / Employee
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* INCOME */}

                            <div className="form-group">

                                <label>
                                    Annual Income
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.income}
                                    onChange={(e) =>
                                        updateField(
                                            "income",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: 250000"
                                />

                            </div>

                            {/* GENDER */}

                            <div className="form-group">

                                <label>
                                    Gender
                                </label>

                                <select
                                    value={form.gender}
                                    onChange={(e) =>
                                        updateField(
                                            "gender",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="male">
                                        Male
                                    </option>

                                    <option value="female">
                                        Female
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* CATEGORY */}

                            <div className="form-group">

                                <label>
                                    Category
                                </label>

                                <select
                                    value={form.category}
                                    onChange={(e) =>
                                        updateField(
                                            "category",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="general">
                                        General
                                    </option>

                                    <option value="obc">
                                        OBC
                                    </option>

                                    <option value="sc_st">
                                        SC / ST
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* LAND */}

                            <div className="form-group">

                                <label>
                                    Do you own / cultivate
                                    agricultural land?
                                </label>

                                <select
                                    value={form.landOwnership}
                                    onChange={(e) =>
                                        updateField(
                                            "landOwnership",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="yes">
                                        Yes
                                    </option>

                                    <option value="no">
                                        No
                                    </option>

                                </select>

                            </div>

                            {/* BUSINESS */}

                            <div className="form-group">

                                <label>
                                    Do you have / plan an eligible
                                    business or enterprise?
                                </label>

                                <select
                                    value={form.business}
                                    onChange={(e) =>
                                        updateField(
                                            "business",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="yes">
                                        Yes
                                    </option>

                                    <option value="no">
                                        No
                                    </option>

                                </select>

                            </div>

                            {/* STREET VENDOR */}

                            <div className="form-group">

                                <label>
                                    Are you a street vendor?
                                </label>

                                <select
                                    value={form.streetVendor}
                                    onChange={(e) =>
                                        updateField(
                                            "streetVendor",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="yes">
                                        Yes
                                    </option>

                                    <option value="no">
                                        No
                                    </option>

                                </select>

                            </div>

                            {/* AGRICULTURE INFRASTRUCTURE */}

                            <div className="form-group">

                                <label>
                                    Interested in agriculture
                                    infrastructure?
                                </label>

                                <select
                                    value={form.agriInfrastructure}
                                    onChange={(e) =>
                                        updateField(
                                            "agriInfrastructure",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="yes">
                                        Yes
                                    </option>

                                    <option value="no">
                                        No
                                    </option>

                                </select>

                            </div>

                            {/* LIVESTOCK */}

                            <div className="form-group">

                                <label>
                                    Do you have livestock activity?
                                </label>

                                <select
                                    value={form.livestock}
                                    onChange={(e) =>
                                        updateField(
                                            "livestock",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="yes">
                                        Yes
                                    </option>

                                    <option value="no">
                                        No
                                    </option>

                                </select>

                            </div>

                            {/* FOOD PROCESSING */}

                            <div className="form-group">

                                <label>
                                    Do you run / plan food processing?
                                </label>

                                <select
                                    value={form.foodProcessing}
                                    onChange={(e) =>
                                        updateField(
                                            "foodProcessing",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="yes">
                                        Yes
                                    </option>

                                    <option value="no">
                                        No
                                    </option>

                                </select>

                            </div>

                            {/* CROP */}

                            <div className="form-group">

                                <label>
                                    Do you cultivate crops?
                                </label>

                                <select
                                    value={form.crop}
                                    onChange={(e) =>
                                        updateField(
                                            "crop",
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="yes">
                                        Yes
                                    </option>

                                    <option value="no">
                                        No
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* FORM ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="reset-btn"
                                onClick={resetForm}
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                className="check-btn"
                            >
                                Check Eligibility →
                            </button>

                        </div>

                    </form>

                </section>

                {/* RESULTS */}

                {checked && (
                    <section className="eligibility-results">

                        {/* RESULTS HEADER */}

                        <div className="results-header">

                            <div>

                                <span className="results-badge">
                                    Eligibility Results
                                </span>

                                <h2>
                                    You may qualify for{" "}

                                    <strong>
                                        {eligibleCount}
                                    </strong>{" "}

                                    scheme
                                    {eligibleCount !== 1
                                        ? "s"
                                        : ""}
                                </h2>

                            </div>

                            <div className="result-controls">

                                <select
                                    value={selectedScheme}
                                    onChange={(e) =>
                                        setSelectedScheme(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Schemes
                                    </option>

                                    {SCHEMES.map(
                                        (scheme) => (
                                            <option
                                                key={scheme.id}
                                                value={scheme.id}
                                            >
                                                {scheme.name}
                                            </option>
                                        )
                                    )}

                                </select>

                                <button
                                    type="button"
                                    className={
                                        showOnlyEligible
                                            ? "filter-active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setShowOnlyEligible(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                >
                                    {showOnlyEligible
                                        ? "Showing Eligible"
                                        : "Show Eligible Only"}
                                </button>

                            </div>

                        </div>

                        {/* RESULTS GRID */}

                        <div className="results-grid">

                            {visibleResults.length === 0 ? (
                                <div className="no-result">

                                    <div>
                                        🔎
                                    </div>

                                    <h3>
                                        No matching schemes
                                    </h3>

                                    <p>
                                        Try changing your
                                        details or turn off
                                        the eligible-only filter.
                                    </p>

                                </div>
                            ) : (
                                visibleResults.map(
                                    ({
                                        scheme,
                                        result,
                                    }) => (

                                        <article
                                            className={`result-card ${
                                                result.eligible
                                                    ? "eligible"
                                                    : "not-eligible"
                                            }`}
                                            key={scheme.id}
                                        >

                                            {/* CARD TOP */}

                                            <div className="result-top">

                                                <div className="result-icon">
                                                    {scheme.icon}
                                                </div>

                                                <div>

                                                    <h3>
                                                        {scheme.name}
                                                    </h3>

                                                    <p>
                                                        {scheme.title}
                                                    </p>

                                                </div>

                                            </div>

                                            {/* STATUS */}

                                            <div
                                                className={`status ${
                                                    result.eligible
                                                        ? "status-eligible"
                                                        : "status-not"
                                                }`}
                                            >
                                                {result.eligible
                                                    ? "✓ Likely Eligible"
                                                    : "✕ Not Eligible"}
                                            </div>

                                            {/* DESCRIPTION */}

                                            <p className="result-reason">
                                                {result.reason}
                                            </p>

                                            {/* MATCHED CRITERIA */}

                                            {result.matched.length >
                                                0 && (
                                                <div className="criteria-box matched-box">

                                                    <strong>
                                                        Matched criteria
                                                    </strong>

                                                    <ul>
                                                        {result.matched.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        index
                                                                    }
                                                                >
                                                                    ✓{" "}
                                                                    {item}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>

                                                </div>
                                            )}

                                            {/* MISSING CRITERIA */}

                                            {result.missing.length >
                                                0 && (
                                                <div className="criteria-box missing-box">

                                                    <strong>
                                                        Criteria to check
                                                    </strong>

                                                    <ul>
                                                        {result.missing.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        index
                                                                    }
                                                                >
                                                                    •{" "}
                                                                    {item}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>

                                                </div>
                                            )}

                                            {/* INCOME */}

                                            {result.incomeNote && (
                                                <div className="income-note">
                                                    {
                                                        result.incomeNote
                                                    }
                                                </div>
                                            )}

                                            {/* SUPPORT */}

                                            <div className="result-support">

                                                <span>
                                                    Scheme Support
                                                </span>

                                                <strong>
                                                    {
                                                        scheme.support
                                                    }
                                                </strong>

                                            </div>

                                            {/* OFFICIAL PORTAL */}

                                            <a
                                                href={
                                                    scheme.officialUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="official-btn"
                                            >
                                                Official Scheme
                                                Portal ↗
                                            </a>

                                        </article>
                                    )
                                )
                            )}

                        </div>

                        {/* DISCLAIMER */}

                        <div className="eligibility-disclaimer">

                            <strong>
                                Important:
                            </strong>{" "}
                            This checker provides a preliminary
                            indication based on the information
                            entered. It is not an official
                            government eligibility decision.
                            Final eligibility, documents, income
                            limits, state-specific conditions and
                            approval are determined by the
                            concerned authority.

                        </div>

                    </section>
                )}

            </main>
        </div>
    );
};

export default EligibilityChecker;