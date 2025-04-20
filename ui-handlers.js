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
    
    const templateParams = {
        from_name: document.getElementById('name').value,
        from_email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    emailjs.send('service_8ev3m6g', 'template_nh7nrxg', templateParams)
        .then(function(response) {
            alert('Message sent successfully!');
            closeContactForm();
            document.getElementById('contactForm').reset();
        }, function(error) {
            alert('Failed to send message. Please try again.');
        });
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Clear filters function
function clearFilters() {
    document.getElementById('genreFilter').value = '';
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('moviesPerPage').value = '10';
    filterMovies();
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Contact form links
    document.querySelectorAll('.contact-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openContactForm();
        });
    });

    // Contact form close button
    const closeContactBtn = document.querySelector('.contact__close-btn');
    if (closeContactBtn) {
        closeContactBtn.addEventListener('click', closeContactForm);
    }

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }

    // Clear filters button
    const clearFiltersBtn = document.querySelector('.clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Close menu when clicking outside
    window.addEventListener('click', (event) => {
        const backdrop = document.querySelector('.menu__backdrop');
        if (event.target === backdrop) {
            closeMenu();
        }
    });
}); 