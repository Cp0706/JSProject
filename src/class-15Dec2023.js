let data
const personUrl = 'https://api.themoviedb.org/3/person/'
const apiKey = '42ee719896b25f8821890615eeabf17f';
const movieUrl = 'https://api.themoviedb.org/3/movie/';
const imageUrl = 'https://image.tmdb.org/t/p/original';
let movieIds;
const queryString = window.location.search;
const queryParamsMap = new URLSearchParams(queryString);
console.log(queryParamsMap.get('id'), queryParamsMap.get('posterPath'));

import('./moviesPlay.js')
	.then(res => {
		console.log('data imported into data constant');
		data = res.movies;
    data = data.concat(res.hindiMovies);
    if (queryString) {
      showMovie(queryParamsMap.get('id'), queryParamsMap.get('posterPath'));
    }
    
	});

function showMovie(id, posterPath) {
  let movieInfo = data.find(movie => {
    return movie.tmdbId === id;
  })
  getCastHtml(movieInfo.cast)
    .then(castHtml => {
      document.getElementById('castInfo').innerHTML = castHtml;
    })

  document.getElementById('title').innerHTML = movieInfo.title;
  document.getElementById('overview').innerHTML = movieInfo.overview;
  document.getElementById('moviePoster').innerHTML = `<img src='${imageUrl}${posterPath}' />`
}

async function getCastHtml(cast) {
  const castFetchArray = cast.map(cm => {
    return (
      fetch(`${personUrl}${cm.id}?api_key=${apiKey}`)
        .then(response => response.json())
    )
  });
  const castResponses = await Promise.all(castFetchArray);

  let castHtml = '<div class="ui cards">'
  castResponses.forEach(cr => {
    castHtml+= `
      <div class="card">
        <div class="content">
          <img class="right floated mini ui image" src="${imageUrl}${cr.profile_path}">
          <div class="header">
            ${cr.name}
          </div>
          <div class="meta">
            ${cr.birthday}
          </div>
        </div>
      </div>
    `
  })
  castHtml+= '</div>';
  
  return castHtml;
}