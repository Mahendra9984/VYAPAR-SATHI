import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
} from "react-icons/fa";

import "./Login.css";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [sentOtp, setSentOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // =====================================================
    // SEND OTP
    // =====================================================

    const handleSendOtp = async () => {
        if (!email.trim()) {
            alert("Please enter your email first");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/users/send-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );

            const data = await response.json();

            console.log("Send OTP Response:", data);

            if (response.ok) {
                setSentOtp(true);
                alert("OTP sent successfully");
            } else {
                alert(data.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error("Send OTP Error:", error);
            alert("Server Error");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOGIN
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password || !otp) {
            alert("Please fill all the fields");
            return;
        }

        if (otp.length !== 6) {
            alert("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                        otp,
                    }),
                }
            );

            const data = await response.json();

            console.log("Login Response:", data);

            if (response.ok) {
                // =====================================================
                // CHECK LOGIN RESPONSE
                // =====================================================

                if (!data.token || !data.user) {
                    alert("Invalid login response from server.");
                    return;
                }

                // =====================================================
                // SAVE JWT TOKEN
                // =====================================================

                localStorage.setItem("token", data.token);

                // =====================================================
                // SAVE USER INFORMATION
                // Includes id, name, email and role
                // =====================================================

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                console.log("Logged in user:", data.user);
                console.log("User role:", data.user.role);

                alert("Login successful");

                // =====================================================
                // ROLE BASED REDIRECT
                // =====================================================

                if (data.user.role === "admin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/dashboard");
                }
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* =====================================================
                LEFT SIDE
            ===================================================== */}

            <div className="login-left">

                {/* BRAND */}

                <div className="login-brand">

                    <div className="login-brand-icon">
                        ₹
                    </div>

                    <div>
                        <h2>Vyapar-Sathi</h2>

                        <span>
                            Your Business. Your Growth. Your Sathi.
                        </span>
                    </div>

                </div>

                {/* LEFT CONTENT */}

                <div className="login-left-content">

                    <span className="login-label">
                        WELCOME BACK
                    </span>

                    <h1>
                        Grow your business
                        <span> with confidence.</span>
                    </h1>

                    <p>
                        Login to access your personalized business
                        guidance, government scheme recommendations
                        and financial planning tools.
                    </p>

                    <div className="login-benefits">

                        <div>
                            <span className="login-benefit-icon">
                                ✓
                            </span>

                            <p>
                                Personalized business guidance
                            </p>
                        </div>

                        <div>
                            <span className="login-benefit-icon">
                                ✓
                            </span>

                            <p>
                                Government scheme recommendations
                            </p>
                        </div>

                        <div>
                            <span className="login-benefit-icon">
                                ✓
                            </span>

                            <p>
                                Simple and secure access
                            </p>
                        </div>

                    </div>

                </div>

                {/* BOTTOM */}

                <div className="login-left-bottom">

                    <span>
                        Empowering entrepreneurs
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        Building stronger businesses
                    </span>

                </div>

            </div>

            {/* =====================================================
                RIGHT SIDE
            ===================================================== */}

            <div className="login-right">

                {/* BACK BUTTON */}

                <button
                    className="login-back-btn"
                    onClick={() => navigate("/")}
                >
                    <FaArrowLeft />
                    Back to Home
                </button>

                {/* LOGIN CARD */}

                <div className="login-card">

                    <div className="login-card-header">

                        <div className="login-card-icon">
                            <FaUser />
                        </div>

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Login to your Vyapar-Sathi account
                        </p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* =====================================================
                            EMAIL
                        ===================================================== */}

                        <div className="login-form-group">

                            <label>
                                Email Address
                            </label>

                            <div className="login-input-wrapper">

                                <FaEnvelope
                                    className="login-input-icon"
                                />

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            PASSWORD
                        ===================================================== */}

                        <div className="login-form-group">

                            <label>
                                Password
                            </label>

                            <div className="login-input-wrapper">

                                <FaLock
                                    className="login-input-icon"
                                />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* =====================================================
                            OTP SECTION
                        ===================================================== */}

                        <div className="login-otp-section">

                            <div className="otp-heading">

                                <div>

                                    <label>
                                        Email Verification
                                    </label>

                                    <p>
                                        Verify your email before login
                                    </p>

                                </div>

                                <FaShieldAlt />

                            </div>

                            <button
                                type="button"
                                className="send-otp-btn"
                                onClick={handleSendOtp}
                                disabled={loading}
                            >
                                {loading
                                    ? "Sending..."
                                    : sentOtp
                                        ? "Resend OTP"
                                        : "Send OTP"}
                            </button>

                        </div>

                        {/* =====================================================
                            OTP INPUT
                        ===================================================== */}

                        {sentOtp && (

                            <div className="login-form-group otp-input-group">

                                <label>
                                    Enter OTP
                                </label>

                                <div className="login-input-wrapper">

                                    <FaShieldAlt
                                        className="login-input-icon"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        maxLength={6}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>

                        )}

                        {/* =====================================================
                            LOGIN BUTTON
                        ===================================================== */}

                        {sentOtp && (

                            <button
                                type="submit"
                                className="login-submit-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? "Logging in..."
                                    : "Login to Account"}

                                <span>
                                    →
                                </span>

                            </button>

                        )}

                    </form>

                    {/* =====================================================
                        REGISTER
                    ===================================================== */}

                    <div className="register-login-section">

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create Account
                        </button>

                    </div>

                </div>

                <p className="login-footer">
                    © 2026 Vyapar-Sathi. Empowering entrepreneurs.
                </p>

            </div>

        </div>
    );
};

export default Login;