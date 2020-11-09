class Mappable {
    String name, urlName;
    double lat, lng;

    public Mappable() {

    }

    Mappable(String name, String urlName, double lat, double lng) {
        this.name = name;
        this.urlName = urlName;
        this.lat = lat;
        this.lng = lng;
    }
}