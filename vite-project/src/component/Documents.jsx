import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Documents.css";

const Documents = () => {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [showUpload, setShowUpload] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [documentName, setDocumentName] = useState("");
    const [documentType, setDocumentType] = useState("");
    const [applicationId, setApplicationId] = useState("");

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
        console.error("User JSON Error:", error);
        user = null;
    }

    const userName = user?.name || "User";

    // =====================================================
    // GET DOCUMENTS
    // =====================================================

    const getDocuments = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await axios.get(
                "http://localhost:5000/api/documents",
                {
                    headers: {
                        Authorization: `Bearer ${ token } `,
                    },
                }
            );

            if (response.data?.success) {
                setDocuments(response.data.documents || []);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error("Get Documents Error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setMessage(
                error.response?.data?.message ||
                "Unable to load documents."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD DOCUMENTS
    // =====================================================

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        getDocuments();
    }, []);

    // =====================================================
    // FILTER DOCUMENTS
    // =====================================================

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) => {
            const name = doc.name || "";
            const type = doc.documentType || "";
            const status = doc.status || "pending";

            const searchText = search.toLowerCase();

            const matchesSearch =
                name.toLowerCase().includes(searchText) ||
                type.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                status.toLowerCase() ===
                    statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [documents, search, statusFilter]);

    // =====================================================
    // COUNTS
    // =====================================================

    const pendingCount = documents.filter(
        (doc) => doc.status === "pending"
    ).length;

    const verifiedCount = documents.filter(
        (doc) => doc.status === "verified"
    ).length;

    const rejectedCount = documents.filter(
        (doc) => doc.status === "rejected"
    ).length;

    // =====================================================
    // OPEN UPLOAD MODAL
    // =====================================================

    const openUploadModal = () => {
        setMessage("");
        setShowUpload(true);
    };

    // =====================================================
    // CLOSE UPLOAD MODAL
    // =====================================================

    const closeUploadModal = () => {
        if (uploading) return;

        setShowUpload(false);
        setSelectedFile(null);
        setDocumentName("");
        setDocumentType("");
        setApplicationId("");
        setMessage("");

        const fileInput =
            document.getElementById("document-file");

        if (fileInput) {
            fileInput.value = "";
        }
    };

    // =====================================================
    // FILE CHANGE
    // =====================================================

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            setMessage(
                "File size must be less than 10 MB."
            );

            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
        ];

        if (!allowedTypes.includes(file.type)) {
            setMessage(
                "Only PDF, JPG, JPEG and PNG files are allowed."
            );

            setSelectedFile(null);
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
        setMessage("");

        if (!documentName.trim()) {
            setDocumentName(
                file.name.replace(/\.[^/.]+$/, "")
            );
        }
    };

    // =====================================================
    // UPLOAD DOCUMENT
    // =====================================================

    const handleUpload = async (event) => {
        event.preventDefault();

        console.log("=================================");
        console.log("UPLOAD BUTTON CLICKED");
        console.log("=================================");

        // -----------------------------------------------
        // TOKEN CHECK
        // -----------------------------------------------

        if (!token) {
            setMessage("Please login again.");

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login");
            return;
        }

        // -----------------------------------------------
        // FILE CHECK
        // -----------------------------------------------

        if (!selectedFile) {
            setMessage("Please select a document.");
            return;
        }

        // -----------------------------------------------
        // NAME CHECK
        // -----------------------------------------------

        if (!documentName.trim()) {
            setMessage("Please enter document name.");
            return;
        }

        // -----------------------------------------------
        // TYPE CHECK
        // -----------------------------------------------

        if (!documentType) {
            setMessage("Please select document type.");
            return;
        }

        try {
            setUploading(true);
            setMessage("");

            // -------------------------------------------
            // FORM DATA
            // -------------------------------------------

            const formData = new FormData();

            formData.append(
                "document",
                selectedFile
            );

            formData.append(
                "name",
                documentName.trim()
            );

            formData.append(
                "documentType",
                documentType
            );

            if (applicationId.trim()) {
                formData.append(
                    "applicationId",
                    applicationId.trim()
                );
            }

            console.log(
                "File:",
                selectedFile.name
            );

            console.log(
                "File Type:",
                selectedFile.type
            );

            console.log(
                "File Size:",
                selectedFile.size
            );

            console.log(
                "Document Name:",
                documentName
            );

            console.log(
                "Document Type:",
                documentType
            );

            // -------------------------------------------
            // API REQUEST
            // -------------------------------------------

            const response = await axios.post(
                "http://localhost:5000/api/documents",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${ token } `,
                    },
                }
            );

            console.log(
                "Upload Response:",
                response.data
            );

            // -------------------------------------------
            // SUCCESS
            // -------------------------------------------

            if (response.data?.success) {
                const uploadedDocument =
                    response.data.document;

                setDocuments((prev) => [
                    uploadedDocument,
                    ...prev,
                ]);

                setMessage(
                    "Document uploaded successfully."
                );

                // Reset fields
                setDocumentName("");
                setDocumentType("");
                setApplicationId("");
                setSelectedFile(null);

                const fileInput =
                    document.getElementById(
                        "document-file"
                    );

                if (fileInput) {
                    fileInput.value = "";
                }

                // Close modal
                setShowUpload(false);
            } else {
                setMessage(
                    response.data?.message ||
                    "Document upload failed."
                );
            }
        } catch (error) {
            console.error(
                "================================="
            );

            console.error(
                "UPLOAD DOCUMENT ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "================================="
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setMessage(
                    "Session expired. Please login again."
                );

                navigate("/login");
                return;
            }

            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Unable to upload document."
            );
        } finally {
            setUploading(false);
        }
    };

    // =====================================================
    // DELETE DOCUMENT
    // =====================================================

    const handleDelete = async (documentId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmDelete) {
            return;
        }

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setMessage("");

            const response = await axios.delete(
                `http://localhost:5000/api/documents/${documentId}`,
{
    headers: {
        Authorization: `Bearer ${token}`,
                    },
}
            );

if (response.data?.success) {
    setDocuments((prev) =>
        prev.filter(
            (doc) =>
                doc._id !== documentId
        )
    );

    setMessage(
        "Document deleted successfully."
    );
} else {
    setMessage(
        response.data?.message ||
        "Unable to delete document."
    );
}
        } catch (error) {
    console.error(
        "Delete Document Error:",
        error
    );

    setMessage(
        error.response?.data?.message ||
        "Unable to delete document."
    );
}
    };

