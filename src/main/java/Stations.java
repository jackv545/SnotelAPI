import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.*;

public class Stations extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(Stations.class);

    private List<Map<String, String>> stations;
    private int limit;

    public Stations() {
        this.requestType = "stations";
        this.requestVersion = 1;
        this.limit = 10;
    }

    private static Connection getConnection() throws URISyntaxException, SQLException {
        URI dbUri = new URI(System.getenv("DATABASE_URL"));
        String username = dbUri.getUserInfo().split(":")[0];
        String password = dbUri.getUserInfo().split(":")[1];
        String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath() + "?sslmode=require";

        return DriverManager.getConnection(dbUrl, username, password);
    }

    @Override
    public void buildResponse() {
        stations = new ArrayList<>();
        try (
                Connection conn = getConnection();
                Statement stQuery = conn.createStatement();
                ResultSet rsQuery = stQuery.executeQuery("SELECT * FROM stations LIMIT 10");
        ) {
            while(rsQuery.next()) {
                Map<String, String> station = new HashMap<>();

                station.put("elevation", rsQuery.getString(1));
                station.put("lat", rsQuery.getString(2));
                station.put("lng", rsQuery.getString(3));
                station.put("name", rsQuery.getString(4));
                station.put("timezone", rsQuery.getString(5));
                station.put("triplet", rsQuery.getString(6));
                station.put("wind", rsQuery.getString(7));

                stations.add(station);
            }
        } catch (Exception e) {
            log.error("Exception: {}", e);
        }
    }
}
