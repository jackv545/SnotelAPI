import java.time.LocalDateTime;

public class Station extends Mappable {
    private int elevation, timezone, snowDepth;
    private String triplet, state, stateName;
    private boolean wind;
    private LocalDateTime lastUpdated;

    public Station(
        int elevation, double lat, double lng, int timezone, String triplet, boolean wind, int snowDepth,
        String state, String name, String stateName, String urlName
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

    public Station(
        int elevation, double lat, double lng, int timezone, String triplet, boolean wind, int snowDepth,
        String state, String name, String stateName, String urlName, LocalDateTime lastUpdated
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
        this.lastUpdated = lastUpdated;
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
