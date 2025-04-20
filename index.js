// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchButton = document.querySelector('.input__button');

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

    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
}); 
        const searchQuery = searchInput.value.trim();
        
        if (searchQuery) {
            window.location.href = `movies.html?search=${encodeURIComponent(searchQuery)}`;
        } else {
            searchInput.focus();
        }
    }

    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
}); 
        const searchQuery = searchInput.value.trim();
        
        if (searchQuery) {
            window.location.href = `movies.html?search=${encodeURIComponent(searchQuery)}`;
        } else {
            searchInput.focus();
        }
    }

    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
}); 