// =====================================================
// VIEW DOCUMENT
// =====================================================

const handleView = (url) => {
    if (!url) {
        setMessage(
            "Document file is not available."
        );
        return;
    }

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
};

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

// =====================================================
// STATUS LABEL
// =====================================================

const getStatusLabel = (status) => {
    if (status === "verified") {
        return "Verified";
    }

    if (status === "rejected") {
        return "Rejected";
    }

    return "Pending";
};

// =====================================================
// LOGOUT
// =====================================================

const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
};

// =====================================================
// JSX
// =====================================================

return (
    <div className="documents-page">

        {/* =================================================
                SIDEBAR
            ================================================= */}

        <aside className="documents-sidebar">

            <div className="documents-brand">

                <div className="documents-brand-logo">
                    🌿
                </div>

                <div>
                    <h2>Vyapar Sathi</h2>
                    <span>
                        Entrepreneur Portal
                    </span>
                </div>

            </div>

            <div className="documents-user">

                <div className="documents-avatar">
                    {userName
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div>
                    <strong>
                        {userName}
                    </strong>

                    <span>
                        Entrepreneur
                    </span>
                </div>

            </div>

            <nav className="documents-nav">

                <button
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <span>⌂</span>
                    Dashboard
                </button>

                <button
                    onClick={() =>
                        navigate("/ai-advisor")
                    }
                >
                    <span>✦</span>
                    AI Advisor
                </button>

                <button
                    onClick={() =>
                        navigate(
                            "/financial-calculator"
                        )
                    }
                >
                    <span>▣</span>
                    Financial Calculator
                </button>

                <button
                    onClick={() =>
                        navigate(
                            "/government-schemes"
                        )
                    }
                >
                    <span>▤</span>
                    Government Schemes
                </button>

                <button
                    onClick={() =>
                        navigate(
                            "/eligibility-checker"
                        )
                    }
                >
                    <span>✓</span>
                    Eligibility Checker
                </button>

                <button
                    onClick={() =>
                        navigate(
                            "/hyper-local-advisory"
                        )
                    }
                >
                    <span>⌖</span>
                    Hyper-Local Advisory
                </button>

                <button
                    onClick={() =>
                        navigate(
                            "/applications"
                        )
                    }
                >
                    <span>▥</span>
                    Applications
                </button>

                <button className="documents-nav-active">
                    <span>▱</span>
                    Documents
                </button>

                <button
                    onClick={() =>
                        navigate("/messages")
                    }
                >
                    <span>✉</span>
                    Messages
                    <b>3</b>
                </button>

                <div className="documents-account">
                    ACCOUNT
                </div>

                <button
                    onClick={() =>
                        navigate("/profile")
                    }
                >
                    <span>♙</span>
                    Profile & Settings
                </button>

            </nav>

            <div className="documents-sidebar-bottom">

                <div className="documents-help">

                    <span>✦</span>

                    <div>
                        <strong>
                            Need help?
                        </strong>

                        <small>
                            Ask our AI Advisor
                        </small>
                    </div>

                </div>

                <button
                    className="documents-logout"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    Logout
                </button>

                <small className="documents-version">
                    Vyapar Sathi AI v1.0
                </small>

            </div>

        </aside>

        {/* =================================================
                MAIN
            ================================================= */}

        <main className="documents-main">

            {/* =================================================
                    HEADER
                ================================================= */}

            <header className="documents-header">

                <div>
                    <p>
                        DOCUMENT MANAGEMENT
                    </p>

                    <h1>
                        My Documents
                    </h1>

                    <span>
                        Upload, manage and track your
                        business documents.
                    </span>
                </div>

                <div className="documents-header-actions">

                    <button
                        className="documents-notification"
                        onClick={() =>
                            setMessage(
                                "You have 3 notifications."
                            )
                        }
                    >
                        🔔
                    </button>

                    <button
                        className="documents-profile-button"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >

                        <div className="documents-header-avatar">
                            {userName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {userName}
                            </strong>

                            <span>
                                Entrepreneur
                            </span>
                        </div>

                        <span>⌄</span>

                    </button>

                </div>

            </header>

            {/* =================================================
                    CONTENT
                ================================================= */}

            <section className="documents-content">

                {/* MESSAGE */}

                {message && (
                    <div className="documents-message">

                        <span>
                            {message}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setMessage("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* TOP BAR */}

                <div className="documents-topbar">

                    <div>
                        <h2>
                            Your Documents
                        </h2>

                        <p>
                            Keep all your important
                            business documents organized
                            in one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="upload-document-button"
                        onClick={openUploadModal}
                    >
                        + Upload Document
                    </button>

                </div>

                {/* =================================================
                        STATS
                    ================================================= */}

                <div className="document-stat-grid">

                    <div className="document-stat-card">

                        <div className="document-stat-icon">
                            ▱
                        </div>

                        <div>
                            <span>
                                Total Documents
                            </span>

                            <strong>
                                {documents.length}
                            </strong>
                        </div>

                    </div>

                    <div className="document-stat-card">

                        <div className="document-stat-icon pending-icon">
                            ◷
                        </div>

                        <div>
                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>
                        </div>

                    </div>

                    <div className="document-stat-card">

                        <div className="document-stat-icon verified-icon">
                            ✓
                        </div>

                        <div>
                            <span>
                                Verified
                            </span>

                            <strong>
                                {verifiedCount}
                            </strong>
                        </div>

                    </div>

                    <div className="document-stat-card">

                        <div className="document-stat-icon rejected-icon">
                            !
                        </div>

                        <div>
                            <span>
                                Rejected
                            </span>

                            <strong>
                                {rejectedCount}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* =================================================
                        DOCUMENT LIST
                    ================================================= */}

                <div className="documents-list-card">

                    <div className="documents-list-header">

                        <div>
                            <h2>
                                Uploaded Documents
                            </h2>

                            <p>
                                Documents uploaded by
                                your account
                            </p>
                        </div>

                        <div className="document-filters">

                            <div className="document-search">

                                <span>⌕</span>

                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

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

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Verified">
                                    Verified
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>

                            </select>

                        </div>

                    </div>

                    {/* =================================================
                            LOADING
                        ================================================= */}

                    {loading ? (

                        <div className="documents-empty">

                            <div className="documents-loading">
                                Loading documents...
                            </div>

                        </div>

                    ) : filteredDocuments.length === 0 ? (

                        <div className="documents-empty">

                            <div className="documents-empty-icon">
                                ▱
                            </div>

                            <h3>
                                No documents found
                            </h3>

                            <p>
                                {documents.length === 0
                                    ? "Upload your first business document to get started."
                                    : "Try changing your search or status filter."}
                            </p>

                            {documents.length === 0 && (

                                <button
                                    type="button"
                                    onClick={openUploadModal}
                                >
                                    + Upload Document
                                </button>

                            )}

                        </div>

                    ) : (

                        <div className="documents-table-wrapper">

                            <div className="documents-table-head">

                                <span>
                                    DOCUMENT
                                </span>

                                <span>
                                    TYPE
                                </span>

                                <span>
                                    APPLICATION
                                </span>

                                <span>
                                    UPLOADED
                                </span>

                                <span>
                                    STATUS
                                </span>

                                <span>
                                    ACTION
                                </span>

                            </div>

                            {filteredDocuments.map(
                                (doc) => (

                                    <div
                                        className="documents-table-row"
                                        key={doc._id}
                                    >

                                        <div className="document-name-cell">

                                            <div className="document-file-icon">
                                                📄
                                            </div>

                                            <div>

                                                <strong>
                                                    {doc.name}
                                                </strong>

                                                {doc.fileName && (

                                                    <small>
                                                        {doc.fileName}
                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                        <span>
                                            {doc.documentType ||
                                                "General"}
                                        </span>

                                        <span>
                                            {doc.applicationNumber ||
                                                "Not linked"}
                                        </span>

                                        <span>
                                            {formatDate(
                                                doc.createdAt
                                            )}
                                        </span>

                                        <span
                                            className={`document-status ${doc.status ||
                                                "pending"
                                                }`}
                                        >
                                            <i></i>

                                            {getStatusLabel(
                                                doc.status
                                            )}

                                        </span>

                                        <div className="document-actions">

                                            <button
                                                type="button"
                                                title="View document"
                                                onClick={() =>
                                                    handleView(
                                                        doc.url
                                                    )
                                                }
                                            >
                                                👁
                                            </button>

                                            <button
                                                type="button"
                                                title="Delete document"
                                                onClick={() =>
                                                    handleDelete(
                                                        doc._id
                                                    )
                                                }
                                            >
                                                🗑
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

                {/* =================================================
                        INFO
                    ================================================= */}

                <div className="documents-info-card">

                    <div className="documents-info-icon">
                        🔒
                    </div>

                    <div>

                        <strong>
                            Your documents are protected
                        </strong>

                        <p>
                            Documents are associated with
                            your account and are only
                            accessible to you through
                            authenticated access.
                        </p>

                    </div>

                </div>

            </section>

        </main>

        {/* =================================================
                UPLOAD MODAL
            ================================================= */}

        {showUpload && (

            <div
                className="upload-modal-overlay"
                onClick={closeUploadModal}
            >

                <div
                    className="upload-modal"
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                >

                    {/* MODAL HEADER */}

                    <div className="upload-modal-header">

                        <div>

                            <h2>
                                Upload Document
                            </h2>

                            <p>
                                Add a document to your
                                document vault.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={closeUploadModal}
                            disabled={uploading}
                        >
                            ×
                        </button>

                    </div>

                    {/* FORM */}

                    <form
                        onSubmit={handleUpload}
                        encType="multipart/form-data"
                    >

                        {/* DOCUMENT NAME */}

                        <label>
                            Document Name
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Aadhaar Card"
                            value={documentName}
                            onChange={(e) =>
                                setDocumentName(
                                    e.target.value
                                )
                            }
                            disabled={uploading}
                        />

                        {/* DOCUMENT TYPE */}

                        <label>
                            Document Type
                        </label>

                        <select
                            value={documentType}
                            onChange={(e) =>
                                setDocumentType(
                                    e.target.value
                                )
                            }
                            disabled={uploading}
                        >

                            <option value="">
                                Select document type
                            </option>

                            <option value="Aadhaar Card">
                                Aadhaar Card
                            </option>

                            <option value="PAN Card">
                                PAN Card
                            </option>

                            <option value="Bank Statement">
                                Bank Statement
                            </option>

                            <option value="GST Certificate">
                                GST Certificate
                            </option>

                            <option value="Business Proof">
                                Business Proof
                            </option>

                            <option value="Income Proof">
                                Income Proof
                            </option>

                            <option value="Address Proof">
                                Address Proof
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                        {/* APPLICATION NUMBER */}

                        <label>
                            Application Number
                            <span>
                                (Optional)
                            </span>
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. VY-2026-123456"
                            value={applicationId}
                            onChange={(e) =>
                                setApplicationId(
                                    e.target.value
                                )
                            }
                            disabled={uploading}
                        />

                        {/* FILE */}

                        <label className="file-upload-label">
                            Select File
                        </label>

                        <div className="file-upload-box">

                            <input
                                id="document-file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />

                            <div>

                                <span>
                                    📄
                                </span>

                                {selectedFile ? (

                                    <>

                                        <strong>
                                            {selectedFile.name}
                                        </strong>

                                        <small>
                                            {(
                                                selectedFile.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </small>

                                    </>

                                ) : (

                                    <>

                                        <strong>
                                            Click to select a file
                                        </strong>

                                        <small>
                                            PDF, JPG, JPEG or PNG ·
                                            Maximum 10 MB
                                        </small>

                                    </>

                                )}

                            </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="upload-modal-actions">

                            <button
                                type="button"
                                className="cancel-upload"
                                onClick={closeUploadModal}
                                disabled={uploading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="submit-upload"
                                disabled={uploading}
                            >

                                {uploading
                                    ? "Uploading..."
                                    : "Upload Document"}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        )}

    </div>
);
};

export default Documents;