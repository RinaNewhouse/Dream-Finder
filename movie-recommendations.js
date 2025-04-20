function generateRecommendations(movie) {
    const genre = movie.Genre?.toLowerCase() || '';
    const plot = movie.Plot?.toLowerCase() || '';
    
    const recommendations = {
        action: [
            'You enjoy intense action sequences and thrilling stunts',
            'You like seeing heroes overcome impossible odds',
            'You appreciate well-choreographed fight scenes'
        ],
        adventure: [
            'You enjoy exciting journeys and exploration',
            'You like seeing characters face challenges',
            'You appreciate epic quests and discoveries'
        ],
        animation: [
            'You enjoy creative visual storytelling',
            'You like family-friendly entertainment',
            'You appreciate artistic animation styles'
        ],
        biography: [
            'You enjoy learning about real people\'s lives',
            'You like historical accuracy and authenticity',
            'You appreciate stories of personal triumph and struggle'
        ],
        comedy: [
            'You enjoy witty dialogue and clever humor',
            'You like seeing characters in awkward situations',
            'You appreciate light-hearted entertainment'
        ],
        crime: [
            'You enjoy detective stories and investigations',
            'You like seeing justice served',
            'You appreciate complex criminal plots'
        ],
        documentary: [
            'You enjoy learning about real-world topics',
            'You like factual and educational content',
            'You appreciate in-depth exploration of subjects'
        ],
        drama: [
            'You enjoy deep character development',
            'You like emotional storytelling',
            'You appreciate thought-provoking themes'
        ],
        family: [
            'You enjoy wholesome entertainment',
            'You like stories that bring people together',
            'You appreciate positive messages and values'
        ],
        fantasy: [
            'You enjoy magical worlds and creatures',
            'You like epic quests and adventures',
            'You appreciate imaginative storytelling'
        ],
        'film-noir': [
            'You enjoy dark and moody atmospheres',
            'You like complex moral dilemmas',
            'You appreciate stylish cinematography and shadows'
        ],
        history: [
            'You enjoy learning about past events',
            'You like seeing historical periods brought to life',
            'You appreciate accurate period details'
        ],
        horror: [
            'You enjoy suspense and jump scares',
            'You like psychological thrillers',
            'You appreciate atmospheric tension'
        ],
        musical: [
            'You enjoy song and dance numbers',
            'You like expressive storytelling through music',
            'You appreciate theatrical performances'
        ],
        mystery: [
            'You enjoy solving puzzles and riddles',
            'You like uncovering hidden secrets',
            'You appreciate clever plot twists'
        ],
        romance: [
            'You enjoy watching relationships develop',
            'You like emotional love stories',
            'You appreciate romantic tension and chemistry'
        ],
        'sci-fi': [
            'You enjoy futuristic concepts and technology',
            'You like exploring philosophical questions',
            'You appreciate imaginative world-building'
        ],
        sport: [
            'You enjoy competitive athletics',
            'You like underdog stories and comebacks',
            'You appreciate team spirit and determination'
        ],
        thriller: [
            'You enjoy suspense and mystery',
            'You like plot twists and surprises',
            'You appreciate psychological tension'
        ],
        war: [
            'You enjoy military strategy and tactics',
            'You like stories of courage and sacrifice',
            'You appreciate historical conflict narratives'
        ],
        western: [
            'You enjoy frontier adventures',
            'You like tales of justice in the Old West',
            'You appreciate rugged landscapes and gunfights'
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