// Date validation
function validateDates() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const today = new Date().toISOString().split('T')[0];
    
    // Reset validation states
    document.getElementById('checkIn').classList.remove('is-invalid');
    document.getElementById('checkOut').classList.remove('is-invalid');
    
    if (checkIn < today) {
        document.getElementById('checkIn').classList.add('is-invalid');
        return false;
    }
    
    if (checkIn && checkOut && checkOut <= checkIn) {
        document.getElementById('checkOut').classList.add('is-invalid');
        return false;
    }
    
    return true;
}

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            if (!validateDates()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            if (!this.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            this.classList.add('was-validated');
        });
    }
});