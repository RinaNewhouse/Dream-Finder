// Search Functions
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add search form submit handler
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Add click handler for the search button
    const searchButton = document.querySelector('.input__button');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
}); 