public class Station {
    private int elevation, timezone, snowDepth;
    private double lat, lng;
    private String triplet, state, name, stateName, urlName;
    private boolean wind;

    public Station(
            int elevation, double lat, double lng, int timezone, String triplet,
            boolean wind, int snowDepth, String state, String name, String stateName,
            String urlName
    ) {
        this.elevation = elevation;
        this.lat = lat;
        this.lng = lng;
        this.timezone = timezone;
        this.triplet = triplet;
        this.wind = wind;
        this.snowDepth = snowDepth;
        this.state = state;
        this.name = name;
        this.stateName = stateName;
        this.urlName = urlName;
    }

    public String getTriplet() {
        return triplet;
    }

    public String getState() {
        return state;
    }

    public int getSnowDepth() {
        return snowDepth;
    }
}
