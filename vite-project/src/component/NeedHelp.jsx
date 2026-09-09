import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NeedHelp.css";

const NeedHelp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subject: "",
        category: "General",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess("");
        setError("");

        if (!formData.subject.trim()) {
            setError("Please enter a subject.");
            return;
        }

        if (!formData.message.trim()) {
            setError("Please enter your message.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/support",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to submit support request."
                );
            }

            setSuccess(
                data.message ||
                "Your support request has been submitted successfully."
            );

            setFormData({
                subject: "",
                category: "General",
                message: "",
            });

        } catch (err) {
            console.error(
                "Support Request Error:",
                err
            );

            setError(
                err.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="need-help-page">

            {/* Header */}
            <div className="help-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div>
                    <h1>Need Help?</h1>
                    <p>
                        We are here to help you with Vyapar Sathi.
                    </p>
                </div>
            </div>

            <div className="help-container">

                {/* Support Options */}
                <div className="help-options">

                    <div className="help-card">
                        <div className="help-icon">
                            💬
                        </div>

                        <div>
                            <h3>Contact Support</h3>
                            <p>
                                Have an issue? Send us your
                                query and our support team
                                will help you.
                            </p>
                        </div>
                    </div>

                    <div className="help-card">
                        <div className="help-icon">
                            📄
                        </div>

                        <div>
                            <h3>Application Help</h3>
                            <p>
                                Get help regarding your
                                government scheme or loan
                                application.
                            </p>
                        </div>
                    </div>

                    <div className="help-card">
                        <div className="help-icon">
                            🔐
                        </div>

                        <div>
                            <h3>Account Support</h3>
                            <p>
                                Facing an account or profile
                                related issue? Contact us.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Support Form */}
                <div className="support-form-card">

                    <div className="form-heading">
                        <h2>Submit a Support Request</h2>
                        <p>
                            Tell us what problem you are facing.
                        </p>
                    </div>

                    {success && (
                        <div className="success-message">
                            ✓ {success}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>
                                Category
                            </label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="General">
                                    General
                                </option>

                                <option value="Application">
                                    Application
                                </option>

                                <option value="Government Scheme">
                                    Government Scheme
                                </option>

                                <option value="Loan">
                                    Loan
                                </option>

                                <option value="Documents">
                                    Documents
                                </option>

                                <option value="Account">
                                    Account
                                </option>

                                <option value="Technical">
                                    Technical Issue
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                Subject
                            </label>

                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Enter your issue"
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Message
                            </label>

                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Describe your problem..."
                                rows="7"
                                maxLength={1000}
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-support-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Submitting..."
                                : "Submit Request"}
                        </button>

                    </form>

                </div>

                {/* Quick Help */}
                <div className="quick-help">

                    <h2>Quick Help</h2>

                    <div className="faq-item">
                        <strong>
                            How can I track my application?
                        </strong>

                        <span>
                            Go to Applications from your
                            dashboard to view application
                            status and timeline.
                        </span>
                    </div>

                    <div className="faq-item">
                        <strong>
                            How can I check government schemes?
                        </strong>

                        <span>
                            Open Government Schemes from
                            the main menu to explore available
                            schemes.
                        </span>
                    </div>

                    <div className="faq-item">
                        <strong>
                            How can I upload documents?
                        </strong>

                        <span>
                            Open Documents from your dashboard
                            and upload the required documents.
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default NeedHelp;