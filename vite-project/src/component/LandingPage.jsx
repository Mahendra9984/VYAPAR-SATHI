import React from "react";
import { useNavigate } from "react-router-dom";

import "./LandingPage.css";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">

            {/* =========================
                NAVBAR
            ========================= */}

            <header className="landing-navbar">

                <div
                    className="brand"
                    onClick={() => navigate("/")}
                >
                    <div className="brand-icon">
                        ₹
                    </div>

                    <div className="brand-text">
                        <h2>Vyapar-Sathi</h2>
                        <span>Smart Business. Stronger Rural India.</span>
                    </div>
                </div>

                <nav className="desktop-nav">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#benefits">Benefits</a>
                    <a href="#about">About</a>
                </nav>

                <div className="nav-actions">

                    <button
                        className="login-btn"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>

                    <button
                        className="nav-register-btn"
                        onClick={() => navigate("/register")}
                    >
                        Get Started
                        <span>→</span>
                    </button>

                </div>

            </header>


            {/* =========================
                HERO SECTION
            ========================= */}

            <section className="hero-section">

                <div className="hero-content">

                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        AI-Powered Rural Entrepreneurship Platform
                    </div>

                    <h1>
                        Build Your Business.
                        <br />
                        <span>Grow With Confidence.</span>
                    </h1>

                    <p className="hero-description">
                        Vyapar Sathi AI helps rural micro-entrepreneurs make
                        better business decisions, discover suitable
                        government schemes, understand financial
                        requirements and plan their business with
                        intelligent guidance.
                    </p>

                    <div className="hero-buttons">

                        <button
                            className="primary-hero-btn"
                            onClick={() => navigate("/register")}
                        >
                            Start Your Journey
                            <span>→</span>
                        </button>

                        <button
                            className="secondary-hero-btn"
                            onClick={() => navigate("/login")}
                        >
                            Explore Platform
                        </button>

                    </div>

                    <div className="hero-trust">

                        <div className="trust-item">
                            <span>✓</span>
                            <p>Simple & Easy</p>
                        </div>

                        <div className="trust-item">
                            <span>✓</span>
                            <p>AI Assisted</p>
                        </div>

                        <div className="trust-item">
                            <span>✓</span>
                            <p>Scheme Guidance</p>
                        </div>

                    </div>

                </div>


                {/* =========================
                    DASHBOARD PREVIEW
                ========================= */}

                <div className="hero-visual">

                    <div className="dashboard-window">

                        <div className="window-header">

                            <div className="window-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <div className="window-title">
                                Entrepreneur Dashboard
                            </div>

                        </div>


                        <div className="dashboard-preview">

                            <div className="preview-welcome">

                                <div>
                                    <span>Good Morning 👋</span>
                                    <h3>Grow your business smarter</h3>
                                </div>

                                <div className="profile-circle">
                                    MK
                                </div>

                            </div>


                            <div className="preview-stats">

                                <div className="preview-stat-card">

                                    <div className="preview-stat-icon purple">
                                        ₹
                                    </div>

                                    <div>
                                        <small>Project Cost</small>
                                        <strong>₹10.0 L</strong>
                                    </div>

                                </div>


                                <div className="preview-stat-card">

                                    <div className="preview-stat-icon green">
                                        ↗
                                    </div>

                                    <div>
                                        <small>Est. Revenue</small>
                                        <strong>₹18.5 L</strong>
                                    </div>

                                </div>

                            </div>


                            {/* AI CARD */}

                            <div className="ai-preview-card">

                                <div className="ai-icon">
                                    AI
                                </div>

                                <div className="ai-text">
                                    <span>AI Business Advisor</span>

                                    <p>
                                        Your business has strong growth
                                        potential.
                                    </p>
                                </div>

                                <span className="preview-arrow">
                                    →
                                </span>

                            </div>


                            {/* SCHEMES */}

                            <div className="scheme-preview">

                                <div className="scheme-heading">
                                    <span>Recommended Schemes</span>
                                    <small>View all</small>
                                </div>


                                <div className="scheme-item">

                                    <div className="scheme-icon">
                                        ₹
                                    </div>

                                    <div>
                                        <strong>Micro Finance Scheme</strong>
                                        <small>
                                            Up to ₹25 Lakh assistance
                                        </small>
                                    </div>

                                    <span className="scheme-check">
                                        ✓
                                    </span>

                                </div>


                                <div className="scheme-item">

                                    <div className="scheme-icon">
                                        ₹
                                    </div>

                                    <div>
                                        <strong>Business Loan Support</strong>
                                        <small>
                                            Concessional interest rate
                                        </small>
                                    </div>

                                    <span className="scheme-check">
                                        ✓
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* FLOATING CARD 1 */}

                    <div className="floating-card location-card">

                        <div className="floating-icon">
                            •
                        </div>

                        <div>
                            <small>Local Advisory</small>
                            <strong>Mirzapur, UP</strong>
                        </div>

                    </div>


                    {/* FLOATING CARD 2 */}

                    <div className="floating-card eligibility-card">

                        <div className="eligibility-icon">
                            ✓
                        </div>

                        <div>
                            <small>Scheme Eligibility</small>
                            <strong>82% Match</strong>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                TRUST BAR
            ========================= */}

            <section className="trust-section">

                <p>
                    Designed to simplify business decisions for
                    rural entrepreneurs
                </p>

                <div className="trust-logos">

                    <div>
                        <span>₹</span>
                        Government Schemes
                    </div>

                    <div>
                        <span>AI</span>
                        AI Assistance
                    </div>

                    <div>
                        <span>↗</span>
                        Financial Planning
                    </div>

                    <div>
                        <span>•</span>
                        Hyper-Local Insights
                    </div>

                </div>

            </section>


            {/* =========================
                FEATURES
            ========================= */}

            <section
                className="features-section"
                id="features"
            >

                <div className="section-heading">

                    <span className="section-label">
                        POWERFUL FEATURES
                    </span>

                    <h2>
                        Everything You Need to
                        <span> Grow Your Business</span>
                    </h2>

                    <p>
                        One intelligent platform to help you plan,
                        finance and grow your rural enterprise.
                    </p>

                </div>


                <div className="features-grid">

                    <div className="feature-card featured-card">

                        <div className="feature-icon">
                            AI
                        </div>

                        <h3>AI Business Advisor</h3>

                        <p>
                            Get personalized business suggestions,
                            ideas and actionable recommendations
                            based on your goals.
                        </p>

                        <button
                            onClick={() => navigate("/register")}
                        >
                            Explore AI Advisor
                            <span>→</span>
                        </button>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon blue">
                            ₹
                        </div>

                        <h3>Government Schemes</h3>

                        <p>
                            Discover relevant government schemes
                            and financial assistance available for
                            your business.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon green">
                            ₹
                        </div>

                        <h3>Financial Structuring</h3>

                        <p>
                            Calculate project costs, contribution,
                            loan amount, repayment and estimated
                            financial requirements.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon orange">
                            •
                        </div>

                        <h3>Hyper-Local Advisory</h3>

                        <p>
                            Receive business insights based on your
                            location, local market and available
                            opportunities.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon violet">
                            ✓
                        </div>

                        <h3>Eligibility Checker</h3>

                        <p>
                            Quickly understand which schemes and
                            financial programs you may be eligible for.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon teal">
                            ↗
                        </div>

                        <h3>Business Growth Insights</h3>

                        <p>
                            Track your business plans and make informed
                            decisions using data-driven insights.
                        </p>

                    </div>

                </div>

            </section>


            {/* =========================
                HOW IT WORKS
            ========================= */}

            <section
                className="how-section"
                id="how-it-works"
            >

                <div className="section-heading">

                    <span className="section-label">
                        SIMPLE PROCESS
                    </span>

                    <h2>
                        From Idea to
                        <span> Business Growth</span>
                    </h2>

                    <p>
                        Vyapar Sathi AI guides you through every important step.
                    </p>

                </div>


                <div className="steps-container">

                    <div className="step">

                        <div className="step-number">
                            01
                        </div>

                        <div className="step-icon">
                            01
                        </div>

                        <h3>Tell Us About Yourself</h3>

                        <p>
                            Add your business idea, location,
                            experience and financial requirements.
                        </p>

                    </div>


                    <div className="step-line"></div>


                    <div className="step">

                        <div className="step-number">
                            02
                        </div>

                        <div className="step-icon">
                            AI
                        </div>

                        <h3>Get AI Guidance</h3>

                        <p>
                            Our AI analyzes your information and
                            provides personalized business recommendations.
                        </p>

                    </div>


                    <div className="step-line"></div>


                    <div className="step">

                        <div className="step-number">
                            03
                        </div>

                        <div className="step-icon">
                            ₹
                        </div>

                        <h3>Find Suitable Schemes</h3>

                        <p>
                            Compare government schemes and understand
                            your eligibility and financial support.
                        </p>

                    </div>


                    <div className="step-line"></div>


                    <div className="step">

                        <div className="step-number">
                            04
                        </div>

                        <div className="step-icon">
                            ↗
                        </div>

                        <h3>Plan & Grow</h3>

                        <p>
                            Create a practical financial plan and
                            move forward with confidence.
                        </p>

                    </div>

                </div>

            </section>


            {/* =========================
                BENEFITS
            ========================= */}

            <section
                className="benefits-section"
                id="benefits"
            >

                <div className="benefits-content">

                    <span className="section-label">
                        WHY RURALBIZ AI?
                    </span>

                    <h2>
                        Making Business Support
                        <span> Accessible to Everyone</span>
                    </h2>

                    <p>
                        Rural entrepreneurs often face difficulties
                        understanding financial requirements, government
                        schemes and market opportunities. RuralBiz AI
                        brings these resources together in one simple
                        platform.
                    </p>


                    <div className="benefit-list">

                        <div>
                            <span>✓</span>
                            <p>
                                Simple language and easy-to-understand guidance
                            </p>
                        </div>

                        <div>
                            <span>✓</span>
                            <p>
                                Personalized recommendations powered by AI
                            </p>
                        </div>

                        <div>
                            <span>✓</span>
                            <p>
                                Financial planning and loan structuring support
                            </p>
                        </div>

                        <div>
                            <span>✓</span>
                            <p>
                                Location-based business opportunities
                            </p>
                        </div>

                        <div>
                            <span>✓</span>
                            <p>
                                Centralized government scheme information
                            </p>
                        </div>

                    </div>

                </div>


                <div className="benefits-visual">

                    <div className="benefit-main-card">

                        <div className="benefit-card-top">

                            <div className="mini-icon">
                                AI
                            </div>

                            <div>
                                <small>AI Recommendation</small>
                                <strong>Business Opportunity</strong>
                            </div>

                        </div>


                        <div className="recommendation-box">

                            <span>Based on your location</span>

                            <h3>
                                Dairy & Food Processing
                            </h3>

                            <p>
                                High local demand with potential
                                government financial assistance.
                            </p>


                            <div className="recommendation-score">

                                <span>Opportunity Score</span>

                                <strong>91%</strong>

                            </div>


                            <div className="score-bar">
                                <div></div>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                ABOUT
            ========================= */}

            <section
                className="about-section"
                id="about"
            >

                <div className="about-card">

                    <div className="about-icon">
                        ✓
                    </div>

                    <h2>
                        Built for Rural Entrepreneurs
                    </h2>

                    <p>
                        Our goal is to reduce the information gap
                        between rural entrepreneurs and the financial,
                        government and business resources available
                        to them.
                    </p>

                    <button
                        onClick={() => navigate("/register")}
                    >
                        Create Your Free Account
                        <span>→</span>
                    </button>

                </div>

            </section>


            {/* =========================
                FINAL CTA
            ========================= */}

            <section className="cta-section">

                <div>

                    <span>
                        READY TO START?
                    </span>

                    <h2>
                        Turn Your Business Idea
                        <br />
                        Into a Real Opportunity.
                    </h2>

                    <p>
                        Start planning your rural enterprise with
                        AI-powered guidance.
                    </p>

                    <button
                        onClick={() => navigate("/register")}
                    >
                        Get Started Free
                        <span>→</span>
                    </button>

                </div>

            </section>


            {/* =========================
                FOOTER
            ========================= */}

            <footer className="landing-footer">

                <div className="footer-main">

                    <div className="footer-brand">

                        <div
                            className="brand"
                            onClick={() => navigate("/")}
                        >

                            <div className="brand-icon">
                                ₹
                            </div>

                            <div>
                                <h2>Vyapar Sathi</h2>

                                <span>
                                    Smart Business. Stronger Rural India.
                                </span>
                            </div>

                        </div>

                        <p>
                            AI-powered business advisory and financial
                            structuring assistant for rural
                            micro-entrepreneurs.
                        </p>

                    </div>


                    <div className="footer-column">

                        <h4>Platform</h4>

                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#benefits">Benefits</a>

                    </div>


                    <div className="footer-column">

                        <h4>Account</h4>

                        <button onClick={() => navigate("/login")}>
                            Login
                        </button>

                        <button onClick={() => navigate("/register")}>
                            Register
                        </button>

                    </div>


                    <div className="footer-column">

                        <h4>Support</h4>

                        <a href="#about">About Us</a>
                        <a href="#features">Help Center</a>

                    </div>

                </div>


                <div className="footer-bottom">

                    <span>
                        © 2026 Vyapar Sathi All rights reserved.
                    </span>

                    <span>
                        Built for Rural Entrepreneurship
                    </span>

                </div>

            </footer>

        </div>
    );
};

export default LandingPage;