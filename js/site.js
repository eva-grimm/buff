const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0Y2UwYmU2Zjc3ZTQzNjcwNGY5M2YxNGMyN2NiYTRkYSIsInN1YiI6IjY0YzE2ODcxMTNhMzIwMDEzOWYwZDE1YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hVePbawcO8GyZt_u2Aqf3jrn8bjUaKCenPcwX_zWWx0'

async function getMovies() {
    try {
        let response = await fetch('https://api.themoviedb.org/3/movie/popular', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        let data = await response.json();
        let movies = await data.results;
        return movies;
    } catch (error) {
        console.error(error);
    }
}

async function displayMovies() {
    const movieListDiv = document.getElementById('movie-list');
    const movieCardTemplate = document.getElementById('movie-card-template');

    // movies is an array of objects
    let movies = await getMovies();

    movies.forEach(movie => {
        let movieCard = movieCardTemplate.content.cloneNode(true);

        let title = movieCard.querySelector('.card-body > h5');
        title.textContent = movie.title;

        let movieParagraphElement = movieCard.querySelector('.card-text');
        movieParagraphElement.textContent = movie.overview;

        let moviePoster = movieCard.querySelector('.card-img-top');
        moviePoster.setAttribute('src', `https://image.tmdb.org/t/p/w500${movie.poster_path}`);

        let infoButton = movieCard.querySelector('button');
        infoButton.setAttribute('data-movie-id', movie.id)

        movieListDiv.appendChild(movieCard);
    });
}

async function getMovie(movieId) {
    let movie = {}
    try {
        // posters
        let postersResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/images`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        movie.posters = await postersResponse.json();

        // details
        let detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        movie.details = await detailsResponse.json();

        // credits (cast & crew)
        let creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        movie.credits = await creditsResponse.json();

        // trailer ID
        let trailerResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        movie.trailer = await trailerResponse.json();
    } catch (error) {
        console.error(error);
    }
    return movie;
}

async function showMovieDetails(btn) {
    const youtubeTemplate = document.getElementById('youtube-video');
    let movie = await getMovie(btn.getAttribute('data-movie-id'));
    let movieModal = document.getElementById('movie-modal')

    // header
    let title = movieModal.querySelector('.modal-title');
    title.textContent = movie.details.title;
    
    let genres = movieModal.querySelector('.movie-genres');
    let genresHtml = '';
    for (let i = 0; i < movie.details.genres.length; i++) {
        genresHtml += `<button class="btn btn-primary btn-sm px-1 py-0 mx-1">${movie.details.genres[i].name}</button>`
    }
    genres.innerHTML = genresHtml;

    // left column
    let posters = document.getElementById('posters')
    posters.innerHTML = '';

    let primaryPosterTemplate = document.getElementById('primary-poster-template');
    let primaryPosterDiv = primaryPosterTemplate.content.cloneNode(true);
    let primaryPoster = primaryPosterDiv.querySelector('.poster-primary > img');
    primaryPoster.setAttribute('src', `https://image.tmdb.org/t/p/w500${movie.posters.posters[0].file_path}`)
    document.getElementById('posters').appendChild(primaryPosterDiv)

    let secondaryPosterTemplate = document.getElementById('secondary-poster-template');
    for (i = 1; i < movie.posters.posters.length; i++) {
        let secondaryPosterDiv = secondaryPosterTemplate.content.cloneNode(true);
        let secondaryPoster = secondaryPosterDiv.querySelector('.poster-secondary > img')
        secondaryPoster.setAttribute('src', `https://image.tmdb.org/t/p/w500${movie.posters.posters[i].file_path}`)
        document.getElementById('posters').appendChild(secondaryPosterDiv);
    }
    
    // #region middle column
    let release = movieModal.querySelector('.movie-release');
    let releaseDateArry = `${movie.details.release_date}`.split('-');
    let releaseDate = `${releaseDateArry[1]}/${releaseDateArry[2]}/${releaseDateArry[0]}`;
    release.textContent = releaseDate;

    let budget = movieModal.querySelector('.movie-budget');
    let budgetFormat = Intl.NumberFormat('en-us', {
        style: 'currency',
        currency: 'USD',
    });
    budget.textContent = budgetFormat.format(movie.details.budget);

    let runtime = movieModal.querySelector('.movie-runtime');
    let runtimeHours = `${Math.floor(movie.details.runtime / 60)}h`;
    let runtimeMinutes = `${movie.details.runtime % 60}m`;
    let runtimeFormatted = `${runtimeHours} ${runtimeMinutes}`;
    runtime.textContent = runtimeFormatted;

    let director = movieModal.querySelector('.movie-director');
    let directorHtml = ''
    for (let i = 0; i < movie.credits.crew.length; i++) {
        movie.credits.crew[i].job == 'Director' ? directorHtml += `${movie.credits.crew[i].name}` : '';
    }
    director.innerHTML = directorHtml;

    let writer = movieModal.querySelector('.movie-writer');
    let writerHtml = ''
    for (let i = 0; i < movie.credits.crew.length; i++) {
        movie.credits.crew[i].job == 'Screenplay' || movie.credits.crew[i].job == 'Writer' ? writerHtml += `${movie.credits.crew[i].name}` : '';
    }
    writer.innerHTML = writerHtml;

    let stars = movieModal.querySelector('.movie-stars');
    let starsHtml = '';
    for (let i = 0; i < 4; i++) {
        starsHtml += `${movie.credits.cast[i].name}, ${movie.credits.cast[i].character}<br>`
    }
    stars.innerHTML = starsHtml;
    // #endregion middle column

    // #region right column
    let tagline = movieModal.querySelector('.movie-tagline');
    tagline.textContent = movie.details.tagline;

    let desc = movieModal.querySelector('.movie-description');
    desc.textContent = movie.details.overview;

    let trailer = movieModal.querySelector('.movie-trailer');
    trailer.innerHTML = ''
    let trailerUrl = ''
    for (let i = 0; i < movie.trailer.results.length; i++) {
        movie.trailer.results[i].name == 'Official Trailer' || movie.trailer.results[i].name == 'Main Trailer' ? trailerUrl = `https://www.youtube.com/embed/${movie.trailer.results[i].key}?enablejsapi=1` : ''
    }
    trailerUrl == '' ? trailerUrl = `https://www.youtube.com/embed/${movie.trailer.results[0].key}?enablejsapi=1` : ''
    let youtubeEmbed = youtubeTemplate.content.cloneNode(true);
    youtubeEmbed.querySelector(`iframe`).setAttribute('src', trailerUrl);
    trailer.appendChild(youtubeEmbed);
    // #endregion right column
}

function closePlayer() {
    let player = document.getElementById('movie-modal');
    player.querySelector('iframe').setAttribute('src', '');
}