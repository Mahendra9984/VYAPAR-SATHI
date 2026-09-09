import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./component/LandingPage.jsx";
import Register from "./component/Register.jsx";
import Login from "./component/Login.jsx";
import Dashboard from "./component/EntrepreneurDashboard.jsx";
import AIAdvisor from "./component/AIAdvisor.jsx";
import GovernmentSchemes from "./component/GovernmentSchemes.jsx";
import FinancialCalculator from "./FinancialCalculator.jsx";
import EligibilityChecker from "./component/EligibilityChecker.jsx";
import ApplicationPage from "./component/ApplicationPage.jsx";
import Documents from "./component/Documents.jsx";
import ProfileSetting from "./component/ProfileSetting.jsx";
import AdminDashboard from "./component/AdminDashboard.jsx";
import HyperLocalAdvisory from "./component/HyperLocalAdvisory.jsx";

// =====================================================
// USER PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =====================================================
// ADMIN ONLY ROUTE
// =====================================================

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    console.error("Invalid user data:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
                    PUBLIC PAGES
                ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================================
                    USER DASHBOARD
                ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    AI ADVISOR
                ===================================================== */}

        <Route
          path="/ai-advisor"
          element={
            <ProtectedRoute>
              <AIAdvisor />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    GOVERNMENT SCHEMES
                ===================================================== */}

        <Route
          path="/government-schemes"
          element={
            <ProtectedRoute>
              <GovernmentSchemes />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    FINANCIAL CALCULATOR
                ===================================================== */}

        <Route
          path="/financial-calculator"
          element={
            <ProtectedRoute>
              <FinancialCalculator />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    ELIGIBILITY CHECKER
                ===================================================== */}

        <Route
          path="/eligibility-checker"
          element={
            <ProtectedRoute>
              <EligibilityChecker />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    APPLICATIONS
                ===================================================== */}

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <ApplicationPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    DOCUMENTS
                ===================================================== */}

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    PROFILE
                ===================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSetting />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    HYPER-LOCAL ADVISORY
                ===================================================== */}

        <Route
          path="/hyper-local-advisory"
          element={
            <ProtectedRoute>
              <HyperLocalAdvisory />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
                    ADMIN DASHBOARD
                ===================================================== */}

        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* =====================================================
                    UNKNOWN URL
                ===================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;