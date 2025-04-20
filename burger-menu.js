// Menu Functions
function openMenu() {
    const backdrop = document.querySelector('.menu__backdrop');
    const closeBtn = document.querySelector('.btn__menu--close');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
    if (closeBtn) {
        closeBtn.style.display = 'flex';
    }
}

function closeMenu() {
    const backdrop = document.querySelector('.menu__backdrop');
    const closeBtn = document.querySelector('.btn__menu--close');
    backdrop.classList.remove('show');
    document.body.style.overflow = 'auto';
    if (closeBtn) {
        closeBtn.style.display = 'none';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for menu buttons
    const menuBtn = document.querySelector('.btn__menu');
    const closeBtn = document.querySelector('.btn__menu--close');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', openMenu);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    // Close menu when clicking outside
    const menu = document.querySelector('.menu__backdrop');
    if (menu) {
        menu.addEventListener('click', function(event) {
            if (event.target === menu) {
                closeMenu();
            }
        });
    }
}); 