let movieIds;
let data;
let selectedGenres = [];
const personUrl = 'https://api.themoviedb.org/3/person/';
const apiKey = '42ee719896b25f8821890615eeabf17f';
const movieUrl = 'https://api.themoviedb.org/3/movie/';
const imageUrl = 'https://image.tmdb.org/t/p/original';

let moviesIdbyLanguage;
let moviesIdbyGenres;
let moviesIdbySearch;
let filteredMoviesByDecade;

import('./src/moviesPlay.js')
   .then(res => {
      data = res;
      var castData = data.castData;
      let simplifiedMovies = data.hindiMovies.map(movie => ({
         name: movie.title,
         id: movie.tmdbId
      }));
      combinedData = castData.concat(simplifiedMovies);
      showGenres();
      startfunction();
   });

function startfunction() {
   const movies = data.movies.concat(data.hindiMovies);
   const decades = getDecadesArray(movies);
   populateDecadeDropdown(decades);
   document.getElementById('decadeDropdown').addEventListener('change', function () {
      const selectedDecade = this.value;
      filteredMoviesByDecade = filterMoviesByDecade(movies, selectedDecade);
      filteredMoviesByDecade = filteredMoviesByDecade.map(movie => movie.tmdbId);
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

function getDecade(releaseDate) {
   const year = new Date(releaseDate).getFullYear();
   const decade = Math.floor(year / 10) * 10;
   return `${decade}-${decade + 9}`;
}

function populateDecadeDropdown(decades) {
   const dropdown = document.getElementById('decadeDropdown');
   const firstOption = document.createElement('option');
   firstOption.value = -1;
   firstOption.textContent = "Select Decade";
   dropdown.appendChild(firstOption);
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

function setMovieType() {
   const selectedMovieType = document.querySelector('input[name="frequency"]:checked').value;
   setMovieFilter(selectedMovieType);
}

function setMovieFilter(selectedMovieType) {
   if (selectedMovieType === "International") {
      moviesIdbyLanguage = data.movies.map(movie => movie.tmdbId);
   }
   else if (selectedMovieType === "Hindi") {
      moviesIdbyLanguage = data.hindiMovies.map(movie => movie.tmdbId);
   }
   else if (selectedMovieType === "All") {
      const hindimovieIds = data.hindiMovies.map(movie => movie.tmdbId);
      const englishmovieIds = data.movies.map(movie => movie.tmdbId);
      moviesIdbyLanguage = englishmovieIds.concat(hindimovieIds);
   }
}

function showGenres() {
   let checkboxHTML = '<div id="GenresContainer">';
   data.genres.forEach(element => {
      checkboxHTML += `<input type="checkbox" name="${element.name}" value="${element.id}"/>
                        <label  style = "font-size: 15px">${element.name}</label> <br/>`;
   });
   checkboxHTML += '</div>';
   document.getElementById('Genres').innerHTML = checkboxHTML;
   document.getElementById('GenresContainer').addEventListener('change', function (event) {
      if (event.target.type === 'checkbox') {
         const genreId = parseInt(event.target.value);
         if (event.target.checked) {
            selectedGenres.push(genreId);
         } else {
            const index = selectedGenres.indexOf(genreId);
            if (index !== -1) {
               selectedGenres.splice(index, 1);
            }
         }
      }
   });
}

function setCondition() {
   let selectedCondition = "";
   const andRadio = document.getElementById("andRadio");
   const orRadio = document.getElementById("orRadio");
   if (andRadio.checked) {
      selectedCondition = "AND";
      run(selectedCondition);
   } else if (orRadio.checked) {
      selectedCondition = "OR";
      run(selectedCondition);
   } else {
      selectedCondition = "";
   }
}

function run(selectedCondition) {
   let filteredMovies = [];
   if (selectedCondition === "AND") {
      data.movies.forEach(movie => {
         const hasAllGenres = selectedGenres.every(genreId =>
            movie.genres.some(genre => genre.id === genreId)
         );

         if (hasAllGenres) {
            filteredMovies.push(movie);
         }
      });
      data.hindiMovies.forEach(movie => {
         const hasAllGenres = selectedGenres.every(genreId =>
            movie.genres.some(genre => genre.id === genreId)
         );

         if (hasAllGenres) {
            filteredMovies.push(movie);
         }
      });
   } else {
      selectedGenres.forEach(genreId => {
         let moviesWithGenre = data.movies.filter(movie =>
            movie.genres.some(genre => genre.id === genreId)
         );
         let hindimoviesWithGenre = data.hindiMovies.filter(movie =>
            movie.genres.some(genre => genre.id === genreId)
         );
         moviesWithGenre = moviesWithGenre.concat(hindimoviesWithGenre);
         filteredMovies = filteredMovies.concat(moviesWithGenre);
      });
   }

   filteredMovies = Array.from(new Set(filteredMovies));
   moviesIdbyGenres = filteredMovies.map(movie => movie.tmdbId);
}

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
         suggestionsContainer.innerHTML = '';
      }
   });

   function displaySuggestions(suggestions) {
      suggestions.forEach(function (castMember) {
         var suggestionDiv = document.createElement('div');
         suggestionDiv.classList.add('suggestion');
         suggestionDiv.textContent = castMember.name;

         suggestionDiv.addEventListener('click', function () {
            selectedCastName = castMember.name;
            searchInput.value = selectedCastName;
            suggestionsContainer.innerHTML = '';
         });
         suggestionsContainer.appendChild(suggestionDiv);
      });
   }
});

function searchMovies() {
   const searchValue = document.getElementById('searchInput').value.toLowerCase();
   const filteredEnglishMovies = data.movies.filter(movie => {
      return (
         movie.title.toLowerCase().includes(searchValue) ||
         movie.cast.some(actor => actor.name.toLowerCase().includes(searchValue))
      );
   });
   const filteredHindiMovies = data.hindiMovies.filter(movie => {
      return (
         movie.title.toLowerCase().includes(searchValue) ||
         movie.cast.some(actor => actor.name.toLowerCase().includes(searchValue))
      );
   });
   filteredMovies = filteredHindiMovies.concat(filteredEnglishMovies);
   movieIds = filteredMovies.map(movie => movie.tmdbId);
   getMovieInformation();
}

function showMovie() {
   setMovieType();
   setCondition();
   if (selectedGenres) {
      movieIds = moviesIdbyLanguage;
   }
   if (moviesIdbyGenres.length != 0) {
      movieIds = moviesIdbyLanguage.filter(function (element) {
         return moviesIdbyGenres.includes(element);
      });
   }
   if (filteredMoviesByDecade) {
      movieIds = movieIds.filter(function (element) { return filteredMoviesByDecade.includes(element) });
   }
   getMovieInformation();
}

function showSearchedMovie() {
   searchMovies();
}

function getMovieInformation() {
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
         if (moviesInfo.length == 0) {
            document.getElementById('content').innerHTML = `<h1 style = "color: white">No Movies Found </h1>`;
         } else {
            document.getElementById('content').innerHTML = getMovieHtml(moviesInfo);
         }
      });
}

function getMovieHtml(moviesInfo) {
   let movieHtml = '<div class="ui link cards">';
   const movieCards = moviesInfo.reduce((html, movie) => {
      return html + `
         <div class="card">
            <div class="image">
               <a href='./movie.html?id=${movie.id}&posterPath=${movie.posterPath}'>
                  <img src='${imageUrl}${movie.posterPath}' />
               </a>
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
   return movieHtml;
}
