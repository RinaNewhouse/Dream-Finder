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

// Close menu when clicking outside
window.addEventListener('click', function(event) {
    const menu = document.querySelector('.menu__backdrop');
    if (event.target === menu) {
        closeMenu();
    }
}); 