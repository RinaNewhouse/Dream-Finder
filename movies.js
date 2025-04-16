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

// Fetch movie details from OMDB API
async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`);
        const data = await response.json();
        console.log('API Response Plot:', data.Plot);
        
        // Ensure proper punctuation for all plot summaries
        if (data.Plot) {
            // Fix specific known truncation
            data.Plot = data.Plot.replace(/\s+d\.\.\.$/, ' deeds.');
            
            // Add period if missing at the end
            if (!data.Plot.endsWith('.') && !data.Plot.endsWith('!') && !data.Plot.endsWith('?')) {
                data.Plot = data.Plot.trim() + '.';
            }
            
            // Fix ellipsis if present
            data.Plot = data.Plot.replace(/\.{2,}/g, '...');
            
            // Remove extra spaces before punctuation
            data.Plot = data.Plot.replace(/\s+\./g, '.');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
            // Shuffle the search terms to get different genres each time
            const shuffledSearches = shuffleArray([...popularSearches]);
            // Only use first 4 genres to speed up loading
            const selectedSearches = shuffledSearches.slice(0, 4);
            
            const promises = selectedSearches.map(term => fetchMovies(term));
            const results = await Promise.all(promises);
            
            results.forEach(response => {
                if (response.Search) {
                    allMovies.push(...response.Search);
                }
            });
            
            // Remove duplicates
            const uniqueMovies = [...new Map(allMovies.map(movie => [movie.imdbID, movie])).values()];
            
            // Shuffle the unique movies before fetching details
            const shuffledMovies = shuffleArray(uniqueMovies);
            
            // Fetch details for each movie (limit to 40 movies for performance)
            const detailedMovies = await Promise.all(
                shuffledMovies.slice(0, 40).map(async movie => {
                    const details = await fetchMovieDetails(movie.imdbID);
                    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
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
                const year = details.Year || movie.Year;
                return { ...movie, ...details, rating, Year: year };
            })
        );
        
        movies = detailedMovies;
    }
    
    // Shuffle the final movies array before filtering and displaying
    movies = shuffleArray(movies);
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
                <div class="movie__details" data-id="${movie.imdbID}">
                    <button class="movie__details-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3 class="movie__details-title">${movie.Title}</h3>
                    <div class="movie__summary">
                        <h4>Summary</h4>
                        <p>${movie.Plot ? movie.Plot.trim() : 'No summary available.'}</p>
                    </div>
                    <div class="movie__recommendations">
                        <h4>You Would Like This Movie If:</h4>
                        <ul>
                            ${generateRecommendations(movie).map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="movie__details-backdrop" data-id="${movie.imdbID}"></div>
            `;
            }
        )
        .join('');

    // Add click event listeners to movie cards
    document.querySelectorAll('.movie__card').forEach(card => {
        card.addEventListener('click', function() {
            const movieId = this.dataset.id;
            const details = document.querySelector(`.movie__details[data-id="${movieId}"]`);
            const backdrop = document.querySelector(`.movie__details-backdrop[data-id="${movieId}"]`);
            
            if (details && backdrop) {
                details.classList.add('show');
                backdrop.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Add click event listeners to close buttons and backdrops
    document.querySelectorAll('.movie__details-close, .movie__details-backdrop').forEach(element => {
        element.addEventListener('click', function() {
            const movieId = this.closest('.movie__details, .movie__details-backdrop').dataset.id;
            const details = document.querySelector(`.movie__details[data-id="${movieId}"]`);
            const backdrop = document.querySelector(`.movie__details-backdrop[data-id="${movieId}"]`);
            
            if (details && backdrop) {
                details.classList.remove('show');
                backdrop.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    });
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    init();

    // Add event listeners for filters
    genreFilter.addEventListener('change', filterMovies);
    ratingFilter.addEventListener('change', filterMovies);
    yearFilter.addEventListener('change', filterMovies);
    moviesPerPageSelect.addEventListener('change', updateMoviesPerPage);

    // Add event listeners for pagination
    prevPageBtn.addEventListener('click', prevPage);
    nextPageBtn.addEventListener('click', nextPage);

    // Add event listener for search
    searchButton.addEventListener('click', function() {
        const query = movieSearch.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    movieSearch.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
});

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

// Function to generate movie recommendations based on genre and plot
function generateRecommendations(movie) {
    const genre = movie.Genre?.toLowerCase() || '';
    const plot = movie.Plot?.toLowerCase() || '';
    
    const recommendations = {
        action: [
            'You enjoy intense action sequences and thrilling stunts',
            'You like seeing heroes overcome impossible odds',
            'You appreciate well-choreographed fight scenes'
        ],
        comedy: [
            'You enjoy witty dialogue and clever humor',
            'You like seeing characters in awkward situations',
            'You appreciate light-hearted entertainment'
        ],
        drama: [
            'You enjoy deep character development',
            'You like emotional storytelling',
            'You appreciate thought-provoking themes'
        ],
        romance: [
            'You enjoy watching relationships develop',
            'You like emotional love stories',
            'You appreciate romantic tension and chemistry'
        ],
        horror: [
            'You enjoy suspense and jump scares',
            'You like psychological thrillers',
            'You appreciate atmospheric tension'
        ],
        sciFi: [
            'You enjoy futuristic concepts and technology',
            'You like exploring philosophical questions',
            'You appreciate imaginative world-building'
        ],
        thriller: [
            'You enjoy suspense and mystery',
            'You like plot twists and surprises',
            'You appreciate psychological tension'
        ],
        fantasy: [
            'You enjoy magical worlds and creatures',
            'You like epic quests and adventures',
            'You appreciate imaginative storytelling'
        ],
        animation: [
            'You enjoy creative visual storytelling',
            'You like family-friendly entertainment',
            'You appreciate artistic animation styles'
        ],
        mystery: [
            'You enjoy solving puzzles and riddles',
            'You like uncovering hidden secrets',
            'You appreciate clever plot twists'
        ],
        crime: [
            'You enjoy detective stories and investigations',
            'You like seeing justice served',
            'You appreciate complex criminal plots'
        ],
        adventure: [
            'You enjoy exciting journeys and exploration',
            'You like seeing characters face challenges',
            'You appreciate epic quests and discoveries'
        ]
    };

    // Find matching genre recommendations
    let genreRecommendations = [];
    for (const [key, values] of Object.entries(recommendations)) {
        if (genre.includes(key.toLowerCase())) {
            genreRecommendations = [...genreRecommendations, ...values];
        }
    }

    // If no genre matches, use plot keywords
    if (genreRecommendations.length === 0) {
        if (plot.includes('love') || plot.includes('romance')) {
            genreRecommendations = recommendations.romance;
        } else if (plot.includes('fight') || plot.includes('action')) {
            genreRecommendations = recommendations.action;
        } else if (plot.includes('scary') || plot.includes('horror')) {
            genreRecommendations = recommendations.horror;
        } else {
            genreRecommendations = recommendations.drama;
        }
    }

    // Get three unique recommendations
    const uniqueRecommendations = [...new Set(genreRecommendations)];
    const shuffled = uniqueRecommendations.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}
