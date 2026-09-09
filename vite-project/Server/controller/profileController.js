import User from "../model/User.js";
import bcrypt from "bcryptjs";

// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = async (req, res) => {
    try {
        const userId = req.user;

        
    const user = await User.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
    }

    return res.status(200).json({
        success: true,
        user,
    });
} catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to load profile.",
        error: error.message,
    });
}


    };

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    export const updateProfile = async (req, res) => {
        try {
            const userId = req.user;

            
    const { name, email } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Name is required.",
        });
    }

    if (!email || !email.trim()) {
        return res.status(400).json({
            success: false,
            message: "Email is required.",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
    });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email is already registered with another account.",
        });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            name: name.trim(),
            email: normalizedEmail,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user,
    });
} catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to update profile.",
        error: error.message,
    });
}


        };

        // =====================================================
        // CHANGE PASSWORD
        // =====================================================

        export const changePassword = async (req, res) => {
            try {
                const userId = req.user;

            
    const {
        currentPassword,
        newPassword,
        confirmPassword,
    } = req.body;

    if (!currentPassword) {
        return res.status(400).json({
            success: false,
            message: "Current password is required.",
        });
    }

    if (!newPassword) {
        return res.status(400).json({
            success: false,
            message: "New password is required.",
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message:
                "New password must be at least 6 characters long.",
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "New passwords do not match.",
        });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
    }

    const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Current password is incorrect.",
        });
    }

    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        return res.status(400).json({
            success: false,
            message:
                "New password must be different from current password.",
        });
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password changed successfully.",
    });
} catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to change password.",
        error: error.message,
    });
}


            };
