const Listing = require("../models/listing");
const Reservation = require("../models/reservation");
const User = require("../models/user");
const { calculateServiceFee, calculateTax } = require("../utils/fees");
const { createOrder, verifyPaymentSignature, getPaymentDetails } = require("../utils/razorpay");

// Create payment order
module.exports.createPaymentOrder = async (req, res) => {
    try {
        const { id } = req.params; // listing ID
        const { checkIn, checkOut } = req.body;

        // Check if user is logged in
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'You must be logged in to make a reservation' 
            });
        }

        // Validate dates
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        const today = new Date();

        if (startDate < today) {
            return res.status(400).json({ 
                success: false, 
                message: 'Check-in date must be in the future' 
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Check-out date must be after check-in date' 
            });
        }

        // Get listing details
        const listing = await Listing.findById(id).populate('owner');
        if (!listing) {
            return res.status(404).json({ 
                success: false, 
                message: 'Listing not found' 
            });
        }

        // Calculate costs
        const numberOfNights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const subtotal = listing.price * numberOfNights;
        const serviceFee = calculateServiceFee(subtotal);
        const tax = calculateTax(subtotal);
        const totalPrice = subtotal + serviceFee + tax;

        // Create reservation with payment_pending status
        const reservation = new Reservation({
            guest: req.user._id,
            listing: listing._id,
            checkIn: startDate,
            checkOut: endDate,
            numberOfNights,
            totalPrice,
            serviceFee,
            tax,
            status: 'payment_pending',
            paymentStatus: 'pending'
        });

        const savedReservation = await reservation.save();

        // Create Razorpay order
        const orderResult = await createOrder(
            totalPrice, 
            'INR', 
            savedReservation.bookingId
        );

        if (!orderResult.success) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to create payment order',
                error: orderResult.error 
            });
        }

        // Update reservation with Razorpay order ID
        savedReservation.razorpayOrderId = orderResult.order.id;
        await savedReservation.save();

        res.json({
            success: true,
            order: orderResult.order,
            reservation: {
                id: savedReservation._id,
                bookingId: savedReservation.bookingId,
                totalPrice: totalPrice,
                currency: 'INR'
            },
            listing: {
                title: listing.title,
                location: listing.location
            },
            user: {
                name: req.user.username,
                email: req.user.email,
                phone: req.user.phone || req.user.phoneNumber || ''
            }
        });

    } catch (error) {
        console.error("Payment order creation error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Verify payment and confirm booking
module.exports.verifyPayment = async (req, res) => {
    try {
        console.log('Payment verification started:', req.body);
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            reservation_id 
        } = req.body;

        console.log('Verifying signature for:', { razorpay_order_id, razorpay_payment_id });

        // Verify payment signature
        const isValidSignature = verifyPaymentSignature(
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature
        );

        console.log('Signature validation result:', isValidSignature);

        if (!isValidSignature) {
            console.log('Invalid signature detected');
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment signature' 
            });
        }

        console.log('Signature verified successfully');

        // Get payment details from Razorpay
        const paymentResult = await getPaymentDetails(razorpay_payment_id);
        
        if (!paymentResult.success) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch payment details' 
            });
        }

        // Update reservation with payment details
        const reservation = await Reservation.findById(reservation_id).populate('listing');
        
        if (!reservation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Reservation not found' 
            });
        }

        reservation.status = 'confirmed';
        reservation.paymentStatus = 'completed';
        reservation.razorpayPaymentId = razorpay_payment_id;
        reservation.razorpaySignature = razorpay_signature;
        reservation.paymentMethod = paymentResult.payment.method;
        reservation.paidAmount = paymentResult.payment.amount / 100; // Convert from paise
        reservation.paymentDate = new Date();

        await reservation.save();

        // NOW send confirmation email after successful payment
        const emailData = {
            email: req.user.email,
            user_email: req.user.email,
            to_email: req.user.email,
            to_name: req.user.username,
            order_id: reservation.bookingId,
            booking_id: reservation.bookingId,
            listing_title: reservation.listing.title,
            price_per_night: `₹${reservation.listing.price.toLocaleString("en-IN")}`,
            number_of_nights: reservation.numberOfNights,
            subtotal: `₹${(reservation.totalPrice - reservation.serviceFee - reservation.tax).toLocaleString("en-IN")}`,
            service_fee: `₹${reservation.serviceFee.toLocaleString("en-IN")}`,
            tax: `₹${reservation.tax.toLocaleString("en-IN")}`,
            total_price: `₹${reservation.totalPrice.toLocaleString("en-IN")}`,
            check_in: reservation.checkIn.toLocaleDateString(),
            check_out: reservation.checkOut.toLocaleDateString(),
            location: reservation.listing.location,
            country: reservation.listing.country
        };

        res.json({
            success: true,
            message: 'Payment verified and booking confirmed!',
            reservation: {
                id: reservation._id,
                bookingId: reservation.bookingId,
                status: reservation.status,
                paymentStatus: reservation.paymentStatus
            },
            emailData: emailData // Send email data to frontend for EmailJS
        });

    } catch (error) {
        console.error("Payment verification error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Payment verification failed',
            error: error.message 
        });
    }
};

// Handle payment failure
module.exports.handlePaymentFailure = async (req, res) => {
    try {
        const { reservation_id, error_description } = req.body;

        const reservation = await Reservation.findById(reservation_id);
        
        if (reservation) {
            reservation.status = 'payment_failed';
            reservation.paymentStatus = 'failed';
            await reservation.save();
        }

        res.json({
            success: false,
            message: 'Payment failed',
            error: error_description
        });

    } catch (error) {
        console.error("Payment failure handling error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error handling payment failure',
            error: error.message 
        });
    }
};