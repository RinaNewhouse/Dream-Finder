// Menu functionality
function openMenu() {
    const backdrop = document.querySelector('.menu__backdrop');
    if (backdrop) {
        backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeMenu() {
    const backdrop = document.querySelector('.menu__backdrop');
    if (backdrop) {
        backdrop.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Initialize menu functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get menu elements
    const menuBtn = document.querySelector('.btn__menu');
    const closeBtn = document.querySelector('.btn__menu--close');
    const menuLinks = document.querySelectorAll('.menu__link');
    const backdrop = document.querySelector('.menu__backdrop');
    const contactLinks = document.querySelectorAll('.contact-link');

    // Add click event for menu button
    if (menuBtn) {
        menuBtn.addEventListener('click', openMenu);
    }

    // Add click event for close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    // Add click events for all menu links
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Add click events for contact links
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            if (typeof openContactForm === 'function') {
                openContactForm();
            }
        });
    });

    // Close menu when clicking backdrop
    if (backdrop) {
        backdrop.addEventListener('click', function(event) {
            if (event.target === backdrop) {
                closeMenu();
            }
        });
    }
}); 