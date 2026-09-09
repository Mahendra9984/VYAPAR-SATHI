// Server/controller/financialCalculatorController.js

// ======================================================
// FINANCIAL CALCULATOR CONTROLLER
// ======================================================

// Helper: number validation
const isValidNumber = (value) => {
    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value))
    );
};

// Helper: round result
const round = (value, decimals = 2) => {
    return Number(Number(value).toFixed(decimals));
};

// ======================================================
// MAIN CALCULATOR
// ======================================================

export const calculateFinancialData = async (req, res) => {
    try {
        const {
            calculatorType,
            principal,
            annualRate,
            tenure,
            costPrice,
            sellingPrice,
            investment,
            returnAmount
        } = req.body;

        if (!calculatorType) {
            return res.status(400).json({
                success: false,
                message: "Calculator type is required"
            });
        }

        // ==================================================
        // EMI CALCULATOR
        // ==================================================

        if (calculatorType === "emi") {
            if (
                !isValidNumber(principal) ||
                !isValidNumber(annualRate) ||
                !isValidNumber(tenure)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Principal, annual rate and tenure are required"
                });
            }

            const P = Number(principal);
            const annualInterest = Number(annualRate);
            const years = Number(tenure);

            if (P <= 0 || annualInterest < 0 || years <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Principal and tenure must be greater than zero"
                });
            }

            const monthlyRate = annualInterest / 12 / 100;
            const numberOfMonths = years * 12;

            let emi;

            if (monthlyRate === 0) {
                emi = P / numberOfMonths;
            } else {
                emi =
                    (P *
                        monthlyRate *
                        Math.pow(
                            1 + monthlyRate,
                            numberOfMonths
                        )) /
                    (Math.pow(
                        1 + monthlyRate,
                        numberOfMonths
                    ) - 1);
            }

            const totalPayment = emi * numberOfMonths;
            const totalInterest = totalPayment - P;

            return res.status(200).json({
                success: true,
                calculatorType: "emi",
                result: {
                    principal: round(P),
                    annualRate: round(annualInterest),
                    tenureYears: years,
                    tenureMonths: numberOfMonths,
                    monthlyEMI: round(emi),
                    totalInterest: round(totalInterest),
                    totalPayment: round(totalPayment)
                }
            });
        }

        // ==================================================
        // PROFIT CALCULATOR
        // ==================================================

        if (calculatorType === "profit") {
            if (
                !isValidNumber(costPrice) ||
                !isValidNumber(sellingPrice)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Cost price and selling price are required"
                });
            }

            const cost = Number(costPrice);
            const selling = Number(sellingPrice);

            if (cost <= 0 || selling < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Cost price must be greater than zero"
                });
            }

            const profitOrLoss = selling - cost;

            const percentage =
                (Math.abs(profitOrLoss) / cost) * 100;

            const type =
                profitOrLoss > 0
                    ? "profit"
                    : profitOrLoss < 0
                        ? "loss"
                        : "no-profit-no-loss";

            return res.status(200).json({
                success: true,
                calculatorType: "profit",
                result: {
                    costPrice: round(cost),
                    sellingPrice: round(selling),
                    profitOrLoss: round(profitOrLoss),
                    percentage: round(percentage),
                    type
                }
            });
        }

        // ==================================================
        // ROI CALCULATOR
        // ==================================================

        if (calculatorType === "roi") {
            if (
                !isValidNumber(investment) ||
                !isValidNumber(returnAmount)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Investment and return amount are required"
                });
            }

            const initialInvestment = Number(investment);
            const finalReturn = Number(returnAmount);

            if (initialInvestment <= 0 || finalReturn < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Investment must be greater than zero"
                });
            }

            const gain = finalReturn - initialInvestment;

            const roi =
                (gain / initialInvestment) * 100;

            return res.status(200).json({
                success: true,
                calculatorType: "roi",
                result: {
                    investment: round(initialInvestment),
                    returnAmount: round(finalReturn),
                    gain: round(gain),
                    roiPercentage: round(roi)
                }
            });
        }

        // ==================================================
        // SIMPLE INTEREST CALCULATOR
        // ==================================================

        if (calculatorType === "simple-interest") {
            if (
                !isValidNumber(principal) ||
                !isValidNumber(annualRate) ||
                !isValidNumber(tenure)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Principal, annual rate and tenure are required"
                });
            }

            const P = Number(principal);
            const R = Number(annualRate);
            const T = Number(tenure);

            if (P <= 0 || R < 0 || T <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid principal, rate or tenure"
                });
            }

            const simpleInterest =
                (P * R * T) / 100;

            const totalAmount =
                P + simpleInterest;

            return res.status(200).json({
                success: true,
                calculatorType: "simple-interest",
                result: {
                    principal: round(P),
                    annualRate: round(R),
                    tenureYears: T,
                    simpleInterest: round(simpleInterest),
                    totalAmount: round(totalAmount)
                }
            });
        }

        // ==================================================
        // INVALID CALCULATOR
        // ==================================================

        return res.status(400).json({
            success: false,
            message: "Invalid calculator type"
        });

    } catch (error) {
        console.error(
            "Financial Calculator Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Financial calculation failed"
        });
    }
};