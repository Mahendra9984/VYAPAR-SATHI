import React, { useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import {
    FaCheck,
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import "./Register.css";


const Register = () => {

    const navigate = useNavigate();


    // =========================
    // PASSWORD VISIBILITY
    // =========================

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // =========================
    // FORM DATA
    // =========================

    const [formData, setFormData] = useState({

        fullName: "",

        email: "",

        password: "",

        confirmPassword: "",

    });


    // =========================
    // HANDLE INPUT CHANGE
    // =========================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

    };


    // =========================
    // REGISTER USER
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // Check password

        if (formData.password !== formData.confirmPassword) {

            alert("Passwords do not match");

            return;

        }


        try {

            // Send data to backend

            const response = await axios.post(

                "http://localhost:5000/api/users/register",

                {

                    name: formData.fullName,

                    email: formData.email,

                    password: formData.password

                }

            );


            // Backend response

            console.log(response.data);


            // Registration successful

            alert("Registration Successful");


            // Go to login page

            navigate("/login");


        } catch (error) {

            console.log("Registration Error:", error);


            alert(

                error.response?.data?.message ||

                "Registration failed"

            );

        }

    };


    return (

        <div className="register-page">


            {/* =========================
                LEFT SIDE
            ========================= */}

            <div className="register-left">


                <div className="register-brand">

                    <div className="register-brand-icon">

                        ₹

                    </div>


                    <div>

                        <h2>

                            Vyapar-Sathi

                        </h2>


                        <span>

                            Smart Business. Stronger Rural India.

                        </span>

                    </div>

                </div>



                <div className="register-left-content">


                    <span className="register-label">

                        JOIN Vyapar Sathi AI

                    </span>


                    <h1>

                        Start building your

                        <span>

                            business today.

                        </span>

                    </h1>


                    <p>

                        Create your account and get personalized guidance,

                        government scheme recommendations and financial support

                        for your business.

                    </p>



                    <div className="register-benefits">


                        <div>

                            <span className="benefit-check">

                                <FaCheck />

                            </span>


                            <p>

                                Personalized AI business guidance

                            </p>

                        </div>



                        <div>

                            <span className="benefit-check">

                                <FaCheck />

                            </span>


                            <p>

                                Discover suitable government schemes

                            </p>

                        </div>



                        <div>

                            <span className="benefit-check">

                                <FaCheck />

                            </span>


                            <p>

                                Plan your finances with confidence

                            </p>

                        </div>


                    </div>

                </div>



                <div className="register-left-bottom">

                    <span>

                        Empowering rural entrepreneurs

                    </span>


                    <span>

                        •

                    </span>


                    <span>

                        Building stronger businesses

                    </span>

                </div>

            </div>



            {/* =========================
                RIGHT SIDE
            ========================= */}

            <div className="register-right">


                {/* BACK HOME */}

                <button

                    type="button"

                    className="back-home-btn"

                    onClick={() => navigate("/")}

                >

                    <FaArrowLeft />

                    Back to Home

                </button>



                <div className="register-card">


                    {/* CARD HEADER */}

                    <div className="register-card-header">


                        <div className="register-card-icon">

                            <FaUser />

                        </div>


                        <h2>

                            Create Your Account

                        </h2>


                        <p>

                            Join RuralBiz AI and grow your business

                        </p>

                    </div>



                    {/* =========================
                        REGISTER FORM
                    ========================= */}

                    <form onSubmit={handleSubmit}>


                        {/* FULL NAME */}

                        <div className="form-group">


                            <label>

                                Full Name

                            </label>


                            <div className="input-wrapper">


                                <FaUser className="input-icon" />


                                <input

                                    type="text"

                                    name="fullName"

                                    placeholder="Enter your full name"

                                    value={formData.fullName}

                                    onChange={handleChange}

                                    required

                                />

                            </div>

                        </div>



                        {/* EMAIL */}

                        <div className="form-group">


                            <label>

                                Email Address

                            </label>


                            <div className="input-wrapper">


                                <FaEnvelope className="input-icon" />


                                <input

                                    type="email"

                                    name="email"

                                    placeholder="Enter your email"

                                    value={formData.email}

                                    onChange={handleChange}

                                    required

                                />

                            </div>

                        </div>



                        {/* PASSWORD */}

                        <div className="form-group">


                            <label>

                                Password

                            </label>


                            <div className="input-wrapper">


                                <FaLock className="input-icon" />


                                <input

                                    type={

                                        showPassword

                                            ? "text"

                                            : "password"

                                    }

                                    name="password"

                                    placeholder="Create a password"

                                    value={formData.password}

                                    onChange={handleChange}

                                    required

                                />


                                <button

                                    type="button"

                                    className="password-toggle"

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



                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">


                            <label>

                                Confirm Password

                            </label>


                            <div className="input-wrapper">


                                <FaLock className="input-icon" />


                                <input

                                    type={

                                        showConfirmPassword

                                            ? "text"

                                            : "password"

                                    }

                                    name="confirmPassword"

                                    placeholder="Confirm your password"

                                    value={formData.confirmPassword}

                                    onChange={handleChange}

                                    required

                                />


                                <button

                                    type="button"

                                    className="password-toggle"

                                    onClick={() =>

                                        setShowConfirmPassword(

                                            !showConfirmPassword

                                        )

                                    }

                                >

                                    {showConfirmPassword ? (

                                        <FaEyeSlash />

                                    ) : (

                                        <FaEye />

                                    )}

                                </button>

                            </div>

                        </div>



                        {/* TERMS */}

                        <div className="terms-row">


                            <input

                                type="checkbox"

                                id="terms"

                                required

                            />


                            <label htmlFor="terms">

                                I agree to the{" "}

                                <span>

                                    Terms & Conditions

                                </span>{" "}

                                and{" "}

                                <span>

                                    Privacy Policy

                                </span>

                            </label>

                        </div>



                        {/* REGISTER BUTTON */}

                        <button

                            type="submit"

                            className="register-submit-btn"

                        >

                            Create Account


                            <span>

                                →

                            </span>

                        </button>


                    </form>



                    {/* LOGIN */}

                    <div className="login-section">


                        <span>

                            Already have an account?

                        </span>


                        <button

                            type="button"

                            onClick={() => navigate("/login")}

                        >

                            Login

                        </button>

                    </div>


                </div>



                {/* FOOTER */}

                <p className="register-footer">

                    © 2026 Vyapar Sathi AI. Empowering rural entrepreneurs.

                </p>


            </div>

        </div>

    );

};


export default Register;