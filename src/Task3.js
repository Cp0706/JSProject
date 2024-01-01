let movieIds;
let data;
let selectedGenres = [];
const personUrl = 'https://api.themoviedb.org/3/person/';
const apiKey = '42ee719896b25f8821890615eeabf17f';
const movieUrl = 'https://api.themoviedb.org/3/movie/';
const imageUrl = 'https://image.tmdb.org/t/p/original';

import('./moviesPlay.js')
  .then(res => {
    console.log('data imported into data constant');
    data = res;
    showGenres();
  });

function showGenres() {
  let checkboxHTML = '<div id="GenresContainer">';
  console.log(data.genres);
  data.genres.forEach(element => {
    checkboxHTML += `<input type="checkbox" name="${element.name}" value="${element.id}"/>
                     <label>${element.name}</label> <br/>`;
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
      console.log("Selected Genres:", selectedGenres);
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
  console.log(selectedCondition);
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
  movieIds = filteredMovies.map(movie => movie.tmdbId);
  console.log(filteredMovies);
  console.log(movieIds);

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
