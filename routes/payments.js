const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares.js");
const paymentController = require("../controllers/payments.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Global payment routes
router.post("/verify", isLoggedIn, wrapAsync(paymentController.verifyPayment));
router.post("/failure", isLoggedIn, wrapAsync(paymentController.handlePaymentFailure));

module.exports = router;