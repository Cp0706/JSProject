public class DeserializingMoiveData {
    static String inputJson = '';
    static List<Movie> movies = new List<Movie>();

    public class Movie {
        public String tmdbId;
        public String originalTitle;
        public List<CastMember> castMembers;
        public String releaseDate;
        public String overview;
        public List<Genres> genres;
    }

    public class Genres {
        public String Name;
    }

    public class CastMember {
        public String castId;
        public String id;
        public String name;
        public String character;
    }

    // Function to fetch data from a JSON file
    public static void getFileData() {
        String jsonFileId = '0695j00000KqDsxAAF';
        ContentVersion jsonFileText = [SELECT VersionData FROM ContentVersion WHERE ContentDocumentId = :jsonFileId AND IsLatest = true LIMIT 1];
        Blob jsonFileBody = jsonFileText.VersionData;
        inputJson = jsonFileBody.toString();
        parse();
    }

    // Function to parse the JSON data and populate the 'movies' list
    public static void parse() {
        JSONParser parser = JSON.createParser(inputJson);
        while (parser.nextToken() != null) {
            if (parser.getCurrentToken() == JSONToken.START_ARRAY) {
                while (parser.nextToken() != null) {
                    if (parser.getCurrentToken() == JSONToken.START_OBJECT) {
                        Movie mov = (Movie) parser.readValueAs(Movie.class);
                        parser.skipChildren();
                        movies.add(mov);
                    }
                }
            }
        }
        insertMovies();
        inserActors();
        inserCast();
        GetMoviePosterPathBatch myjob = new GetMoviePosterPathBatch();
        System.debug(Database.executeBatch(myjob,10));
    }

    // Function to insert movie records into the database
    public static void insertMovies() {
        List<Movie__c> movieRecords = new List<Movie__c>();
        for (Movie mov : movies) {
            String genres = '';
            Movie__c movie = new Movie__c();
            movie.Name = mov.originalTitle;
            movie.TMDB_Id__c = mov.tmdbId;
            Date releaseDate = Date.valueOf(mov.releaseDate);
            movie.Release_Date__c = releaseDate;
            movie.Description__c = mov.overview;
            if(mov.genres.size() !=0){
            for (Genres genre : mov.genres) { 
                genres = genres + genre.Name + ';';
            }
            movie.Genre__c = genres;
        }
            movieRecords.add(movie);
        }
        insert movieRecords;
    }

    // Function to insert actor records into the database
    public static void inserActors() {
        Map<String, String> actorRecordsMap = new Map<String, String>();
        List<Actor__c> actorRecordList = new List<Actor__c>();
        for (Movie mov : movies) {           
            for (CastMember cm : mov.castMembers) {
                actorRecordsMap.put(cm.id, cm.name);
            }
        }
        for (String key : actorRecordsMap.keySet()) {
            Actor__c actor = new Actor__c();
            actor.Name = actorRecordsMap.get(key);
            actor.Actor_Id__c = key;
            actorRecordList.add(actor);
        }
        insert actorRecordList;
    }

    // Function to insert cast records into the database
    public static void inserCast() {
        Map<Integer, CastMember> castRecordsMap = new Map<Integer, CastMember>();
        List<Cast__c> castRecordList = new List<Cast__c>();
        for (Movie mov : movies) {
            for (CastMember cm : mov.castMembers) {
                Cast__c castData = new Cast__c();
                castData.Cast_Name__c = cm.character;
                castData.Cast_Id__c = cm.castId;
                Movie__c movieReference = new Movie__c(TMDB_Id__c = mov.tmdbId);
                Actor__c actorReference = new Actor__c(Actor_Id__c = cm.id);
                castData.Movie__r = movieReference;
                castData.Actor__r = actorReference;
                castRecordList.add(castData);
            }
        }
        insert castRecordList;
    }
}
