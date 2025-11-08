// Function to send contact form emails
function sendEmail(e) {
    if (!window.emailjs) {
        console.error('EmailJS not loaded');
        return;
    }
    e.preventDefault();

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

    const serviceID = 'service_azpvd6w';  // Your EmailJS service ID
    const templateID = 'template_v0g3qfm';  // Your contact form template ID

    emailjs.sendForm(serviceID, templateID, e.target)
        .then(function() {
            // Show success message
            showAlert('success', 'Thank you! Your message has been sent successfully.');
            e.target.reset(); // Reset the form
        }, function(error) {
            // Show error message
            showAlert('danger', 'Sorry, failed to send message. Please try again later.');
            console.error('EmailJS Error:', error);
        })
        .finally(function() {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
}

// Function to send booking confirmation emails
function sendBookingConfirmation(bookingDetails) {
    if (!window.emailjs) {
        console.error('EmailJS not loaded');
        return Promise.reject('EmailJS not loaded');
    }

    const templateParams = {
        to_name: bookingDetails.guestName,
        to_email: bookingDetails.guestEmail,
        order_id: bookingDetails.bookingId,
        name: bookingDetails.listingTitle,
        price: bookingDetails.pricePerNight,
        units: bookingDetails.numberOfNights,
        cost: {
            subtotal: bookingDetails.subtotal,
            shipping: bookingDetails.serviceFee,
            tax: bookingDetails.tax,
            total: bookingDetails.totalPrice
        },
        check_in: bookingDetails.checkIn,
        check_out: bookingDetails.checkOut
    };

    return emailjs.send('service_id', 'booking_template_id', templateParams)
        .then(function(response) {
            console.log('Booking confirmation sent successfully:', response);
            return true;
        })
        .catch(function(error) {
            console.error('Failed to send booking confirmation:', error);
            return false;
        });
}

// Helper function to show alerts
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(alertDiv, form);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}