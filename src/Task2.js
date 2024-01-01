let data;
const personUrl = 'https://api.themoviedb.org/3/person/';
const apiKey = '42ee719896b25f8821890615eeabf17f';
const movieUrl = 'https://api.themoviedb.org/3/movie/';
const imageUrl = 'https://image.tmdb.org/t/p/original';
 
import('./moviesPlay.js')
.then(res => {
  console.log('Data imported into data constant');
  data = res;
  startfunction();
});
 
function startfunction() {
const movies = data.movies;
const decades = getDecadesArray(movies);
populateDecadeDropdown(decades);
 
// Add event listener for dropdown change
document.getElementById('decadeDropdown').addEventListener('change', function () {
  const selectedDecade = this.value;
  const filteredMovies = filterMoviesByDecade(movies, selectedDecade);
  getMovieInformation(filteredMovies);
 
});
}
 
function getDecadesArray(movies) {
const decadesSet = new Set();
movies.forEach(movie => {
  const decade = getDecade(movie.releaseDate);
  decadesSet.add(decade);
});
return Array.from(decadesSet);
}
 
function populateDecadeDropdown(decades) {
const dropdown = document.getElementById('decadeDropdown');
decades.forEach(decade => {
  const option = document.createElement('option');
  option.value = decade;
  option.textContent = decade;
  dropdown.appendChild(option);
});
}
 
function filterMoviesByDecade(movies, decade) {
return movies.filter(movie => getDecade(movie.releaseDate) === decade);
}
 
function getDecade(releaseDate) {
const year = new Date(releaseDate).getFullYear();
const decade = Math.floor(year / 10) * 10;
return `${decade}-${decade + 9}`;
}
 
 
function getMovieInformation(filteredMovies) {
  console.log("line 59",filteredMovies);
  let movieIds = [];
  filteredMovies.forEach(movie => {
    movieIds.push(movie.tmdbId);
  } )
  console.log('Line 64--->', movieIds);
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
          displayMovies(moviesInfo);
      })
}
 
 
 
 
 
 
function displayMovies(movies) {
let  resultContainer = '<br/><div class="ui link cards">'
 
const movieCards = movies.reduce((html, movie) => {
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
 
resultContainer += `${movieCards}</div>`;
console.log(resultContainer);
//return resultContainer;
document.getElementById('resultContainer').innerHTML = resultContainer;
 
}