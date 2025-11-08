const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    numberOfNights: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    serviceFee: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'payment_pending', 'payment_failed'],
        default: 'payment_pending'
    },
    bookingId: {
        type: String,
        unique: true
    },
    // Payment related fields
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    paidAmount: {
        type: Number
    },
    paymentDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Generate a unique booking ID before saving
reservationSchema.pre('save', function(next) {
    if (!this.bookingId) {
        const date = new Date();
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.bookingId = `VAC-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${randomNum}`;
    }
    next();
});

module.exports = mongoose.model('Reservation', reservationSchema);