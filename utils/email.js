const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports.sendEmail = async (options) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.to_email,
        subject: 'Your Booking Confirmation',
        html: `
            <h2>Booking Confirmation</h2>
            <p>Dear ${options.to_name},</p>
            <p>Your booking at ${options.listing_title} has been confirmed!</p>
            
            <h3>Booking Details:</h3>
            <ul>
                <li>Booking ID: ${options.booking_id}</li>
                <li>Check-in: ${options.check_in}</li>
                <li>Check-out: ${options.check_out}</li>
                <li>Number of nights: ${options.number_of_nights}</li>
                <li>Location: ${options.location}, ${options.country}</li>
            </ul>
            
            <h3>Price Details:</h3>
            <ul>
                <li>Price per night: ${options.price_per_night}</li>
                <li>Total nights: ${options.number_of_nights}</li>
                <li>Subtotal: ${options.subtotal}</li>
                <li>Service fee: ${options.service_fee}</li>
                <li>Tax: ${options.tax}</li>
                <li><strong>Total Price: ${options.total_price}</strong></li>
            </ul>
            
            <p>Thank you for choosing Vacanzy!</p>
        `
    };

    return await transporter.sendMail(mailOptions);
};