// Menu functionality
function openMenu() {
    document.body.classList.add('menu--open');
}

function closeMenu() {
    document.body.classList.remove('menu--open');
}

function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.trim();
    
    if (searchQuery) {
        window.location.href = `movies.html?search=${encodeURIComponent(searchQuery)}`;
    } else {
        searchInput.focus();
    }
}

// Add click handler for the search button
document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.querySelector('.input__button');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
}); 