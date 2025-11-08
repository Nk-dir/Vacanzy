const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
const createOrder = async (amount, currency = 'INR', receipt) => {
    try {
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise as INTEGER
            currency: currency,
            receipt: receipt,
            payment_capture: 1 // Auto capture payment
        };

        const order = await razorpay.orders.create(options);
        return {
            success: true,
            order: order
        };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Verify payment signature
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === razorpaySignature;
    } catch (error) {
        console.error('Error verifying payment signature:', error);
        return false;
    }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            success: true,
            payment: payment
        };
    } catch (error) {
        console.error('Error fetching payment details:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Refund payment
const refundPayment = async (paymentId, amount = null, notes = {}) => {
    try {
        const refundOptions = {
            payment_id: paymentId,
            notes: notes
        };

        if (amount) {
            refundOptions.amount = amount * 100; // Amount in paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundOptions);
        return {
            success: true,
            refund: refund
        };
    } catch (error) {
        console.error('Error processing refund:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    razorpay,
    createOrder,
    verifyPaymentSignature,
    getPaymentDetails,
    refundPayment
};