const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middlewares.js");
const reservationController = require("../controllers/reservations.js");
const paymentController = require("../controllers/payments.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Reservation routes
router.post("/", isLoggedIn, wrapAsync(reservationController.createReservation));
router.get("/:reservationId/confirmation", isLoggedIn, wrapAsync(reservationController.showReservation));

// Payment routes
router.post("/payment/create", isLoggedIn, wrapAsync(paymentController.createPaymentOrder));

module.exports = router;