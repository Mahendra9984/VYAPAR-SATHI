// controller/eligibilityController.js

const schemes = [
    {
        id: "pm-kisan",
        name: "PM-KISAN",
        description:
            "Eligible landholding farmer families ke liye income support scheme.",
        category: "Agriculture",
        eligibility: {
            occupations: ["farmer"],
            maxIncome: null,
            requiresLand: true
        },
        documents: [
            "Aadhaar Card",
            "Land Record",
            "Bank Account Details"
        ]
    },

    {
        id: "mudra-shishu",
        name: "Pradhan Mantri MUDRA Yojana - Shishu",
        description:
            "Small businesses aur micro enterprises ke liye business finance option.",
        category: "Business",
        eligibility: {
            occupations: [
                "business",
                "entrepreneur",
                "self-employed"
            ],
            maxIncome: null,
            requiresLand: false
        },
        documents: [
            "Aadhaar Card",
            "PAN Card",
            "Bank Account Details",
            "Business Related Documents"
        ]
    },

    {
        id: "pmegp",
        name: "PMEGP",
        description:
            "New micro-enterprises establish karne ke liye credit-linked assistance programme.",
        category: "Business",
        eligibility: {
            occupations: [
                "business",
                "entrepreneur",
                "self-employed"
            ],
            maxIncome: null,
            requiresLand: false
        },
        documents: [
            "Aadhaar Card",
            "PAN Card",
            "Project Report",
            "Bank Account Details"
        ]
    }
];

const checkEligibility = async (req, res) => {
    try {
        const {
            age,
            state,
            occupation,
            annualIncome,
            hasLand,
            businessType
        } = req.body;

        // Basic validation
        if (!age || !state || !occupation) {
            return res.status(400).json({
                success: false,
                message: "Age, state and occupation are required"
            });
        }

        const userAge = Number(age);
        const income =
            annualIncome === "" || annualIncome == null
                ? null
                : Number(annualIncome);

        const userOccupation = String(occupation)
            .trim()
            .toLowerCase();

        const results = schemes.map((scheme) => {
            const reasons = [];
            const failedRules = [];

            const rules = scheme.eligibility;

            // Age check
            if (userAge < 18) {
                failedRules.push("Applicant must be 18 years or older.");
            } else {
                reasons.push("Age requirement satisfied.");
            }

            // Occupation check
            if (
                rules.occupations.length > 0 &&
                !rules.occupations.includes(userOccupation)
            ) {
                failedRules.push(
                    `Occupation should be related to: ${rules.occupations.join(", ")}.`
                );
            } else {
                reasons.push("Occupation requirement matched.");
            }

            // Land check
            if (rules.requiresLand) {
                if (hasLand !== true) {
                    failedRules.push(
                        "This scheme requires eligible agricultural landholding."
                    );
                } else {
                    reasons.push("Land requirement satisfied.");
                }
            }

            // Income check
            if (
                rules.maxIncome !== null &&
                income !== null &&
                income > rules.maxIncome
            ) {
                failedRules.push(
                    `Annual income should not exceed ₹${rules.maxIncome}.`
                );
            }

            let status = "Eligible";

            if (failedRules.length > 0) {
                status = "Not Eligible";
            }

            return {
                schemeId: scheme.id,
                schemeName: scheme.name,
                category: scheme.category,
                status,
                reasons,
                failedRules,
                documents: scheme.documents,
                note:
                    "Final eligibility official scheme guidelines aur concerned authority se verify karein."
            };
        });

        const eligibleSchemes = results.filter(
            (item) => item.status === "Eligible"
        );

        const notEligibleSchemes = results.filter(
            (item) => item.status === "Not Eligible"
        );

        return res.status(200).json({
            success: true,
            userDetails: {
                age: userAge,
                state,
                occupation: userOccupation,
                annualIncome: income,
                hasLand: Boolean(hasLand),
                businessType: businessType || null
            },
            summary: {
                totalSchemesChecked: results.length,
                eligible: eligibleSchemes.length,
                notEligible: notEligibleSchemes.length
            },
            results
        });

    } catch (error) {
        console.error("Eligibility Check Error:", error);

        return res.status(500).json({
            success: false,
            message: "Eligibility check failed",
            error: error.message
        });
    }
};

export { checkEligibility };