let movieIds; // Fix variable name to match usage
let data;
const personUrl = 'https://api.themoviedb.org/3/person/';
const apiKey = '42ee719896b25f8821890615eeabf17f';
const movieUrl = 'https://api.themoviedb.org/3/movie/';
const imageUrl = 'https://image.tmdb.org/t/p/original';

import('./moviesPlay.js')
.then(res => {
console.log('data imported into data constant');
data = res;
});

function setMovieType() {
    const selectedMovieType = document.querySelector('input[name="frequency"]:checked').value;
    showMovie(selectedMovieType);
}

function showMovie(selectedMovieType) {
    console.log(selectedMovieType);
    if (selectedMovieType === "International") {
        movieIds = data.movies.map(movie => movie.tmdbId); // Fix property access
        getMovieInformation();
    }
    else if(selectedMovieType === "Hindi") {
        movieIds = data.hindiMovies.map(movie => movie.tmdbId); // Fix property access
        getMovieInformation();
    }
    else if(selectedMovieType === "All") {
        const hindimovieIds = data.hindiMovies.map(movie => movie.tmdbId); // Fix property access
        const englishmovieIds = data.movies.map(movie => movie.tmdbId);
        movieIds = englishmovieIds.concat(hindimovieIds);
        getMovieInformation();
    }
}

function getMovieInformation() {
    console.log('Line 40---->',movieIds);
    const fetchArray = movieIds.map(movieId => {
        return (
            fetch(`${movieUrl}${movieId}?api_key=${apiKey}`)
                .then(response => response.json())
        )
    });
    Promise.all(fetchArray)
        .then(fetchResponses => {
            const moviesInfo = fetchResponses.map(resp => {
                return {
                    id: resp.id, overview: resp.overview,
                    posterPath: resp.poster_path, releaseDate: resp.release_date,
                    runTime: resp.runtime, tagLine: resp.tagline,
                    title: resp.title
                }
            })
            console.log(moviesInfo);
            document.getElementById('content').innerHTML = getMovieHtml(moviesInfo);
        })
}

function getMovieHtml(moviesInfo) {
    let movieHtml = '<div class="ui cards">'

    const movieCards = moviesInfo.reduce((html, movie) => {
        return html + `
            <div class="card">
                <div class="image">
                        <img src='${imageUrl}${movie.posterPath}' />
                </div>
                <div class="content">
                    <div class="header">${movie.title}</div>
                    <div class="meta">
                        <a>${movie.releaseDate}</a>
                    </div>
                    <div class="description">
                        ${movie.tagLine}
                    </div>
                </div>
            </div>
        `
    }, '');

    movieHtml += `${movieCards}</div>`;
    console.log(movieHtml);
    return movieHtml;
}
