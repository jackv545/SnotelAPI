import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.net.URISyntaxException;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SkiAreaData extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(SkiAreaData.class);

    private int rowsUpdated;

    public SkiAreaData() {
        this.requestType = "updateResorts";
        this.requestVersion = 1;
        this.rowsUpdated = 0;
    }

    //returns the region codes for the currently available snotel stations
    private List<Integer> regionCodes(Connection conn) throws SQLException {
        List<Integer> codes = new ArrayList<>();
        try (
            Statement st = conn.createStatement();
            ResultSet regions = st.executeQuery(
                "SELECT id FROM states;"
            );

        ) {
            while(regions.next()) {
                codes.add(regions.getInt("id"));
            }
        }
        return codes;
    }

    private int addDBrow(Connection conn, SkiArea skiArea) throws SQLException {
        String sqlInsert = "INSERT INTO \"skiAreas\"" +
            "(id, region, name, website, lat, lng, \"topElevation\", " +
                "\"bottomElevation\", \"verticalDrop\", \"operatingStatus\", " +
                "\"hasDownhill\", \"hasNordic\")\n VALUES " +
                "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (
            PreparedStatement stmt = conn.prepareStatement(sqlInsert);
        ) {
            stmt.setInt(1, skiArea.getID());
            stmt.setInt(2, skiArea.getRegion());
            stmt.setString(3, skiArea.getName());
            stmt.setString(4, skiArea.getWebsite());
            stmt.setDouble(5, skiArea.getLat());
            stmt.setDouble(6, skiArea.getLng());
            stmt.setInt(7, skiArea.getTopElevation());
            stmt.setInt(8, skiArea.getBottomElevation());
            stmt.setInt(9, skiArea.getVerticalDrop());
            stmt.setInt(10, skiArea.getOperatingStatusInt());
            stmt.setBoolean(11, skiArea.hasDownhill());
            stmt.setBoolean(12, skiArea.hasNordic());

            return stmt.executeUpdate();
        }
    }

    @Override
    public void buildResponse() throws IOException, URISyntaxException, SQLException {
        JsonParser parser = new JsonParser();
        /*
        https://skimap.org/SkiAreas/index.json
        Sample response:
        [
            {
                "SkiArea": {
                    "id": "500",
                    "name": "Steamboat Ski Resort",
                    "official_website": "http:\/\/www.steamboat.com",
                    "geo_lat": "40.454623669065",
                    "geo_lng": "-106.76679185612",
                    "top_elevation": "3221",
                    "bottom_elevation": "2103",
                    "vertical_drop": "1118",
                    "operating_status": "1",
                    "has_downhill": true,
                    "has_nordic": false
                },
                "Region": [ ... ]
            }, ...
        ]
        */
        try (
            Reader reader = new FileReader("src/resources/skiAreas.json");
            Connection conn = Stations.getConnection();
        ) {
            JsonElement jsonElement = parser.parse(reader);

            if (jsonElement.isJsonArray()) {
                JsonArray skiAreaIndex = jsonElement.getAsJsonArray();
                log.trace("Number of resorts: {}", skiAreaIndex.size());

                List<Integer> selectedRegions = regionCodes(conn);

                for (JsonElement skiAreaElement : skiAreaIndex) {
                    if (skiAreaElement.isJsonObject()) {
                        JsonObject skiAreaObject = skiAreaElement.getAsJsonObject();

                        SkiArea skiArea = new SkiArea(
                            skiAreaObject.get("SkiArea"),
                            skiAreaObject.get("Region")
                        );

                        if(selectedRegions.contains(skiArea.getRegion())) {
                            rowsUpdated += addDBrow(conn, skiArea);
                        }
                    }
                }
            }
        }
    }
}
