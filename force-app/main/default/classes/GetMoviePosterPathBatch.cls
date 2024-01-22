global class GetMoviePosterPathBatch implements Database.Batchable<sObject>, Database.Stateful, Database.AllowsCallouts {

    private static String personUrl = 'https://api.themoviedb.org/3/person/';
    private static String apiKey = '42ee719896b25f8821890615eeabf17f';
    private static String movieUrl = 'https://api.themoviedb.org/3/movie/';
    private List<Movie__c> movieToUpdate = new List<Movie__c>();
    private Map<Id,Actor__c> actorsMap = new Map<Id,Actor__c>();
    private List<Actor__c> actorToUpdate = new List<Actor__c>();

    global Iterable<sObject> start(Database.BatchableContext bc) {
        return [SELECT Id, tmdb_id__c, (SELECT Actor__c, Actor__r.Actor_Id__c FROM Casts__r) FROM Movie__c];
    }

    global void execute(Database.BatchableContext bc, List<Movie__c> scope) {
        // Your processing logic for each batch of records
        Map<Id,Integer> actorIdMap = new Map<Id,Integer>();
        for (Movie__c movie : scope) {
            HttpResponse movieResponse = makeApiCallout(getMoviePoster(Integer.valueOf(movie.TMDB_ID__C)));
            if (movieResponse.getStatusCode() == 200) {
                Map<String, Object> movieJsonResponse = (Map<String, Object>) JSON.deserializeUntyped(movieResponse.getBody());
                if (movieJsonResponse != null && movieJsonResponse.get('poster_path') != null) {
                    String imageUrl = 'https://image.tmdb.org/t/p/original';
                    movie.Poster_Path__c = (imageUrl + (String) movieJsonResponse.get('poster_path'));
                }
            }
            for (Cast__c cm : movie.Casts__r) {
                actorIdMap.put(cm.Actor__c,Integer.valueOf(cm.Actor__r.Actor_Id__c));
            }
            movieToUpdate.add(movie);
        }
        for(Id key : actorIdMap.keySet() ) {
            HttpResponse actorResponse = makeApiCallout(getActorImage(actorIdMap.get(key)));
            Actor__c actor = new Actor__c();
            actor.id = key;
                if (actorResponse.getStatusCode() == 200) {
                    Map<String, Object> actorJsonResponse = (Map<String, Object>) JSON.deserializeUntyped(actorResponse.getBody());
                    if (actorJsonResponse != null && actorJsonResponse.get('profile_path') != null) {
                        String imageUrl = 'https://image.tmdb.org/t/p/original';
                        actor.Actor_Image__c = (imageUrl + (String) actorJsonResponse.get('profile_path'));
                    }
                }
                actorsMap.put(actor.id, actor);
        }
    }

    global void finish(Database.BatchableContext bc) {
        // Update the processed records
        update movieToUpdate;
        for(Id key : actorsMap.keySet()) {
            actorToUpdate.add(actorsMap.get(key));
        }
       update actorToUpdate ;
    }

    private static String getMoviePoster(Integer movieTmdbId) {
        String moviePosterEndpoint = movieUrl + movieTmdbId;
        return moviePosterEndpoint;
    }

    private static String getActorImage(Integer actorTmdbId) {
        String actorImageEndpoint = personUrl + (actorTmdbId);
        return actorImageEndpoint;
    }

    private HttpResponse makeApiCallout(String url) {
        String apiUrl = url + '?api_key=' + apiKey;
        HttpRequest request = new HttpRequest();
        request.setEndpoint(apiUrl);
        request.setMethod('GET');
        Http http = new Http();
        HttpResponse response = http.send(request);

        return response;
    }
}
