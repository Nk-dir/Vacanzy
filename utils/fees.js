// Calculate service fee (10% of subtotal)
function calculateServiceFee(subtotal) {
    return subtotal * 0.10;
}

// Calculate tax (5% of subtotal)
function calculateTax(subtotal) {
    return subtotal * 0.05;
}

module.exports = {
    calculateServiceFee,
    calculateTax
};