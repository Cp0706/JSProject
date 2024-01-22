public with sharing class MovieAppController {

    @AuraEnabled(cacheable=true)
    public static List<Movie__c> getMovieData(){
       List<Movie__c> movies = [Select Id, TMDB_Id__c , Name, Release_Date__c, Genre__c, Poster_path__C, Description__c FROM Movie__c];
       return movies;
    }

    @AuraEnabled
    public static Movie__c getSearchMovie(String recordId){
        Id movieId = (Id)recordId;
       return ([Select Id, TMDB_Id__c , Name, Release_Date__c, Genre__c, Poster_path__C, Description__c FROM Movie__c WHERE Id = :movieId LIMIT 1]);
    }
}