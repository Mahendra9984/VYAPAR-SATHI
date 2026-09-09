import React, { useState } from "react";
import "./FinancialCalculator.css";

const API_URL =
    "http://localhost:5000/api/financial-calculator/calculate";

const FinancialCalculator = () => {
    const [calculatorType, setCalculatorType] = useState("emi");

    const [formData, setFormData] = useState({
        principal: "",
        annualRate: "",
        tenure: "",
        costPrice: "",
        sellingPrice: "",
        investment: "",
        returnAmount: ""
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setResult(null);
        setError("");
    };

    // =====================================================
    // CHANGE CALCULATOR
    // =====================================================

    const handleCalculatorChange = (e) => {
        setCalculatorType(e.target.value);

        setResult(null);
        setError("");
    };

    // =====================================================
    // CALCULATE
    // =====================================================

    const handleCalculate = async (e) => {
        e.preventDefault();

        setLoading(true);
        setResult(null);
        setError("");

        try {
            let body = {
                calculatorType
            };

            if (calculatorType === "emi") {
                body = {
                    calculatorType,
                    principal: formData.principal,
                    annualRate: formData.annualRate,
                    tenure: formData.tenure
                };
            }

            if (calculatorType === "simple-interest") {
                body = {
                    calculatorType,
                    principal: formData.principal,
                    annualRate: formData.annualRate,
                    tenure: formData.tenure
                };
            }

            if (calculatorType === "profit") {
                body = {
                    calculatorType,
                    costPrice: formData.costPrice,
                    sellingPrice: formData.sellingPrice
                };
            }

            if (calculatorType === "roi") {
                body = {
                    calculatorType,
                    investment: formData.investment,
                    returnAmount: formData.returnAmount
                };
            }

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            console.log("Financial Calculator Response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Calculation failed"
                );
            }

            setResult(data.result);
        } catch (error) {
            console.error(
                "Financial Calculator Error:",
                error
            );

            setError(
                error.message ||
                "Unable to calculate. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // RESET
    // =====================================================

    const handleReset = () => {
        setFormData({
            principal: "",
            annualRate: "",
            tenure: "",
            costPrice: "",
            sellingPrice: "",
            investment: "",
            returnAmount: ""
        });

        setResult(null);
        setError("");
    };

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (value) => {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return "—";
        }

        return `₹${Number(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // =====================================================
    // RENDER INPUTS
    // =====================================================

    const renderInputs = () => {
        if (
            calculatorType === "emi" ||
            calculatorType === "simple-interest"
        ) {
            return (
                <>
                    <div className="calculator-input-group">
                        <label>Principal Amount</label>

                        <input
                            type="number"
                            name="principal"
                            value={formData.principal}
                            onChange={handleChange}
                            placeholder="Enter principal amount"
                            min="0"
                            step="any"
                            required
                        />
                    </div>

                    <div className="calculator-input-group">
                        <label>Annual Interest Rate (%)</label>

                        <input
                            type="number"
                            name="annualRate"
                            value={formData.annualRate}
                            onChange={handleChange}
                            placeholder="Enter annual interest rate"
                            min="0"
                            step="any"
                            required
                        />
                    </div>

                    <div className="calculator-input-group">
                        <label>Tenure (Years)</label>

                        <input
                            type="number"
                            name="tenure"
                            value={formData.tenure}
                            onChange={handleChange}
                            placeholder="Enter tenure in years"
                            min="0.1"
                            step="any"
                            required
                        />
                    </div>
                </>
            );
        }

        if (calculatorType === "profit") {
            return (
                <>
                    <div className="calculator-input-group">
                        <label>Cost Price</label>

                        <input
                            type="number"
                            name="costPrice"
                            value={formData.costPrice}
                            onChange={handleChange}
                            placeholder="Enter cost price"
                            min="0"
                            step="any"
                            required
                        />
                    </div>

                    <div className="calculator-input-group">
                        <label>Selling Price</label>

                        <input
                            type="number"
                            name="sellingPrice"
                            value={formData.sellingPrice}
                            onChange={handleChange}
                            placeholder="Enter selling price"
                            min="0"
                            step="any"
                            required
                        />
                    </div>
                </>
            );
        }

        if (calculatorType === "roi") {
            return (
                <>
                    <div className="calculator-input-group">
                        <label>Investment Amount</label>

                        <input
                            type="number"
                            name="investment"
                            value={formData.investment}
                            onChange={handleChange}
                            placeholder="Enter investment amount"
                            min="0"
                            step="any"
                            required
                        />
                    </div>

                    <div className="calculator-input-group">
                        <label>Return Amount</label>

                        <input
                            type="number"
                            name="returnAmount"
                            value={formData.returnAmount}
                            onChange={handleChange}
                            placeholder="Enter final return amount"
                            min="0"
                            step="any"
                            required
                        />
                    </div>
                </>
            );
        }

        return null;
    };

    // =====================================================
    // RENDER RESULT
    // =====================================================

    const renderResult = () => {
        if (!result) {
            return null;
        }

        if (calculatorType === "emi") {
            return (
                <div className="calculator-result">
                    <h2>EMI Calculation Result</h2>

                    <div className="result-grid">
                        <div className="result-card">
                            <span>Monthly EMI</span>
                            <strong>
                                {formatCurrency(
                                    result.monthlyEMI
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Total Interest</span>
                            <strong>
                                {formatCurrency(
                                    result.totalInterest
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Total Payment</span>
                            <strong>
                                {formatCurrency(
                                    result.totalPayment
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Loan Tenure</span>
                            <strong>
                                {result.tenureYears} Years
                            </strong>
                        </div>
                    </div>
                </div>
            );
        }

        if (calculatorType === "simple-interest") {
            return (
                <div className="calculator-result">
                    <h2>Simple Interest Result</h2>

                    <div className="result-grid">
                        <div className="result-card">
                            <span>Principal</span>
                            <strong>
                                {formatCurrency(
                                    result.principal
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Simple Interest</span>
                            <strong>
                                {formatCurrency(
                                    result.simpleInterest
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Total Amount</span>
                            <strong>
                                {formatCurrency(
                                    result.totalAmount
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Interest Rate</span>
                            <strong>
                                {result.annualRate}%
                            </strong>
                        </div>
                    </div>
                </div>
            );
        }

        if (calculatorType === "profit") {
            return (
                <div className="calculator-result">
                    <h2>Profit / Loss Result</h2>

                    <div className="result-grid">
                        <div className="result-card">
                            <span>Cost Price</span>
                            <strong>
                                {formatCurrency(
                                    result.costPrice
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Selling Price</span>
                            <strong>
                                {formatCurrency(
                                    result.sellingPrice
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Profit / Loss</span>
                            <strong>
                                {formatCurrency(
                                    result.profitOrLoss
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Percentage</span>
                            <strong>
                                {result.percentage}%
                            </strong>
                        </div>
                    </div>
                </div>
            );
        }

        if (calculatorType === "roi") {
            return (
                <div className="calculator-result">
                    <h2>ROI Result</h2>

                    <div className="result-grid">
                        <div className="result-card">
                            <span>Investment</span>
                            <strong>
                                {formatCurrency(
                                    result.investment
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Return Amount</span>
                            <strong>
                                {formatCurrency(
                                    result.returnAmount
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>Gain / Loss</span>
                            <strong>
                                {formatCurrency(
                                    result.gain
                                )}
                            </strong>
                        </div>

                        <div className="result-card">
                            <span>ROI</span>
                            <strong>
                                {result.roiPercentage}%
                            </strong>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="financial-calculator-page">
            <div className="financial-calculator-container">

                <div className="calculator-header">
                    <span className="calculator-badge">
                        Financial Tools
                    </span>

                    <h1>
                        Financial Calculator
                    </h1>

                    <p>
                        Calculate your financial requirements
                        with accurate server-side calculations.
                    </p>
                </div>

                <div className="calculator-card">

                    <div className="calculator-type-group">
                        <label>
                            Select Calculator
                        </label>

                        <select
                            value={calculatorType}
                            onChange={
                                handleCalculatorChange
                            }
                        >
                            <option value="emi">
                                EMI Calculator
                            </option>

                            <option value="simple-interest">
                                Simple Interest Calculator
                            </option>

                            <option value="profit">
                                Profit / Loss Calculator
                            </option>

                            <option value="roi">
                                ROI Calculator
                            </option>
                        </select>
                    </div>

                    <form onSubmit={handleCalculate}>

                        <div className="calculator-input-grid">
                            {renderInputs()}
                        </div>

                        {error && (
                            <div className="calculator-error">
                                {error}
                            </div>
                        )}

                        <div className="calculator-actions">

                            <button
                                type="submit"
                                disabled={loading}
                                className="calculate-btn"
                            >
                                {loading
                                    ? "Calculating..."
                                    : "Calculate"}
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="reset-btn"
                            >
                                Reset
                            </button>

                        </div>
                    </form>
                </div>

                {renderResult()}

            </div>
        </div>
    );
};

export default FinancialCalculator;