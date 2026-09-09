const express = require("express");

const router = express.Router();

const {
    createApplication,
    getMyApplications,
    getApplicationById,
    updateApplication,
    cancelApplication,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");


// Create new application
router.post(
    "/",
    protect,
    createApplication
);


// Get logged-in user's applications
router.get(
    "/my-applications",
    protect,
    getMyApplications
);


// Get single application
router.get(
    "/:id",
    protect,
    getApplicationById
);


// Update application
router.put(
    "/:id",
    protect,
    updateApplication
);


// Cancel application
router.patch(
    "/:id/cancel",
    protect,
    cancelApplication
);


module.exports = router;