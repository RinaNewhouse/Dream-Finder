// Theme Toggle Function
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update theme toggle icon
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'light' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    }
}

// Initialize theme and add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set initial icon
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = `fa-regular ${savedTheme === 'light' ? 'fa-moon' : 'fa-sun'}`;
    }

    // Add click event listener to theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}); 
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}); 
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}); 