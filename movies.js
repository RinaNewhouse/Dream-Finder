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
const movieRatingFilter = document.getElementById('movieRatingFilter');
const ratingFilter = document.getElementById('ratingFilter');
const yearFilter = document.getElementById('yearFilter');
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
        console.log('Fetching details for movie:', imdbID);
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`);
        const data = await response.json();
        console.log('Movie details response:', data);
        
        if (data.Error) {
            console.error('API Error:', data.Error);
            return null;
        }
        
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

// Function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize the page
async function init() {
    console.log('Initializing page with search query:', searchQuery);
    showLoading();
    
    try {
    if (searchQuery.toLowerCase() === 'all movies') {
        const popularSearches = [
            'action', 'comedy', 'drama', 'thriller',
            'adventure', 'sci-fi', 'romance', 'horror',
            'fantasy', 'animation', 'mystery', 'crime'
        ];
        const allMovies = [];
        
            console.log('Fetching popular movies...');
            const promises = popularSearches.map(term => fetchMovies(term));
            const results = await Promise.all(promises);
            
            results.forEach(response => {
                if (response.Search) {
                    allMovies.push(...response.Search);
                }
            });
            
            console.log('Total movies found:', allMovies.length);
            
            // Remove duplicates
            const uniqueMovies = [...new Map(allMovies.map(movie => [movie.imdbID, movie])).values()];
            console.log('Unique movies:', uniqueMovies.length);
            
            // Fetch details for each movie
            const detailedMovies = await Promise.all(
                uniqueMovies.map(async movie => {
                    const details = await fetchMovieDetails(movie.imdbID);
                    if (!details) return null;
                    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
                    const year = details.Year || movie.Year;
                    return { ...movie, ...details, rating, Year: year };
                })
            ).then(movies => movies.filter(movie => movie !== null));
            
            console.log('Detailed movies:', detailedMovies.length);
            
            // Shuffle the movies array
            movies = shuffleArray(detailedMovies);
    } else {
            console.log('Fetching movies for search:', searchQuery);
        const response = await fetchMovies(searchQuery);
        const initialMovies = response.Search || [];
            
            console.log('Initial movies found:', initialMovies.length);
        
        // Fetch details for each movie
        const detailedMovies = await Promise.all(
            initialMovies.map(async movie => {
                const details = await fetchMovieDetails(movie.imdbID);
                    if (!details) return null;
                const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
                const year = details.Year || movie.Year;
                return { ...movie, ...details, rating, Year: year };
            })
            ).then(movies => movies.filter(movie => movie !== null));
            
            console.log('Detailed movies:', detailedMovies.length);
        
            // Shuffle the movies array
            movies = shuffleArray(detailedMovies);
    }
    
    filteredMovies = [...movies];
    updatePagination();
    renderMovies();
    
    document.querySelector('.movies__header h2').textContent = 
        searchQuery.toLowerCase() === 'all movies' 
            ? 'All Movies' 
            : `Search Results for "${searchQuery}"`;
    } catch (error) {
        console.error('Error in init:', error);
        movies = [];
        filteredMovies = [];
        renderMovies();
    } finally {
        hideLoading();
    }
}

// Fetch movies from OMDB API
async function fetchMovies(query) {
    try {
        console.log('Fetching movies for query:', query);
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${query}&type=movie`);
        const data = await response.json();
        console.log('Search response:', data);
        
        if (data.Error) {
            console.error('API Error:', data.Error);
            return { Search: [] };
        }
        
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
        .map(movie => `
                <div class="movie__card" data-id="${movie.imdbID}">
                    <div class="movie__img--wrapper">
                    <img src="${movie.Poster}" alt="${movie.Title}" class="movie__img">
                    </div>
                    <div class="movie__info">
                    <div class="movie__title-section">
                        <h3 class="movie__title">${movie.Title}</h3>
                    </div>
                    <div class="movie__details-section">
                        <p class="movie__year">${movie.Year}</p>
                        <div class="movie__rating">
                            ${generateStarRating(movie.rating)}
                            <span>${movie.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `)
        .join('');

    // Add click event listeners to all movie cards
    document.querySelectorAll('.movie__card').forEach(card => {
        card.addEventListener('click', () => {
            const movieId = card.dataset.id;
            const movie = filteredMovies.find(m => m.imdbID === movieId);
            if (movie) {
                showMovieDetails(movie);
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
async function goToPage(page) {
    const moviesList = document.querySelector('.movies__list');
    moviesList.classList.add('fade');
    
    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentPage = page;
    renderMovies();
    updatePagination();
    
    // Wait for next frame to ensure new content is rendered
    requestAnimationFrame(() => {
        moviesList.classList.remove('fade');
    });
}

async function nextPage() {
    if (currentPage < totalPages) {
        await goToPage(currentPage + 1);
    }
}

async function prevPage() {
    if (currentPage > 1) {
        await goToPage(currentPage - 1);
    }
}

// Filter movies based on selected filters
function filterMovies() {
    const selectedGenre = genreFilter.value;
    const selectedMovieRating = movieRatingFilter.value;
    const selectedRating = ratingFilter.value;
    const selectedYear = yearFilter.value;

    filteredMovies = movies.filter(movie => {
        // Genre filter
        const genreMatch = selectedGenre === 'all' || 
            movie.Genre.toLowerCase().includes(selectedGenre.toLowerCase());

        // Movie rating filter (G, PG, etc.)
        const movieRatingMatch = selectedMovieRating === 'all' || 
            (movie.Rated && movie.Rated.toUpperCase() === selectedMovieRating.toUpperCase());

        // Star rating filter
        const movieRating = parseFloat(movie.rating); // Use the generated rating instead of imdbRating
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

        return genreMatch && movieRatingMatch && ratingMatch && yearMatch;
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
movieRatingFilter.addEventListener('change', filterMovies);
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
        let allResults = [];
        const searchTerms = [];
        const queryLower = query.toLowerCase();
        
        // Check if the query matches any of the genre filter options
        const genreOptions = [
            'action', 'adventure', 'animation', 'biography', 'comedy', 'crime',
            'documentary', 'drama', 'family', 'fantasy', 'film-noir', 'history',
            'horror', 'musical', 'mystery', 'romance', 'sci-fi', 'sport',
            'thriller', 'war', 'western'
        ];
        
        if (genreOptions.includes(queryLower)) {
            // For genre searches, use the same initial search terms as the init function
            const popularSearches = [
                'action', 'comedy', 'drama', 'thriller',
                'adventure', 'sci-fi', 'romance', 'horror',
                'fantasy', 'animation', 'mystery', 'crime',
                'documentary', 'biography', 'family', 'musical',
                'sport', 'war', 'western'
            ];
            
            // Add the specific genre we're searching for
            searchTerms.push(query);
            
            // Also add some popular movies in that genre to get more results
            if (queryLower === 'documentary') {
                searchTerms.push('nature documentary', 'history documentary', 'science documentary');
            } else if (queryLower === 'biography') {
                searchTerms.push('biographical film', 'biopic');
            } else if (queryLower === 'sci-fi') {
                searchTerms.push('science fiction', 'space movie', 'futuristic');
            }
        }
        // Handle Disney searches
        else if (queryLower.includes('disney')) {
            // Use specific search terms that work with OMDB
            searchTerms.push(
                'disney',
                'walt disney',
                'pixar',
                'disney animation',
                'disney pixar',
                'disney princess',
                'disney fairy tale',
                'frozen',
                'moana',
                'coco',
                'tangled',
                'lion king',
                'aladdin',
                'beauty and the beast',
                'mulan',
                'zootopia',
                'big hero 6',
                'wreck it ralph',
                'princess and the frog',
                'raya',
                'inside out',
                'encanto',
                'luca',
                'soul',
                'onward',
                'elemental'
            );
        }
        // Handle family-friendly searches
        else if (queryLower.includes('kid friendly') || queryLower.includes('family friendly') || 
                 queryLower.includes('family') || queryLower.includes('kids')) {
            // Search for popular family-friendly movies and genres
            searchTerms.push(
                'disney',
                'pixar',
                'dreamworks',
                'illumination',
                'animation',
                'family',
                'musical',
                'adventure',
                'comedy',
                'fantasy',
                'frozen',
                'moana',
                'coco',
                'tangled',
                'lion king',
                'aladdin',
                'beauty and the beast',
                'zootopia',
                'big hero 6',
                'wreck it ralph',
                'princess and the frog',
                'inside out',
                'encanto',
                'toy story',
                'finding nemo',
                'up',
                'cars',
                'incredibles',
                'monsters inc',
                'wall-e',
                'ratatouille'
            );
        }
        else {
            searchTerms.push(query);
        }

        // Fetch results for all search terms
        for (const term of searchTerms) {
            try {
                const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(term)}&type=movie`);
                const data = await response.json();
                
                if (data.Response === 'True' && data.Search) {
                    allResults.push(...data.Search);
                }
            } catch (error) {
                console.error(`Error fetching results for term "${term}":`, error);
            }
        }

        // Remove duplicates based on imdbID
        allResults = [...new Map(allResults.map(movie => [movie.imdbID, movie])).values()];

        // Filter and sort results
        const searchWords = queryLower.split(' ');
        let initialMovies = allResults.filter(movie => {
                const title = movie.Title.toLowerCase();
            const year = parseInt(movie.Year);
            
            // Filter out inappropriate content and unreleased movies
            if (year > new Date().getFullYear() || isNaN(year)) {
                return false;
            }

            // List of words that indicate inappropriate content
            const excludeWords = [
                'killed', 'murder', 'meathook', 'lesbian', 'gore', 'slaughter', 'massacre',
                'behind the scenes', 'making of', 'untold', 'real',
                'untitled', 'project', 'development', 'announced', 'upcoming'
            ];
            
            if (excludeWords.some(word => title.includes(word))) {
                return false;
            }

            // For genre searches, we'll filter by genre after fetching details
            if (genreOptions.includes(queryLower)) {
                return true;
            }

            // For Disney searches, ensure it's a Disney/Pixar film
            if (queryLower.includes('disney')) {
                const disneyIndicators = [
                    'disney', 'pixar', 'animation', 'animated',
                    'princess', 'fairy tale', 'walt disney'
                ];

                return disneyIndicators.some(indicator => title.includes(indicator)) ||
                       disneyIndicators.some(indicator => movie.Type?.toLowerCase().includes(indicator));
            }

            // For family-friendly searches, ensure appropriate rating
            if (queryLower.includes('kid friendly') || queryLower.includes('family friendly') || 
                queryLower.includes('family') || queryLower.includes('kids')) {
                return true; // We'll filter by rating after fetching details
            }

                return searchWords.some(word => title.includes(word));
            });
            
            // Fetch details for each movie
            const detailedMovies = await Promise.all(
                initialMovies.map(async movie => {
                try {
                    const details = await fetchMovieDetails(movie.imdbID);
                    if (!details) return null;
                    
                    // For genre searches, filter by genre after getting details
                    if (genreOptions.includes(queryLower)) {
                        // Normalize the genre string for comparison
                        const movieGenres = details.Genre?.toLowerCase().split(', ').map(g => g.trim()) || [];
                        
                        // Check if any of the movie's genres match our search genre
                        if (!movieGenres.some(genre => genre === queryLower)) {
                            return null;
                        }
                    }
                    
                    // For family-friendly searches, filter by rating after getting details
                    if (queryLower.includes('kid friendly') || queryLower.includes('family friendly') || 
                        queryLower.includes('family') || queryLower.includes('kids')) {
                        if (!['G', 'PG', 'PG-13'].includes(details.Rated)) {
                            return null;
                        }
                    }
                    
                    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
                    const year = details.Year ? details.Year.split('–')[0] : movie.Year;
                    return { ...movie, ...details, rating, Year: year };
                } catch (error) {
                    console.error(`Error fetching details for movie ${movie.imdbID}:`, error);
                    return null;
                }
            })
        ).then(movies => movies.filter(movie => movie !== null));

        // Sort results
        if (genreOptions.includes(queryLower)) {
            // Sort by year (newer first) for genre searches
            detailedMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
        }
        else if (queryLower.includes('disney')) {
            detailedMovies.sort((a, b) => {
                const titleA = a.Title.toLowerCase();
                const titleB = b.Title.toLowerCase();
                
                // Prioritize animated movies
                const isAnimatedA = titleA.includes('animation') || titleA.includes('animated');
                const isAnimatedB = titleB.includes('animation') || titleB.includes('animated');
                
                if (isAnimatedA && !isAnimatedB) return -1;
                if (!isAnimatedA && isAnimatedB) return 1;
                
                // Then sort by year (newer first)
                return parseInt(b.Year) - parseInt(a.Year);
            });
        }
        else if (queryLower.includes('kid friendly') || queryLower.includes('family friendly') || 
                 queryLower.includes('family') || queryLower.includes('kids')) {
            detailedMovies.sort((a, b) => {
                // Sort by rating (G first, then PG, then PG-13)
                const ratingOrder = { 'G': 1, 'PG': 2, 'PG-13': 3 };
                const ratingA = ratingOrder[a.Rated] || 4;
                const ratingB = ratingOrder[b.Rated] || 4;
                
                if (ratingA !== ratingB) {
                    return ratingA - ratingB;
                }
                
                // Then sort by year (newer first)
                return parseInt(b.Year) - parseInt(a.Year);
            });
        }
            
            movies = detailedMovies;
            filteredMovies = [...movies];
            currentPage = 1;
            updatePagination();
            renderMovies();
            
            document.querySelector('.movies__header h2').textContent = `Search Results for "${query}"`;
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

// Burger menu functionality
const menuBtn = document.querySelector('.btn__menu');
const menuBackdrop = document.querySelector('.menu__backdrop');
const closeMenuBtn = document.querySelector('.btn__menu--close');

function openMenu() {
    menuBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    menuBackdrop.classList.remove('show');
    document.body.style.overflow = 'auto';
}

menuBtn.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);

// Close menu when clicking outside
menuBackdrop.addEventListener('click', (e) => {
    if (e.target === menuBackdrop) {
        closeMenu();
    }
});

// Add scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Call init when the page loads
document.addEventListener('DOMContentLoaded', init);

function showMovieDetails(movie) {
    const details = document.querySelector('.movie__details');
    const backdrop = document.querySelector('.movie__details-backdrop');
    
    // Fetch short plot instead of full plot
    fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}&plot=short`)
        .then(response => response.json())
        .then(movieDetails => {
            // Get recommendations using our generateRecommendations function
            const recommendations = generateRecommendations(movieDetails);
            
            details.innerHTML = `
                <button class="movie__details-close">
                    <i class="fas fa-times"></i>
                </button>
                <h2 class="movie__details-title">${movieDetails.Title}</h2>
                <div class="movie__details-info">
                    <p><span>Year:</span> ${movieDetails.Year}</p>
                    <p><span>Rating:</span> ${movieDetails.Rated}</p>
                    <p><span>Runtime:</span> ${movieDetails.Runtime}</p>
                    <p><span>Genre:</span> ${movieDetails.Genre}</p>
                    <p><span>Director:</span> ${movieDetails.Director}</p>
                    <p><span>Cast:</span> ${movieDetails.Actors}</p>
                </div>
                <div class="movie__summary">
                    <h4>Summary</h4>
                    <p>${movieDetails.Plot}</p>
                </div>
                <div class="movie__recommendations">
                    <h4>You might like this movie if...</h4>
                    <ul>
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;

            // Show modal and backdrop
            details.classList.add('show');
            backdrop.classList.add('show');

            // Add close functionality
            const closeBtn = details.querySelector('.movie__details-close');
            const closeModal = () => {
                details.classList.remove('show');
                backdrop.classList.remove('show');
            };

            closeBtn.addEventListener('click', closeModal);
            backdrop.addEventListener('click', closeModal);
        });
}
