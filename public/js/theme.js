// Theme toggle functionality
function setTheme(theme) {
    document.body.className = theme;
    localStorage.setItem("vacanzy-theme", theme);
    
    // Update icons
    document.querySelectorAll("#themeIcon, #themeIconMobile").forEach(icon => {
        if (icon) {
            icon.className = theme === "dark" ? "ri-sun-line" : "ri-moon-line";
        }
    });
}

// Apply theme on load
document.addEventListener("DOMContentLoaded", function() {
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem("vacanzy-theme") || "light";
    setTheme(savedTheme);
    
    // Add click handlers to toggle buttons
    document.querySelectorAll("#themeToggle, #themeToggleMobile").forEach(button => {
        if (button) {
            button.addEventListener("click", function(e) {
                e.preventDefault();
                const newTheme = document.body.className === "dark" ? "light" : "dark";
                setTheme(newTheme);
            });
        }
    });
});