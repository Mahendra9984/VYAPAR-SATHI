import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProfileSetting.css";

const ProfileSetting = () => {
    const [activeTab, setActiveTab] = useState("profile");

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        businessName: "",
        businessType: "",
        businessAddress: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [notifications, setNotifications] = useState({
        pushNotifications: true,
        emailUpdates: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = () => {
        const token = localStorage.getItem("token");

        if (token) {
            return token;
        }

        try {
            const user = JSON.parse(
                localStorage.getItem("user")
            );

            return user?.token || user?.accessToken || "";
        } catch {
            return "";
        }
    };

    // =====================================================
    // LOAD PROFILE
    // =====================================================

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const token = getToken();

                if (!token) {
                    setError("Please login again.");
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    const user = response.data.user;

                    setProfile({
                        name: user.name || "",
                        email: user.email || "",
                        businessName: user.businessName || "",
                        businessType: user.businessType || "",
                        businessAddress:
                            user.businessAddress || "",
                    });
                }
            } catch (err) {
                console.error(
                    "Profile Load Error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            const response = await axios.put(
                "http://localhost:5000/api/profile",
                {
                    name: profile.name,
                    email: profile.email,
                    businessName: profile.businessName,
                    businessType: profile.businessType,
                    businessAddress: profile.businessAddress,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const updatedUser = response.data.user;

                setProfile({
                    name: updatedUser.name || "",
                    email: updatedUser.email || "",
                    businessName:
                        updatedUser.businessName || "",
                    businessType:
                        updatedUser.businessType || "",
                    businessAddress:
                        updatedUser.businessAddress || "",
                });

                setMessage(
                    "Profile updated successfully."
                );

                // Update localStorage user if present
                try {
                    const oldUser = JSON.parse(
                        localStorage.getItem("user")
                    );

                    if (oldUser) {
                        localStorage.setItem(
                            "user",
                            JSON.stringify({
                                ...oldUser,
                                ...updatedUser,
                            })
                        );
                    }
                } catch {
                    // Ignore localStorage parsing errors
                }
            }
        } catch (err) {
            console.error(
                "Profile Update Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // PASSWORD INPUT
    // =====================================================

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            setError(
                "New passwords do not match."
            );
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            const response = await axios.put(
                "http://localhost:5000/api/profile/change-password",
                passwordData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setMessage(
                    "Password changed successfully."
                );

                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (err) {
            console.error(
                "Change Password Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to change password."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // NOTIFICATION CHANGE
    // =====================================================

    const handleNotificationChange = (name) => {
        setNotifications((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    Loading Profile...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="profile-header">
                <h1>Profile & Settings</h1>

                <p>
                    Manage your personal information,
                    business details and account settings.
                </p>
            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div className="profile-tabs">

                <button
                    className={
                        activeTab === "profile"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() => {
                        setActiveTab("profile");
                        setMessage("");
                        setError("");
                    }}
                >
                    Profile
                </button>

                <button
                    className={
                        activeTab === "security"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() => {
                        setActiveTab("security");
                        setMessage("");
                        setError("");
                    }}
                >
                    Security
                </button>

                <button
                    className={
                        activeTab === "notifications"
                            ? "profile-tab active"
                            : "profile-tab"
                    }
                    onClick={() => {
                        setActiveTab("notifications");
                        setMessage("");
                        setError("");
                    }}
                >
                    Notifications
                </button>

            </div>

            {/* =================================================
                MESSAGE
            ================================================= */}

            {message && (
                <div className="profile-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {/* =================================================
                PROFILE TAB
            ================================================= */}

            {activeTab === "profile" && (
                <div className="profile-card">

                    <div className="section-heading">
                        <h2>Personal Information</h2>

                        <span>
                            Update your basic account
                            information.
                        </span>
                    </div>

                    <form onSubmit={handleSaveProfile}>

                        {/* NAME + EMAIL */}

                        <div className="form-row">

                            <div className="form-group">
                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={
                                        handleProfileChange
                                    }
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={
                                        handleProfileChange
                                    }
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                        </div>

                        {/* BUSINESS NAME */}

                        <div className="form-row">

                            <div className="form-group">
                                <label>
                                    Business Name
                                </label>

                                <input
                                    type="text"
                                    name="businessName"
                                    value={
                                        profile.businessName
                                    }
                                    onChange={
                                        handleProfileChange
                                    }
                                    placeholder="Enter business name"
                                />
                            </div>

                            {/* BUSINESS TYPE */}

                            <div className="form-group">
                                <label>
                                    Business Type
                                </label>

                                <select
                                    name="businessType"
                                    value={
                                        profile.businessType
                                    }
                                    onChange={
                                        handleProfileChange
                                    }
                                >
                                    <option value="">
                                        Select business type
                                    </option>

                                    <option value="Retail">
                                        Retail
                                    </option>

                                    <option value="Wholesale">
                                        Wholesale
                                    </option>

                                    <option value="Manufacturing">
                                        Manufacturing
                                    </option>

                                    <option value="Service">
                                        Service
                                    </option>

                                    <option value="Agriculture">
                                        Agriculture
                                    </option>

                                    <option value="Food Business">
                                        Food Business
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                        </div>

                        {/* BUSINESS ADDRESS */}

                        <div className="form-group full-width">
                            <label>
                                Business Address
                            </label>

                            <textarea
                                name="businessAddress"
                                value={
                                    profile.businessAddress
                                }
                                onChange={
                                    handleProfileChange
                                }
                                placeholder="Enter your business address"
                                rows="5"
                            />
                        </div>

                        <div className="form-footer">
                            <button
                                type="submit"
                                className="save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* =================================================
                SECURITY TAB
            ================================================= */}

            {activeTab === "security" && (
                <div className="profile-card">

                    <div className="section-heading">
                        <h2>Security</h2>

                        <span>
                            Keep your account secure.
                        </span>
                    </div>

                    <form
                        onSubmit={
                            handleChangePassword
                        }
                    >

                        <div className="security-form">

                            <div className="form-group">
                                <label>
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={
                                        passwordData.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="newPassword"
                                    value={
                                        passwordData.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                        passwordData.confirmPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                        </div>

                        <div className="form-footer">
                            <button
                                type="submit"
                                className="save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Changing..."
                                    : "Change Password"}
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* =================================================
                NOTIFICATIONS TAB
            ================================================= */}

            {activeTab === "notifications" && (
                <div className="profile-card">

                    <div className="section-heading">
                        <h2>Notifications</h2>

                        <span>
                            Manage how you receive
                            notifications.
                        </span>
                    </div>

                    <div className="notification-list">

                        <div className="notification-item">

                            <div>
                                <h3>
                                    Push Notifications
                                </h3>

                                <p>
                                    Receive notifications
                                    about your account
                                    activity
                                </p>
                            </div>

                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={
                                        notifications.pushNotifications
                                    }
                                    onChange={() =>
                                        handleNotificationChange(
                                            "pushNotifications"
                                        )
                                    }
                                />

                                <span className="slider"></span>
                            </label>

                        </div>

                        <div className="notification-item">

                            <div>
                                <h3>
                                    Email Updates
                                </h3>

                                <p>
                                    Receive important
                                    updates and account
                                    information
                                </p>
                            </div>

                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={
                                        notifications.emailUpdates
                                    }
                                    onChange={() =>
                                        handleNotificationChange(
                                            "emailUpdates"
                                        )
                                    }
                                />

                                <span className="slider"></span>
                            </label>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default ProfileSetting;