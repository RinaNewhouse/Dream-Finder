// Get query parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('search') || 'all movies';

// API configuration
const API_KEY = 'f296b4f0';
const BASE_URL = 'https://www.omdbapi.com/';

// DOM elements
const moviesList = document.querySelector('.movies__list');
const loadingSpinner = document.querySelector('.movies__loading');
const genreFilter = document.getElementById('genreFilter');
const ratingFilter = document.getElementById('ratingFilter');
const moviesPerPageSelect = document.getElementById('moviesPerPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const paginationNumbers = document.querySelector('.pagination__numbers');

// State
let movies = [];
let filteredMovies = [];
let currentPage = 1;
let moviesPerPage = 10;
let totalPages = 1;

// Search functionality
const movieSearch = document.getElementById('movieSearch');
const searchButton = document.getElementById('searchButton');

// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;

    // Set initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else {
        html.setAttribute('data-theme', 'dark');
    }

    // Update theme toggle icon
    function updateThemeIcon() {
        const currentTheme = html.getAttribute('data-theme');
        const icon = themeToggle.querySelector('i');
        if (currentTheme === 'light') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
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

// Fetch movie details from OMDB API
async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbID}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Initialize the page
async function init() {
    showLoading();
    if (searchQuery.toLowerCase() === 'all movies') {
        const popularSearches = [
            'action', 'comedy', 'drama', 'thriller',
            'adventure', 'sci-fi', 'romance', 'horror',
            'fantasy', 'animation', 'mystery', 'crime'
        ];
        const allMovies = [];
        
        try {
            const promises = popularSearches.map(term => fetchMovies(term));
            const results = await Promise.all(promises);
            
            results.forEach(response => {
                if (response.Search) {
                    allMovies.push(...response.Search);
                }
            });
            
            // Remove duplicates
            const uniqueMovies = [...new Map(allMovies.map(movie => [movie.imdbID, movie])).values()];
            
            // Fetch details for each movie
            const detailedMovies = await Promise.all(
                uniqueMovies.map(async movie => {
                    const details = await fetchMovieDetails(movie.imdbID);
                    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
                    // Ensure we have the correct year data
                    const year = details.Year || movie.Year;
                    return { ...movie, ...details, rating, Year: year };
                })
            );
            
            movies = detailedMovies;
            
        } catch (error) {
            console.error('Error fetching all movies:', error);
            movies = [];
        }
    } else {
        const response = await fetchMovies(searchQuery);
        const initialMovies = response.Search || [];
        
        // Fetch details for each movie
        const detailedMovies = await Promise.all(
            initialMovies.map(async movie => {
                const details = await fetchMovieDetails(movie.imdbID);
                const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
                // Ensure we have the correct year data
                const year = details.Year || movie.Year;
                return { ...movie, ...details, rating, Year: year };
            })
        );
        
        movies = detailedMovies;
    }
    
    filteredMovies = [...movies];
    updatePagination();
    hideLoading();
    renderMovies();
    
    document.querySelector('.movies__header h2').textContent = 
        searchQuery.toLowerCase() === 'all movies' 
            ? 'All Movies' 
            : `Search Results for "${searchQuery}"`;
}

// Fetch movies from OMDB API
async function fetchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${query}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return { Search: [] };
    }
}

// Render movies to the page
function renderMovies() {
    if (filteredMovies.length === 0) {
        moviesList.innerHTML = '<div class="movies__no-results">No movies found</div>';
        return;
    }

    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = moviesPerPage === 'all' ? filteredMovies.length : startIndex + moviesPerPage;
    const moviesToShow = filteredMovies.slice(startIndex, endIndex);

    moviesList.innerHTML = moviesToShow
        .map(
            (movie) => {
                const starsHTML = generateStarRating(movie.rating);
                
                return `
                <div class="movie__card" data-id="${movie.imdbID}">
                    <div class="movie__img--wrapper">
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" 
                             alt="${movie.Title}" 
                             class="movie__img">
                    </div>
                    <div class="movie__info">
                        <h3 class="movie__title">${movie.Title}</h3>
                        <p class="movie__year">${movie.Year}</p>
                        <p class="movie__type">${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</p>
                        <div class="movie__rating">
                            ${starsHTML}
                            <span class="rating__value">${movie.rating}</span>
                        </div>
                    </div>
                </div>
            `;
            }
        )
        .join('');
}

