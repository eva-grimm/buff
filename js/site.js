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

        let movieParagraphElement = movieCard.querySelector('.card-text');
        movieParagraphElement.textContent = movie.overview;

        let moviePoster = movieCard.querySelector('.card-img-top');
        moviePoster.setAttribute('src', `https://image.tmdb.org/t/p/w500${movie.poster_path}`);

        let infoButton = movieCard.querySelector('button');
        infoButton.setAttribute('data-movie-id', movie.id)

        movieListDiv.appendChild(movieCard);
    });
}

async function showMovieDetails(btn) {
    const youtubeTemplate = document.getElementById('youtube-video');
    let movieId = btn.getAttribute('data-movie-id')
    let movieModal = document.getElementById('movie-modal')

    try {
        // details
        let detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        let movie = await detailsResponse.json();

        // credits (cast & crew)
        let creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        let movieCredits = await creditsResponse.json();

        // trailer ID
        let trailerIdResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        let movieTrailer = await trailerIdResponse.json();

        let title = movieModal.querySelector('.modal-title');
        title.textContent = movie.title;

        // left column
        let poster = movieModal.querySelector('img');
        poster.setAttribute('src', `https://image.tmdb.org/t/p/w500${movie.poster_path}`);

        // middle column
        let tagline = movieModal.querySelector('.movie-tagline');
        tagline.textContent = movie.tagline;

        let director = movieModal.querySelector('.movie-director');
        let directorHtml = ''
        for (let i = 0; i < movieCredits.crew.length; i++) {
            movieCredits.crew[i].job == 'Director' ? directorHtml += `${movieCredits.crew[i].name}<br>` : '';
        }
        director.innerHTML = directorHtml;

        let writer = movieModal.querySelector('.movie-writer');
        let writerHtml = ''
        for (let i = 0; i < movieCredits.crew.length; i++) {
            movieCredits.crew[i].job == 'Screenplay' || movieCredits.crew[i].job == 'Writer' ? writerHtml += `${movieCredits.crew[i].name}<br>` : '';
        }
        writer.innerHTML = writerHtml;

        let stars = movieModal.querySelector('.movie-stars');
        let starsHtml = '';
        for (let i = 0; i < 4; i++) {
            starsHtml += `${movieCredits.cast[i].name}, ${movieCredits.cast[i].character}<br>`
        }
        stars.innerHTML = starsHtml;

        let genres = movieModal.querySelector('.movie-genres');
        let genresHtml = '';
        for (let i = 0; i < movie.genres.length; i++) {
            genresHtml += `${movie.genres[i].name}<br>`
        }
        genres.innerHTML = genresHtml;

        // right column
        let desc = movieModal.querySelector('.movie-description');
        desc.textContent = movie.overview;

        let trailer = movieModal.querySelector('.movie-trailer');
        trailer.innerHTML = ''
        let trailerUrl = ''
        for (let i = 0; i < movieTrailer.results.length; i++) {
            movieTrailer.results[i].name == 'Official Trailer' || movieTrailer.results[i].name == 'Main Trailer' ? trailerUrl = `https://www.youtube.com/embed/${movieTrailer.results[i].key}?enablejsapi=1` : ''
        }
        trailerUrl == '' ? trailerUrl = `https://www.youtube.com/embed/${movieTrailer.results[0].key}?enablejsapi=1` : ''
        let youtubeEmbed = youtubeTemplate.content.cloneNode(true);
        youtubeEmbed.querySelector(`iframe`).setAttribute('src', trailerUrl);
        trailer.appendChild(youtubeEmbed);

    } catch (error) {
        console.error(error);
    }
}

function closePlayer() {
    let player = document.getElementById('movie-modal');
    player.querySelector('iframe').setAttribute('src', '');

    // what *SHOULD HAVE* worked...
    // let div = document.getElementById('movie-modal');
    // let player = div.querySelector('.yt-player-iframe');
    // player.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')

    // $('.yt-player-iframe')[0].contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')

    // player.foreach(() => {
    //     this.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
    // });

    // $('.yt-player-iframe').each(function () {
    //     // iframeElement.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
    //     this.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
    // });
}