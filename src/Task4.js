let movieIds;
let data;
let selectedGenres = [];
let selectedCastName;
let combinedData;


const personUrl = 'https://api.themoviedb.org/3/person/';
const apiKey = '42ee719896b25f8821890615eeabf17f';
const movieUrl = 'https://api.themoviedb.org/3/movie/';
const imageUrl = 'https://image.tmdb.org/t/p/original';

import('./moviesPlay.js')
  .then(res => {
    console.log('data imported into data constant');
    data = res;
    var castData = data.castData;
        console.log('castData:', castData);
          //filteredMoviesOutput = run(); // Save the output from run()
          // Create a new array with only title and tmdbId properties
       let simplifiedMovies = data.hindiMovies.map(movie => ({
            name: movie.title,
            id: movie.tmdbId
        }));
        console.log(simplifiedMovies);
        // Combine castData and simplifiedMovies into a single array
        combinedData = castData.concat(simplifiedMovies);
        console.log(combinedData);
    //showGenres();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.getElementById('searchInput');
    var suggestionsContainer = document.getElementById('suggestionsContainer');
 
    searchInput.addEventListener('input', function () {
      var searchTerm = searchInput.value.toLowerCase();
      if (searchTerm.length >= 3) {
        var filteredCast = combinedData.filter(function (castMember) {
            return castMember.name.toLowerCase().includes(searchTerm);
        });
        displaySuggestions(filteredCast);
    } else {
        // Clear suggestions if the input length is less than 3
        suggestionsContainer.innerHTML = '';
    }
});
 
    function displaySuggestions(suggestions) {
      suggestionsContainer.innerHTML = '';
 
      suggestions.forEach(function (castMember) {
        var suggestionDiv = document.createElement('div');
        suggestionDiv.classList.add('suggestion');
        suggestionDiv.textContent = castMember.name;
 
        suggestionDiv.addEventListener('click', function () {
          selectedCastName = castMember.name;
          console.log('selected cast name is : ',selectedCastName);
          // Handle selection (you can customize this)
          //alert('Selected: ' + castMember.name);
          // Clear the search input and suggestions
          searchInput.value = selectedCastName ;
          suggestionsContainer.innerHTML = '';
        });
 
        suggestionsContainer.appendChild(suggestionDiv);
      });
    }
  });


  function searchMovies() {
    // Get the search input value
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
  
    // Filter movies based on the search value
    const filteredEnglishMovies = data.movies.filter(movie => {
        // Check if the search value matches the movie title or any cast name
        return (
            movie.title.toLowerCase().includes(searchValue) ||
            movie.cast.some(actor => actor.name.toLowerCase().includes(searchValue))
        );
    });
    const filteredHindiMovies = data.hindiMovies.filter(movie => {
      // Check if the search value matches the movie title or any cast name
      return (
          movie.title.toLowerCase().includes(searchValue) ||
          movie.cast.some(actor => actor.name.toLowerCase().includes(searchValue))
      );
  });

  filteredMovies = filteredHindiMovies.concat(filteredEnglishMovies);
    // Display the search results
    movieIds = filteredMovies.map(movie => movie.tmdbId);
    getMovieInformation();
}

function getMovieInformation() {
  console.log('Line 88---->', movieIds);
  const fetchArray = movieIds.map(movieId => {
    return (
      fetch(`${movieUrl}${movieId}?api_key=${apiKey}`)
        .then(response => response.json())
    );
  });

  Promise.all(fetchArray)
    .then(fetchResponses => {
      const moviesInfo = fetchResponses.map(resp => {
        return {
          id: resp.id, overview: resp.overview,
          posterPath: resp.poster_path, releaseDate: resp.release_date,
          runTime: resp.runtime, tagLine: resp.tagline,
          title: resp.title
        };
      });
      console.log('line 106 ',moviesInfo);
      if(moviesInfo.length == 0) {
         console.log('inside If');
         document.getElementById('content').innerHTML = "<h1>No Movies Found </h1>";
      }else{
      document.getElementById('content').innerHTML = getMovieHtml(moviesInfo);
      }
    });
}

function getMovieHtml(moviesInfo) {
  let movieHtml = '<div class="ui cards">';

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
    `;
  }, '');

  movieHtml += `${movieCards}</div>`;
  console.log(movieHtml);
  return movieHtml;
}
