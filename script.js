// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;

    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else {
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Update theme toggle icon
    function updateThemeIcon() {
        const currentTheme = html.getAttribute('data-theme');
        themeToggle.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }

    // Initial icon update
    updateThemeIcon();

    // Toggle theme function
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    }

    // Add click event listener
    themeToggle.addEventListener('click', toggleTheme);
});

// Initialize EmailJS
(function() {
    emailjs.init("XZiqXvXGUZ2WaKUne");
})();

// Menu Functions
function openMenu() {
    const backdrop = document.querySelector('.menu__backdrop');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    const backdrop = document.querySelector('.menu__backdrop');
    backdrop.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Contact Form Functions
function openContactForm() {
    document.getElementById('contactModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeContactForm() {
    document.getElementById('contactModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function handleContactSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const formData = {
        from_name: form.name.value,
        from_email: form.email.value,
        message: form.message.value
    };

    // Show loading state
    const submitBtn = form.querySelector('.contact__submit-btn');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Send email using EmailJS
    emailjs.send('service_7xmu46e', 'template_s0uio9z', formData)
        .then(() => {
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            closeContactForm();
            form.reset();
        })
        .catch((error) => {
            // Show error message
            alert('Sorry, there was an error sending your message. Please try again later.');
            console.error('Email sending error:', error);
        })
        .finally(() => {
            // Reset button state
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close menu and modal when clicking outside
    window.onclick = function(event) {
        const menu = document.querySelector('.menu__backdrop');
        const modal = document.getElementById('contactModal');
        if (event.target === menu) {
            closeMenu();
        }
        if (event.target === modal) {
            closeContactForm();
        }
    };
}); 