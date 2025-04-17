// OpenAI API configuration
const OPENAI_API_KEY = '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';

// Function to generate personalized movie recommendations
async function generatePersonalizedRecommendations(movie) {
    // Log movie details for debugging
    console.log('Generating recommendations for:', {
        Title: movie.Title,
        Year: movie.Year,
        Genre: movie.Genre,
        Plot: movie.Plot,
        Director: movie.Director,
        Actors: movie.Actors
    });

    // Check if we have enough movie details
    if (!movie.Genre || !movie.Plot || !movie.Director || !movie.Actors) {
        console.log('Missing movie details, using fallback recommendations');
        return getGenreBasedRecommendations(movie);
    }

    try {
        const response = await fetch('https://api.projects.joinplayground.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You recommend movies in a casual, friendly way. Focus on the fun and unique aspects that make this specific movie special, like:\n- Cool character moments or relationships\n- Fun plot twists or surprises\n- Memorable scenes that stick with you\n- The overall vibe or feeling\n- Things that make you smile or get excited\n\nWrite like you're telling a friend why they'd love this movie. Be specific and fun - no generic stuff about genres or basic plot. Each reason should start with 'You' and be in present tense. Keep it short and sweet (under 75 characters)."
                }, {
                    role: "user",
                    content: `Give me 3 fun, specific reasons why someone would enjoy "${movie.Title}" (${movie.Year}). Here's what I know about it:
                        Genre: ${movie.Genre}
                        Plot: ${movie.Plot}
                        Director: ${movie.Director}
                        Actors: ${movie.Actors}
                        
                        Remember:
                        ❌ "You like action movies"
                        ✅ "You love watching the hero pull off impossible stunts"
                        ❌ "You enjoy great acting"
                        ✅ "You crack up at the hilarious chemistry between characters"`
                }],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            console.error('API Error:', await response.text());
            throw new Error('Failed to generate recommendations');
        }

        const data = await response.json();
        console.log('API Response:', data);

        const recommendations = data.choices[0].message.content
            .split('\n')
            .filter(rec => rec.trim())
            .map(rec => rec.replace(/^\d+\.\s*/, '').trim())
            .slice(0, 3);

        // Verify we got unique recommendations
        if (recommendations.length === 3 && 
            new Set(recommendations).size === 3 && 
            !recommendations.some(rec => rec.length > 75)) {
            return recommendations;
        } else {
            console.log('Invalid recommendations received:', recommendations);
            return getGenreBasedRecommendations(movie);
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return getGenreBasedRecommendations(movie);
    }
}

