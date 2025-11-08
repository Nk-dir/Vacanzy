const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares.js");
const dashboardController = require("../controllers/dashboard.js");
const wrapAsync = require("../utils/wrapAsync.js");

// User dashboard - show booking history
router.get("/", isLoggedIn, wrapAsync(dashboardController.showDashboard));

// User profile
router.get("/profile", isLoggedIn, wrapAsync(dashboardController.showProfile));

// Update profile
router.post("/profile/update", isLoggedIn, wrapAsync(dashboardController.updateProfile));

module.exports = router;