import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./AIAdvisor.css";

const AIAdvisor = () => {
    // ================= BASIC CHAT STATE =================

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ================= BUSINESS CONTEXT =================

    const [showContext, setShowContext] = useState(false);

    const [businessContext, setBusinessContext] = useState({
        businessName: "",
        category: "",
        location: "",
        budget: "",
        customers: ""
    });

    // ================= LOCATION STATE =================

    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");

    // ================= QUICK PROMPTS =================

    const quickPrompts = [
        {
            icon: "📈",
            title: "Grow My Sales",
            text: "Mere business ki sales badhane ke liye practical strategy batao."
        },
        {
            icon: "📣",
            title: "Marketing Strategy",
            text: "Mere business ke liye low-budget marketing strategy suggest karo."
        },
        {
            icon: "💰",
            title: "Pricing Advice",
            text: "Mere products ki pricing kaise decide karni chahiye?"
        },
        {
            icon: "💡",
            title: "New Product Ideas",
            text: "Mere business ke liye naye profitable product ideas suggest karo."
        }
    ];

    // ================= SUPPORTED DISTRICTS =================

    const supportedDistricts = [
        "Siddharth Nagar",
        "Mirzapur",
        "Azamgarh",
        "Sonbhadra"
    ];

    // ================= QUICK PROMPT =================

    const handleQuickPrompt = (text) => {
        setQuestion(text);
    };

    // ================= BUSINESS CONTEXT CHANGE =================

    const handleContextChange = (e) => {
        const { name, value } = e.target;

        setBusinessContext((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ================= CLEAN LOCATION PARTS =================

    const cleanLocationParts = (parts) => {
        const cleaned = [];

        parts.forEach((part) => {
            if (!part) return;

            const value = String(part).trim();

            if (!value) return;

            const alreadyExists = cleaned.some(
                (item) =>
                    item.toLowerCase() === value.toLowerCase()
            );

            if (!alreadyExists) {
                cleaned.push(value);
            }
        });

        return cleaned;
    };

    // ================= LOCATION PARSER =================

    const parseLocation = (locationText) => {
        if (!locationText || typeof locationText !== "string") {
            return {
                village: "",
                locality: "",
                district: "",
                state: "",
                country: "India",
                latitude: null,
                longitude: null
            };
        }

        const parts = locationText
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

        let village = "";
        let locality = "";
        let district = "";
        let state = "";

        if (parts.length >= 4) {
            village = parts[0];
            locality = parts[1];
            district = parts[2];
            state = parts[3];
        } else if (parts.length === 3) {
            locality = parts[0];
            district = parts[1];
            state = parts[2];
        } else if (parts.length === 2) {
            district = parts[0];
            state = parts[1];
        } else if (parts.length === 1) {
            district = parts[0];
        }

        return {
            village,
            locality,
            district,
            state,
            country: "India",
            latitude: null,
            longitude: null
        };
    };

    // ================= LIVE LOCATION =================

    const getLiveLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus(
                "Aapke browser mein location service available nahi hai."
            );
            return;
        }

        setIsGettingLocation(true);

        setLocationStatus(
            "📍 Live location detect ho rahi hai..."
        );

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const {
                    latitude,
                    longitude,
                    accuracy
                } = position.coords;

                console.log("========== LIVE GPS ==========");
                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
                console.log("Accuracy:", accuracy, "meters");

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                Accept: "application/json"
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Location details fetch failed"
                        );
                    }

                    const data = await response.json();

                    console.log(
                        "========== REVERSE LOCATION =========="
                    );

                    console.log(data);

                    const address = data.address || {};

                    // ================= INDIA ADDRESS HIERARCHY =================

                    const village =
                        address.village ||
                        address.hamlet ||
                        address.suburb ||
                        "";

                    const locality =
                        address.locality ||
                        address.town ||
                        address.city ||
                        address.municipality ||
                        "";

                    const district =
                        address.state_district ||
                        address.county ||
                        address.district ||
                        "";

                    const state =
                        address.state || "";

                    console.log("Village:", village);
                    console.log("Locality:", locality);
                    console.log("District:", district);
                    console.log("State:", state);

                    const locationParts =
                        cleanLocationParts([
                            village,
                            locality,
                            district,
                            state
                        ]);

                    const detectedLocation =
                        locationParts.join(", ");

                    console.log(
                        "FINAL DETECTED LOCATION:",
                        detectedLocation
                    );

                    if (!detectedLocation) {
                        throw new Error(
                            "Location details nahi mile"
                        );
                    }

                    setBusinessContext((prev) => ({
                        ...prev,
                        location: detectedLocation
                    }));

                    setLocationStatus(
                        `✓ Location detected: ${detectedLocation}`
                    );

                    // Coordinates ko session storage me rakhenge
                    sessionStorage.setItem(
                        "vyaparSathiLocation",
                        JSON.stringify({
                            village,
                            locality,
                            district,
                            state,
                            country:
                                address.country ||
                                "India",
                            latitude,
                            longitude,
                            accuracy
                        })
                    );
                } catch (error) {
                    console.error(
                        "Reverse Geocoding Error:",
                        error
                    );

                    const coordinates =
                        `GPS: ${latitude.toFixed(
                            6
                        )}, ${longitude.toFixed(6)}`;

                    setBusinessContext((prev) => ({
                        ...prev,
                        location: coordinates
                    }));

                    sessionStorage.setItem(
                        "vyaparSathiLocation",
                        JSON.stringify({
                            village: "",
                            locality: "",
                            district: "",
                            state: "",
                            country: "India",
                            latitude,
                            longitude,
                            accuracy
                        })
                    );

                    setLocationStatus(
                        "✓ GPS location mil gayi, lekin address details nahi mil saki."
                    );
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                console.error(
                    "Geolocation Error:",
                    error
                );

                setIsGettingLocation(false);

                if (error.code === 1) {
                    setLocationStatus(
                        "❌ Location permission denied. Browser mein location Allow karein."
                    );
                } else if (error.code === 2) {
                    setLocationStatus(
                        "❌ Location unavailable. GPS/Internet check karein."
                    );
                } else if (error.code === 3) {
                    setLocationStatus(
                        "❌ Location detect hone mein timeout ho gaya. Dobara try karein."
                    );
                } else {
                    setLocationStatus(
                        "❌ Location detect nahi ho paayi."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );
    };

    // ================= SAVE BUSINESS CONTEXT =================

    const saveBusinessContext = () => {
        setShowContext(false);

        if (businessContext.location.trim()) {
            setLocationStatus(
                `✓ Business location saved: ${businessContext.location}`
            );
        }
    };

    // ================= CREATE AI MESSAGE =================

    const createAIMessage = (userText) => {
        const contextParts = [];

        if (businessContext.businessName.trim()) {
            contextParts.push(
                `Business Name: ${businessContext.businessName.trim()}`
            );
        }

        if (businessContext.category.trim()) {
            contextParts.push(
                `Business Category: ${businessContext.category.trim()}`
            );
        }

        if (businessContext.location.trim()) {
            contextParts.push(
                `Location: ${businessContext.location.trim()}`
            );
        }

        if (businessContext.budget.trim()) {
            contextParts.push(
                `Budget: ${businessContext.budget.trim()}`
            );
        }

        if (businessContext.customers.trim()) {
            contextParts.push(
                `Target Customers: ${businessContext.customers.trim()}`
            );
        }

        let finalMessage = userText;

        if (contextParts.length > 0) {
            finalMessage = `USER BUSINESS CONTEXT:

${contextParts.join("\n")}

USER QUESTION:

${userText}

IMPORTANT BUSINESS ADVISOR RULES:

1. You are the Vyapar Sathi Business Advisor.

2. Your primary purpose is BUSINESS ADVICE.

3. Use the user's business context while answering.

4. If location is provided, use it to make business recommendations more locally relevant.

5. If GPS/live location is provided, use the detected village/town/district/state information.

6. DO NOT assume that something is famous in a village, town or district unless reliable information supports it.

7. If exact local information is unavailable, clearly say:

"Ye recommendation general rural-market patterns par based hai."

Do not invent local facts.

8. Consider relevant local business factors such as:

- Local demand
- Nearby markets
- Customer needs
- Local products
- Agriculture-related businesses where relevant
- Dairy/livestock-related businesses where relevant
- Transport
- Tourism
- Local manufacturing
- Existing services
- Competition
- Purchasing power
- Availability of raw materials

9. DO NOT make farming advice the main purpose of the advisor.

10. If the user asks for business ideas, identify as many realistic options as reasonably possible.

11. Rank the opportunities according to potential.

12. Clearly divide recommendations into:

🔥 HIGH POTENTIAL

🟢 GOOD OPPORTUNITY

🟡 MODERATE OPPORTUNITY

13. Do not mark something HIGH POTENTIAL randomly.

14. For every major business recommendation provide:

- Business name
- Potential level
- Why it may work
- Estimated starting investment
- Target customers
- Demand/opportunity
- Competition
- Profit opportunity
- Main risks
- Difficulty level

15. If the user's budget is available, only recommend businesses realistically compatible with that budget.

16. Compare the strongest opportunities.

17. Provide TOP 3-5 RECOMMENDATIONS and explain why they are strongest.

18. Give practical step-by-step actions.

19. Understand Hindi, English and Hinglish.

20. Reply in the same language/style as the user.

21. Keep explanations simple and practical.

22. Never guarantee profit.

Use words such as "potential", "may", "likely" and "depends on local demand".

23. Never invent government schemes.

If scheme information may have changed, tell the user to verify it from an official government source.

24. If important information such as business category, budget or target customers is missing, ask for it when necessary.

25. For local business discovery, explain WHY the recommendation is suitable for the given location.

26. If the location is one of the supported districts (Siddharth Nagar, Mirzapur, Azamgarh or Sonbhadra), give location-aware recommendations only when the available information supports them.

27. If village-level information is not available, do not pretend that you know the village-specific market.

28. Give practical and realistic answers.

29. Do not unnecessarily repeat the same information.

30. When giving financial figures, clearly mark them as approximate estimates and mention that actual costs depend on local prices and scale.
`;
        }

        return finalMessage;
    };

    // ================= PREPARE STRUCTURED LOCATION =================

    const getStructuredLocation = () => {
        const savedLocation =
            sessionStorage.getItem(
                "vyaparSathiLocation"
            );

        if (savedLocation) {
            try {
                const parsed =
                    JSON.parse(savedLocation);

                return {
                    village:
                        parsed.village || "",
                    locality:
                        parsed.locality || "",
                    district:
                        parsed.district || "",
                    state:
                        parsed.state || "",
                    country:
                        parsed.country || "India",
                    latitude:
                        parsed.latitude ?? null,
                    longitude:
                        parsed.longitude ?? null
                };
            } catch (error) {
                console.error(
                    "Saved location parse error:",
                    error
                );
            }
        }

        return parseLocation(
            businessContext.location
        );
    };

    // ================= PREPARE BUSINESS CONTEXT =================

    const getStructuredBusinessContext = () => {
        return {
            businessName:
                businessContext.businessName.trim(),

            category:
                businessContext.category.trim(),

            targetCustomers:
                businessContext.customers.trim(),

            budget:
                businessContext.budget.trim(),

            skills: "",

            resources: ""
        };
    };

    // ================= ASK AI =================

    const handleAskAI = async () => {
        if (!question.trim() || isLoading) {
            return;
        }

        const userText = question.trim();

        const userMessage = {
            id: Date.now(),
            type: "user",
            text: userText
        };

        setMessages((prev) => [
            ...prev,
            userMessage
        ]);

        setQuestion("");
        setIsLoading(true);

        try {
            const aiRequestMessage =
                createAIMessage(userText);

            const structuredLocation =
                getStructuredLocation();

            const structuredBusinessContext =
                getStructuredBusinessContext();

            console.log(
                "========== AI REQUEST =========="
            );

            console.log(
                "Message:",
                aiRequestMessage
            );

            console.log(
                "Location:",
                structuredLocation
            );

            console.log(
                "Business Context:",
                structuredBusinessContext
            );

            const response = await fetch(
                "http://localhost:5000/api/ai/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message:
                            aiRequestMessage,

                        location:
                            structuredLocation,

                        businessContext:
                            structuredBusinessContext
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "AI request failed"
                );
            }

            const aiMessage = {
                id: Date.now() + 1,
                type: "ai",
                text:
                    data.reply ||
                    "AI se response nahi mila."
            };

            setMessages((prev) => [
                ...prev,
                aiMessage
            ]);
        } catch (error) {
            console.error(
                "AI Advisor Frontend Error:",
                error
            );

            const errorMessage = {
                id: Date.now() + 1,
                type: "ai",
                text:
                    "Sorry, abhi AI Advisor se response nahi mil pa raha hai. Please thodi der baad try karein."
            };

            setMessages((prev) => [
                ...prev,
                errorMessage
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ================= ENTER KEY =================

    const handleKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();

            handleAskAI();
        }
    };

    // ================= CLEAR CHAT =================

    const clearConversation = () => {
        setMessages([]);
    };

    // ================= COPY RESPONSE =================

    const copyResponse = async (text) => {
        try {
            await navigator.clipboard.writeText(text);

            console.log("Response copied");
        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );
        }
    };

    // ================= REGENERATE =================

    const regenerateResponse = async () => {
        if (isLoading) {
            return;
        }

        const userMessage =
            [...messages]
                .reverse()
                .find(
                    (message) =>
                        message.type === "user"
                );

        if (!userMessage) {
            return;
        }

        setIsLoading(true);

        try {
            const aiRequestMessage =
                createAIMessage(
                    userMessage.text
                );

            const structuredLocation =
                getStructuredLocation();

            const structuredBusinessContext =
                getStructuredBusinessContext();

            const response = await fetch(
                "http://localhost:5000/api/ai/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message:
                            aiRequestMessage,

                        location:
                            structuredLocation,

                        businessContext:
                            structuredBusinessContext
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Regeneration failed"
                );
            }

            const aiMessage = {
                id: Date.now(),
                type: "ai",
                text:
                    data.reply ||
                    "AI se response nahi mila."
            };

            setMessages((prev) => [
                ...prev,
                aiMessage
            ]);
        } catch (error) {
            console.error(
                "Regenerate Error:",
                error
            );

            const errorMessage = {
                id: Date.now(),
                type: "ai",
                text:
                    "Response regenerate nahi ho paaya. Please dobara try karein."
            };

            setMessages((prev) => [
                ...prev,
                errorMessage
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ================= CONTEXT DISPLAY =================

    const getContextValue = (
        value,
        defaultValue
    ) => {
        return value.trim()
            ? value
            : defaultValue;
    };

    // ================= UI =================

    return (
        <div className="ai-advisor-page">

            {/* ================= HEADER ================= */}

            <div className="ai-page-header">

                <div className="ai-header-left">

                    <div className="ai-main-icon">
                        ✦
                    </div>

                    <div>

                        <div className="ai-title-row">

                            <h1>
                                Vyapar Sathi AI Advisor
                            </h1>

                            <span className="ai-status">
                                <span className="status-dot"></span>
                                AI Active
                            </span>

                        </div>

                        <p>
                            Your intelligent business growth partner
                        </p>

                    </div>

                </div>

                {messages.length > 0 && (
                    <button
                        className="clear-chat-btn"
                        onClick={
                            clearConversation
                        }
                    >
                        🗑 Clear Conversation
                    </button>
                )}

            </div>

            {/* ================= MAIN LAYOUT ================= */}

            <div className="ai-advisor-layout">

                {/* ================= LEFT SIDEBAR ================= */}

                <aside className="ai-sidebar">

                    {/* ================= BUSINESS CONTEXT ================= */}

                    <div className="context-card">

                        <div className="section-heading">

                            <div className="section-icon">
                                ◈
                            </div>

                            <div>

                                <h3>
                                    Business Context
                                </h3>

                                <p>
                                    Help AI understand your business
                                </p>

                            </div>

                        </div>

                        <div className="context-item">

                            <span>
                                Business Name
                            </span>

                            <strong>
                                {getContextValue(
                                    businessContext.businessName,
                                    "Not specified"
                                )}
                            </strong>

                        </div>

                        <div className="context-item">

                            <span>
                                Category
                            </span>

                            <strong>
                                {getContextValue(
                                    businessContext.category,
                                    "Not specified"
                                )}
                            </strong>

                        </div>

                        <div className="context-item">

                            <span>
                                Location
                            </span>

                            <strong>
                                {getContextValue(
                                    businessContext.location,
                                    "Not specified"
                                )}
                            </strong>

                        </div>

                        <div className="context-item">

                            <span>
                                Budget
                            </span>

                            <strong>
                                {getContextValue(
                                    businessContext.budget,
                                    "Not specified"
                                )}
                            </strong>

                        </div>

                        {/* ================= ADD BUSINESS DETAILS ================= */}

                        <button
                            type="button"
                            className="edit-context-btn"
                            onClick={() =>
                                setShowContext(
                                    (prev) => !prev
                                )
                            }
                        >
                            {showContext
                                ? "✕ Close Details"
                                : "+ Add Business Details"}
                        </button>

                        {/* ================= CONTEXT FORM ================= */}

                        {showContext && (
                            <div className="business-context-form">

                                <input
                                    type="text"
                                    name="businessName"
                                    value={
                                        businessContext.businessName
                                    }
                                    onChange={
                                        handleContextChange
                                    }
                                    placeholder="Business Name"
                                />

                                <input
                                    type="text"
                                    name="category"
                                    value={
                                        businessContext.category
                                    }
                                    onChange={
                                        handleContextChange
                                    }
                                    placeholder="Business Category"
                                />

                                {/* ================= LOCATION ================= */}

                                <div className="location-input-group">

                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            businessContext.location
                                        }
                                        onChange={
                                            handleContextChange
                                        }
                                        placeholder="Village / Town / District / State"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            getLiveLocation
                                        }
                                        disabled={
                                            isGettingLocation
                                        }
                                    >
                                        {isGettingLocation
                                            ? "📍 Detecting..."
                                            : "📍 Use Live Location"}
                                    </button>

                                </div>

                                {locationStatus && (
                                    <small className="location-status">
                                        {locationStatus}
                                    </small>
                                )}

                                {/* ================= DISTRICT SHORTCUT ================= */}

                                <select
                                    value={
                                        supportedDistricts.includes(
                                            businessContext.location
                                        )
                                            ? businessContext.location
                                            : ""
                                    }
                                    onChange={(e) => {

                                        const value =
                                            e.target.value;

                                        if (!value) {
                                            return;
                                        }

                                        setBusinessContext(
                                            (prev) => ({
                                                ...prev,
                                                location:
                                                    value
                                            })
                                        );

                                        setLocationStatus(
                                            `✓ Location selected: ${value}`
                                        );

                                        sessionStorage.setItem(
                                            "vyaparSathiLocation",
                                            JSON.stringify({
                                                village: "",
                                                locality: "",
                                                district:
                                                    value,
                                                state: "",
                                                country:
                                                    "India",
                                                latitude:
                                                    null,
                                                longitude:
                                                    null
                                            })
                                        );
                                    }}
                                >

                                    <option value="">
                                        Select supported district
                                    </option>

                                    {supportedDistricts.map(
                                        (district) => (
                                            <option
                                                key={
                                                    district
                                                }
                                                value={
                                                    district
                                                }
                                            >
                                                {district}
                                            </option>
                                        )
                                    )}

                                </select>

                                <input
                                    type="text"
                                    name="budget"
                                    value={
                                        businessContext.budget
                                    }
                                    onChange={
                                        handleContextChange
                                    }
                                    placeholder="Budget e.g. ₹50,000"
                                />

                                <input
                                    type="text"
                                    name="customers"
                                    value={
                                        businessContext.customers
                                    }
                                    onChange={
                                        handleContextChange
                                    }
                                    placeholder="Target Customers"
                                />

                                <button
                                    type="button"
                                    onClick={
                                        saveBusinessContext
                                    }
                                >
                                    Save Details
                                </button>

                            </div>
                        )}

                    </div>

                    {/* ================= QUICK ACTIONS ================= */}

                    <div className="quick-actions">

                        <div className="section-heading">

                            <div className="section-icon">
                                ⚡
                            </div>

                            <div>

                                <h3>
                                    Quick Actions
                                </h3>

                                <p>
                                    Start with a business topic
                                </p>

                            </div>

                        </div>

                        <div className="quick-list">

                            {quickPrompts.map(
                                (prompt) => (

                                    <button
                                        type="button"
                                        key={
                                            prompt.title
                                        }
                                        className="quick-prompt"
                                        onClick={() =>
                                            handleQuickPrompt(
                                                prompt.text
                                            )
                                        }
                                    >

                                        <span className="quick-icon">
                                            {
                                                prompt.icon
                                            }
                                        </span>

                                        <span className="quick-content">

                                            <strong>
                                                {
                                                    prompt.title
                                                }
                                            </strong>

                                            <small>
                                                Ask AI Advisor
                                            </small>

                                        </span>

                                        <span className="quick-arrow">
                                            →
                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    </div>

                    {/* ================= AI TIP ================= */}

                    <div className="ai-tip-card">

                        <div className="tip-icon">
                            💡
                        </div>

                        <div>

                            <strong>
                                Pro Tip
                            </strong>

                            <p>
                                Business ke baare me specific
                                information dene par AI Advisor
                                zyada useful recommendations de
                                sakta hai.
                            </p>

                        </div>

                    </div>

                </aside>

                {/* ================= MAIN CHAT ================= */}

                <main className="ai-chat-container">

                    {/* ================= CHAT HEADER ================= */}

                    <div className="chat-header">

                        <div className="chat-agent">

                            <div className="agent-avatar">
                                ✦
                            </div>

                            <div>

                                <h2>
                                    Vyapar Sathi AI
                                </h2>

                                <span>
                                    Business Strategy Assistant
                                </span>

                            </div>

                        </div>

                        <div className="secure-badge">
                            🔒 Secure
                        </div>

                    </div>

                    {/* ================= CHAT BODY ================= */}

                    <div className="chat-body">

                        {messages.length === 0 ? (

                            <div className="welcome-screen">

                                <div className="welcome-ai-icon">
                                    ✦
                                </div>

                                <h2>
                                    Hello, Entrepreneur! 👋
                                </h2>

                                <p>
                                    Main aapka Vyapar Sathi AI
                                    Advisor hoon. Aapke business
                                    ko grow karne ke liye strategy,
                                    marketing, pricing, sales aur
                                    naye business opportunities
                                    ke baare me mujhse pooch sakte
                                    hain.
                                </p>

                                <div className="suggestion-grid">

                                    {quickPrompts.map(
                                        (prompt) => (

                                            <button
                                                type="button"
                                                key={
                                                    prompt.title
                                                }
                                                className="suggestion-card"
                                                onClick={() =>
                                                    handleQuickPrompt(
                                                        prompt.text
                                                    )
                                                }
                                            >

                                                <span>
                                                    {
                                                        prompt.icon
                                                    }
                                                </span>

                                                <div>

                                                    <strong>
                                                        {
                                                            prompt.title
                                                        }
                                                    </strong>

                                                    <small>
                                                        Get AI recommendations
                                                    </small>

                                                </div>

                                                <b>
                                                    →
                                                </b>

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        ) : (

                            <div className="messages-wrapper">

                                {messages.map(
                                    (message) => (

                                        <div
                                            key={
                                                message.id
                                            }
                                            className={`message-row ${message.type}`}
                                        >

                                            {message.type ===
                                                "ai" && (

                                                    <div className="message-avatar">
                                                        ✦
                                                    </div>

                                                )}

                                            <div className="message-content">

                                                <div className="message-label">

                                                    {message.type ===
                                                        "ai"
                                                        ? "Vyapar Sathi AI"
                                                        : "You"}

                                                </div>

                                                {/* ================= MESSAGE BUBBLE ================= */}

                                                <div className="message-bubble">

                                                    {message.type ===
                                                        "ai" ? (

                                                        <ReactMarkdown
                                                            remarkPlugins={[
                                                                remarkGfm
                                                            ]}
                                                        >
                                                            {
                                                                message.text
                                                            }
                                                        </ReactMarkdown>

                                                    ) : (

                                                        message.text

                                                    )}

                                                </div>

                                                {/* ================= MESSAGE ACTIONS ================= */}

                                                {message.type ===
                                                    "ai" && (

                                                        <div className="message-actions">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    copyResponse(
                                                                        message.text
                                                                    )
                                                                }
                                                            >
                                                                📋 Copy
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    regenerateResponse
                                                                }
                                                                disabled={
                                                                    isLoading
                                                                }
                                                            >
                                                                ↻ Regenerate
                                                            </button>

                                                        </div>

                                                    )}

                                            </div>

                                        </div>

                                    )
                                )}

                                {/* ================= LOADING ================= */}

                                {isLoading && (

                                    <div className="message-row ai">

                                        <div className="message-avatar">
                                            ✦
                                        </div>

                                        <div className="message-content">

                                            <div className="message-label">
                                                Vyapar Sathi AI
                                            </div>

                                            <div className="typing-bubble">

                                                <span></span>
                                                <span></span>
                                                <span></span>

                                                <small>
                                                    Analyzing your question...
                                                </small>

                                            </div>

                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                    {/* ================= INPUT ================= */}

                    <div className="chat-input-area">

                        <div className="input-wrapper">

                            <textarea
                                value={question}
                                onChange={(e) =>
                                    setQuestion(
                                        e.target.value
                                    )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                placeholder="Ask Vyapar Sathi anything about your business..."
                                rows="1"
                                disabled={isLoading}
                            />

                            <button
                                type="button"
                                className="send-btn"
                                onClick={
                                    handleAskAI
                                }
                                disabled={
                                    !question.trim() ||
                                    isLoading
                                }
                            >
                                {isLoading
                                    ? "..."
                                    : "➤"}
                            </button>

                        </div>

                        <div className="input-footer">

                            <span>
                                ↵ Enter to send • Shift + Enter for new line
                            </span>

                            <span>
                                Vyapar Sathi AI can make mistakes.
                                Verify important decisions.
                            </span>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
};

export default AIAdvisor;