// Update pagination controls
function updatePagination() {
    totalPages = moviesPerPage === 'all' ? 1 : Math.ceil(filteredMovies.length / moviesPerPage);
    
    // Update buttons state
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Generate page numbers
    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // First page
            i === totalPages || // Last page
            (i >= currentPage - 2 && i <= currentPage + 2) // Pages around current page
        ) {
            paginationHTML += `
                <button class="page__number ${i === currentPage ? 'active' : ''}" 
                        onclick="goToPage(${i})">
                    ${i}
                </button>
            `;
        } else if (
            (i === 2 && currentPage > 4) ||
            (i === totalPages - 1 && currentPage < totalPages - 3)
        ) {
            paginationHTML += '<span class="page__dots">...</span>';
        }
    }
    
    paginationNumbers.innerHTML = paginationHTML;
}

// Navigation functions
function goToPage(page) {
    currentPage = page;
    renderMovies();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextPage() {
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

// Filter movies based on selected filters
function filterMovies() {
    const selectedGenre = genreFilter.value;
    const selectedRating = ratingFilter.value;
    const selectedYear = yearFilter.value;

    filteredMovies = movies.filter(movie => {
        // Genre filter
        const genreMatch = selectedGenre === 'all' || 
            movie.Genre.toLowerCase().includes(selectedGenre.toLowerCase());

        // Rating filter
        const movieRating = parseFloat(movie.rating);
        let ratingMatch = true;
        
        if (selectedRating !== 'all') {
            const minRating = parseFloat(selectedRating);
            const maxRating = minRating + 0.9;
            ratingMatch = movieRating >= minRating && movieRating <= maxRating;
        }

        // Year filter
        let yearMatch = true;
        
        if (selectedYear !== 'all') {
            const movieYear = parseInt(movie.Year);
            const startYear = parseInt(selectedYear);
            const endYear = startYear + 9;
            
            yearMatch = !isNaN(movieYear) && movieYear >= startYear && movieYear <= endYear;
        }

        return genreMatch && ratingMatch && yearMatch;
    });

    currentPage = 1;
    updatePagination();
    renderMovies();
}

// Update movies per page
function updateMoviesPerPage() {
    moviesPerPage = moviesPerPageSelect.value === 'all' ? 'all' : parseInt(moviesPerPageSelect.value);
    currentPage = 1;
    updatePagination();
    renderMovies();
}

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
    moviesList.style.display = 'none';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
    moviesList.style.display = 'grid';
}

// Event listeners
genreFilter.addEventListener('change', filterMovies);
ratingFilter.addEventListener('change', filterMovies);
yearFilter.addEventListener('change', filterMovies);
moviesPerPageSelect.addEventListener('change', updateMoviesPerPage);
prevPageBtn.addEventListener('click', prevPage);
nextPageBtn.addEventListener('click', nextPage);

// Function to perform search
async function performSearch(query) {
    if (!query.trim()) return;
    
    showLoading();
    
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            const searchWords = query.toLowerCase().split(' ');
            const initialMovies = data.Search.filter(movie => {
                const title = movie.Title.toLowerCase();
                return searchWords.some(word => title.includes(word));
            });
            
            // Fetch details for each movie
            const detailedMovies = await Promise.all(
                initialMovies.map(async movie => {
                    const details = await fetchMovieDetails(movie.imdbID);
                    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
                    // Ensure Year is properly formatted
                    const year = details.Year ? details.Year.split('–')[0] : movie.Year;
                    return { ...movie, ...details, rating, Year: year };
                })
            );
            
            movies = detailedMovies;
            filteredMovies = [...movies];
            currentPage = 1;
            updatePagination();
            renderMovies();
            
            document.querySelector('.movies__header h2').textContent = `Search Results for "${query}"`;
        } else {
            movies = [];
            filteredMovies = [];
            renderMovies();
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        movies = [];
        filteredMovies = [];
        renderMovies();
    } finally {
        hideLoading();
    }
}

// Event listeners for search
searchButton.addEventListener('click', () => {
    performSearch(movieSearch.value);
});

movieSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(movieSearch.value);
    }
});

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Initialize the page
init();
