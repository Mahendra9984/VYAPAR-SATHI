import Support from "../model/Support.js";
import User from "../model/User.js";

// CREATE SUPPORT REQUEST
export const createSupportRequest = async (req, res) => {
    try {
        const { subject, category, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject and message are required.",
            });
        }

        const user = await User.findById(req.user).select(
            "name email"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const support = await Support.create({
            user: user._id,
            name: user.name,
            email: user.email,
            category: category || "General",
            subject: subject.trim(),
            message: message.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Support request submitted successfully.",
            support,
        });
    } catch (error) {
        console.error("Create Support Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit support request.",
            error: error.message,
        });
    }
};

// GET USER'S SUPPORT REQUESTS
export const getMySupportRequests = async (req, res) => {
    try {
        const requests = await Support.find({
            user: req.user,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        console.error("Get Support Requests Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load support requests.",
            error: error.message,
        });
    }
};