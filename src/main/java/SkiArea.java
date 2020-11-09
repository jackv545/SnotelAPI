import com.google.gson.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SkiArea extends Mappable {
    private final transient Logger log = LoggerFactory.getLogger(SkiArea.class);

    private final int id;
    private int region;
    private String website;
    private int topElevation, bottomElevation, verticalDrop, operatingStatus;
    private boolean hasDownhill, hasNordic;

    SkiArea(
        int id, int region, String name, String website, double lat, double lng,
        int topElevation, int bottomElevation, int verticalDrop, int operatingStatus,
        boolean hasDownhill, boolean hasNordic
    ) {
        this.id = id;
        this.region = region;
        this.name = name;
        this.website = website;
        this.lat = lat;
        this.lng = lng;
        this.topElevation = topElevation;
        this.bottomElevation = bottomElevation;
        this.verticalDrop = verticalDrop;
        this.operatingStatus = operatingStatus;
        this.hasDownhill = hasDownhill;
        this.hasNordic = hasNordic;
    }

    public SkiArea(int id, String name, int operatingStatus) {
        this.id = id;
        this.name = name;
        this.operatingStatus = operatingStatus;
    }

    public SkiArea(JsonElement skiAreaElement, JsonElement regionElement) {
        if (skiAreaElement.isJsonObject()) {
            JsonObject skiArea = skiAreaElement.getAsJsonObject();

            this.id = skiArea.get("id").getAsInt();
            this.setRegion(regionElement);
            this.setName(skiArea.get("name"));
            this.setWebsite(skiArea.get("official_website"));
            this.setOperatingStatus(skiArea.get("operating_status").getAsInt());
            this.setLatLng(skiArea.get("geo_lat"), skiArea.get("geo_lng"));
            this.setElevation(skiArea);
            this.hasDownhill = skiArea.get("has_downhill").getAsBoolean();
            this.hasNordic = skiArea.get("has_nordic").getAsBoolean();

            log.info("{}", this);
        } else {
            throw new IllegalArgumentException(
                String.format("Expected JsonObject but got: %s", skiAreaElement)
            );
        }
    }


    /*
    Sets the region id from a JsonElement of format:
    "Region": [
        {
            "name": "Colorado",
            "id": "281",
            "RegionsSkiArea": {
                "id": "500",
                "ski_area_id": "500",
                "region_id": "281",
                "temp_region": "6",
                "temp_country": "184"
            }
        }
    ]
    */
    private void setRegion(JsonElement regionElement) {
        this.region = 0;
        if (regionElement.isJsonArray()) {
            JsonArray regionOuterArray = regionElement.getAsJsonArray();
            if (regionOuterArray.size() != 0) {
                JsonElement regionObject = regionOuterArray.get(0);
                if (regionObject.isJsonObject()) {
                    JsonObject region = regionObject.getAsJsonObject();
                    this.region = region.get("id").getAsInt();
                }
            }
        }
    }

    private void setName(JsonElement name) {
        if (name.isJsonNull()) {
            this.name = "";
        } else {
            this.name = name.getAsString();
        }
    }

    private void setWebsite(JsonElement website) {
        if (website.isJsonNull()) {
            this.website = "";
        } else {
            this.website = website.getAsString();
        }
    }

    private void setOperatingStatus(int operatingStatus) {
        int[] options = {0, 1, 2, 3};
        boolean validOperatingStatus = false;

        for (int option : options) {
            if (operatingStatus == option) {
                validOperatingStatus = true;
                break;
            }
        }

        if (validOperatingStatus) {
            this.operatingStatus = operatingStatus;
        } else {
            throw new IllegalArgumentException(
                String.format("Unexpected operating status: %d", operatingStatus)
            );
        }
    }

    public void setLatLng(JsonElement latElement, JsonElement lngElement) {
        if (latElement.isJsonNull() || lngElement.isJsonNull()) {
            this.lat = 0;
            this.lng = 0;
        } else {
            double lat = latElement.getAsDouble();
            double lng = lngElement.getAsDouble();

            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                this.lat = lat;
                this.lng = lng;
            } else {
                throw new IllegalArgumentException(
                    String.format("%s: invalid coordinates [%s, %s]", this.name, lat, lng)
                );
            }
        }
    }

    public void setElevation(JsonObject skiArea) {
        if (
            skiArea.get("top_elevation").isJsonNull()
            || skiArea.get("bottom_elevation").isJsonNull()
            || skiArea.get("vertical_drop").isJsonNull()
        ) {
            this.topElevation = 0;
            this.bottomElevation = 0;
            this.verticalDrop = 0;
        } else {
            this.topElevation = skiArea.get("top_elevation").getAsInt();
            this.bottomElevation = skiArea.get("bottom_elevation").getAsInt();
            this.verticalDrop = skiArea.get("vertical_drop").getAsInt();
        }
    }

    public String toString() {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        return gson.toJson(this);
    }

    public int getID() {
        return id;
    }

    public int getRegion() {
        return region;
    }

    public String getName() {
        return name;
    }

    public String getWebsite() {
        return website;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }

    public int getTopElevation() {
        return topElevation;
    }

    public int getBottomElevation() {
        return bottomElevation;
    }

    public int getVerticalDrop() {
        return verticalDrop;
    }

    public int getOperatingStatusInt() {
        return operatingStatus;
    }

    public String getOperatingStatusString() {
        switch (this.operatingStatus) {
            case 1:
                return "Open Regularly";
            case 2:
                return "Closed";
            case 3:
                return "Future Development";
            default:
                return "Unknown";
        }
    }

    public boolean hasDownhill() {
        return hasDownhill;
    }

    public boolean hasNordic() {
        return hasNordic;
    }
}
