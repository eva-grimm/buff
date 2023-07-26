const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0Y2UwYmU2Zjc3ZTQzNjcwNGY5M2YxNGMyN2NiYTRkYSIsInN1YiI6IjY0YzE2ODcxMTNhMzIwMDEzOWYwZDE1YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hVePbawcO8GyZt_u2Aqf3jrn8bjUaKCenPcwX_zWWx0'

async function getMovies() {
    try {
        let response = await fetch('https://api.themoviedb.org/3/movie/popular', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        let data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

async function displayMovies() {
    const movieListDiv = document.getElementById('movie-list');
    const moviePosterTemplate = document.getElementById('movie-card-template');

    // movies is an array of objects
    let data = await getMovies();
    let movies = await data.results;

    movies.forEach(movie => {
        let movieCard = moviePosterTemplate.content.cloneNode(true);
        let title = movieCard.querySelector('.card-body > h5');
        title.textContent = movie.title;
        movieListDiv.appendChild(movieCard);
    });
}