// Function to get genre-based recommendations
function getGenreBasedRecommendations(movie) {
    const genre = movie.Genre?.toLowerCase() || '';
    const recommendations = {
        action: [
            'You love watching things blow up in creative ways',
            'You get excited by perfectly choreographed fight scenes',
            'You enjoy rooting for the underdog in impossible situations',
            'You like seeing regular people become unexpected heroes',
            'You get pumped up by high-speed chases',
            'You enjoy watching skilled fighters show off their moves'
        ],
        comedy: [
            'You crack up at awkward social situations',
            'You enjoy clever wordplay and running gags',
            'You like watching ridiculous plans spiral out of control',
            'You appreciate dry, deadpan humor',
            'You laugh at characters getting into silly misunderstandings',
            'You enjoy watching friendship dynamics develop through humor'
        ],
        drama: [
            'You enjoy watching complex family relationships unfold',
            'You like seeing characters grow through tough decisions',
            'You appreciate stories that make you think differently',
            'You get invested in realistic character conflicts',
            'You enjoy watching people overcome personal struggles',
            'You like when movies tackle meaningful social issues'
        ],
        romance: [
            'You enjoy watching awkward first dates turn into something special',
            'You like seeing unlikely couples find common ground',
            'You get butterflies from perfect romantic moments',
            'You appreciate slow-burn relationships with great chemistry',
            'You enjoy watching love overcome obstacles',
            'You like seeing characters realize they were meant for each other'
        ],
        horror: [
            'You enjoy being scared in creative ways',
            'You like movies that keep you on edge the whole time',
            'You appreciate clever psychological mind games',
            'You enjoy piecing together creepy mysteries',
            'You like when normal situations turn terrifying',
            'You get excited by unexpected plot twists in scary movies'
        ],
        'sci-fi': [
            'You enjoy seeing creative visions of the future',
            'You like when movies explore wild "what if" scenarios',
            'You appreciate mind-bending technological concepts',
            'You enjoy seeing humanity tackle cosmic challenges',
            'You like when science fiction asks deep questions',
            'You get excited by innovative special effects'
        ],
        thriller: [
            'You enjoy movies that keep you guessing until the end',
            'You like feeling your heart race during tense moments',
            'You appreciate clever cat-and-mouse games',
            'You enjoy trying to solve mysteries alongside characters',
            'You like when movies keep you on the edge of your seat',
            'You get excited by unexpected plot twists'
        ],
        fantasy: [
            'You enjoy escaping to magical worlds',
            'You like seeing ordinary rules get bent or broken',
            'You appreciate creative creature designs',
            'You enjoy watching characters discover magical abilities',
            'You like seeing good triumph over evil in epic ways',
            'You get excited by magical duels and battles'
        ],
        animation: [
            'You enjoy seeing art come to life in unique ways',
            'You like when movies can break the rules of reality',
            'You appreciate creative visual storytelling',
            'You enjoy seeing impossible things made possible',
            'You like when serious topics are handled in accessible ways',
            'You get excited by unique animation styles'
        ],
        mystery: [
            'You enjoy putting together clues before the characters do',
            'You like when movies keep you guessing until the last minute',
            'You appreciate clever misdirection and red herrings',
            'You enjoy watching detectives piece things together',
            'You like movies that make you think outside the box',
            'You get excited when all the pieces finally click'
        ],
        crime: [
            'You enjoy watching complex heists unfold',
            'You like seeing justice served in unexpected ways',
            'You appreciate morally gray characters',
            'You enjoy seeing both sides of the law',
            'You like when plans go wrong in interesting ways',
            'You get excited by clever criminal schemes'
        ],
        adventure: [
            'You enjoy watching epic journeys to amazing places',
            'You like seeing characters explore unknown territories',
            'You appreciate creative solutions to dangerous situations',
            'You enjoy watching unlikely teams work together',
            'You like when ordinary people face extraordinary challenges',
            'You get excited by treasure hunts and discoveries'
        ]
    };

    // Get all genres for this movie
    const movieGenres = genre.split(',').map(g => g.trim().toLowerCase());
    let genreRecommendations = [];

    // Get recommendations for each genre
    movieGenres.forEach(movieGenre => {
        for (const [key, values] of Object.entries(recommendations)) {
            if (movieGenre.includes(key.toLowerCase())) {
                genreRecommendations = [...genreRecommendations, ...values];
            }
        }
    });

    // If no specific genre recommendations found, use drama as fallback
    if (genreRecommendations.length === 0) {
        genreRecommendations = recommendations.drama;
    }

    // Get unique recommendations and shuffle them
    const uniqueRecommendations = [...new Set(genreRecommendations)];
    const shuffled = uniqueRecommendations.sort(() => 0.5 - Math.random());
    
    // Return 3 random recommendations
    return shuffled.slice(0, 3);
}

// Cache for storing generated recommendations
const recommendationsCache = new Map();

// Function to get recommendations (using cache if available)
async function getMovieRecommendations(movie) {
    const cacheKey = movie.imdbID;
    
    // Check if recommendations are in cache
    if (recommendationsCache.has(cacheKey)) {
        return recommendationsCache.get(cacheKey);
    }
    
    // Generate new recommendations
    const recommendations = await generatePersonalizedRecommendations(movie);
    
    // Cache the recommendations (whether they're AI or fallback)
    recommendationsCache.set(cacheKey, recommendations);
    
    return recommendations;
}

// Export the functions
window.getMovieRecommendations = getMovieRecommendations; 