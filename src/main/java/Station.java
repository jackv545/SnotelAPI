public class Station {
    private int elevation, timezone, snowdepth;
    private double lat, lng;
    private String name, triplet;
    private boolean wind;

    public Station(
            int elevation, double lat, double lng, String name,
            int timezone, String triplet, boolean wind, int snowdepth
    ) {
        this.elevation = elevation;
        this.lat = lat;
        this.lng = lng;
        this.name = name;
        this.timezone = timezone;
        this.triplet = triplet;
        this.wind = wind;
        this.snowdepth = snowdepth;
    }

    public String getTriplet() {
        return triplet;
    }
}
