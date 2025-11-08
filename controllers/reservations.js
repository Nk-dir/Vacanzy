const Listing = require("../models/listing");
const Reservation = require("../models/reservation");
const { calculateServiceFee, calculateTax } = require("../utils/fees");

module.exports.showReservation = async (req, res) => {
    const { reservationId } = req.params;
    try {
        const reservation = await Reservation.findById(reservationId).populate('listing').populate('guest');
        
        if (!reservation) {
            req.flash("error", "Reservation not found");
            return res.redirect("/listings");
        }

        // Check if the user owns this reservation
        if (!reservation.guest._id.equals(req.user._id)) {
            req.flash("error", "You don't have permission to view this reservation");
            return res.redirect("/listings");
        }

        // Only show confirmed reservations (after successful payment)
        if (reservation.status !== 'confirmed') {
            req.flash("error", "Reservation is not confirmed yet");
            return res.redirect("/listings");
        }

        res.render("reservations/success", { 
            listing: reservation.listing, 
            reservation: reservation,
            userEmail: req.user.email,
            userName: req.user.username
        });
    } catch (error) {
        console.error("Error showing reservation:", error);
        req.flash("error", "Failed to load reservation details");
        res.redirect("/listings");
    }
};

module.exports.createReservation = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, name, email, phone } = req.body;

    // Check if user is logged in
    if (!req.user) {
        req.flash('error', 'You must be logged in to make a reservation');
        return res.redirect('/login');
    }

    // Validate dates
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const today = new Date();

    if (startDate < today) {
        req.flash('error', 'Check-in date must be in the future');
        return res.redirect(`/listings/${id}`);
    }

    if (endDate <= startDate) {
        req.flash('error', 'Check-out date must be after check-in date');
        return res.redirect(`/listings/${id}`);
    }

    console.log('Creating reservation:', {
        listingId: id,
        checkIn,
        checkOut,
        name,
        email,
        phone,
        userId: req.user._id
    });

    try {
        const listing = await Listing.findById(id).populate('owner');
        if (!listing) {
            console.error('Listing not found:', id);
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Calculate number of nights
        const numberOfNights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Calculate costs
        const subtotal = listing.price * numberOfNights;
        const serviceFee = calculateServiceFee(subtotal);
        const tax = calculateTax(subtotal);
        const totalPrice = subtotal + serviceFee + tax;

        // Instead of confirming immediately, redirect to payment page
        console.log('Razorpay Key ID from env:', process.env.RAZORPAY_KEY_ID);
        res.render("reservations/payment", {
            listing,
            checkIn: startDate.toISOString().split('T')[0],
            checkOut: endDate.toISOString().split('T')[0],
            numberOfNights,
            subtotal,
            serviceFee,
            tax,
            totalPrice,
            user: req.user,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Reservation error:", error);
        console.error("Error stack:", error.stack);
        req.flash("error", "Failed to create reservation: " + (error.message || "Unknown error"));
        return res.redirect(`/listings/${id}`);
    }
};