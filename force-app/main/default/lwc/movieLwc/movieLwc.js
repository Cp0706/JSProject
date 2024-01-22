// movieAppComponent.js
import { LightningElement, wire } from 'lwc';
import getMovieData from '@salesforce/apex/MovieAppController.getMovieData';
import getSearchMovie from '@salesforce/apex/MovieAppController.getSearchMovie';

export default class MovieAppComponent extends LightningElement {

   showAllMovies = false;
   showSearchedMovie = false;
   seachedMovieData;
   moviesData ;
    @wire(getMovieData)
   getData({data, error}) {
      if(data) {
         this.moviesData = data;
         this.showAllMovies = true;
      }
      else {
         console.log(error);
      }
    }

    searchMovie(event) {
      const selectMovieId = event.detail.recordId;
      console.log(selectMovieId);
      getSearchMovie({ recordId : selectMovieId})
         .then(result => {
            this.seachedMovieData= result;
            console.log(result);
            this.showAllMovies = false;
            this.showSearchedMovie = true;
         })
         .catch(error =>{
            console.error('Error retrieving selected movie:', error);
         })
   
   }
    
}
