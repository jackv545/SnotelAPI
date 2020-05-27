import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.*;

public class Stations extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(Stations.class);

    private List<Station> stations;
    private int limit;
    private String searchField, searchTerm;
    private boolean orderBySnowdepth;

    public Stations() {
        this.limit = 822;
        this.searchField = "name";
        this.searchTerm = "";
        this.orderBySnowdepth = false;
    }

    public Stations(String searchField, String searchTerm) {
        this.limit = 822;
        this.searchField = searchField;
        this.searchTerm = searchTerm;
        this.orderBySnowdepth = false;
    }

    public Stations(int limit) {
        this.limit = limit;
        this.searchField = "name";
        this.searchTerm = "";
        this.orderBySnowdepth = true;
    }

    public static Connection getConnection() throws URISyntaxException, SQLException {
        URI dbUri = new URI(System.getenv("DATABASE_URL"));
        String username = dbUri.getUserInfo().split(":")[0];
        String password = dbUri.getUserInfo().split(":")[1];
        String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath() + "?sslmode=require";

        return DriverManager.getConnection(dbUrl, username, password);
    }

    private String queryString() {
        String select = "SELECT * FROM stations WHERE ";
        String like, column;
        switch (searchField) {
            case "name":
                like = " ILIKE '" + searchTerm + "%'";
                column = "name";
                break;
            case "state":
                like = "='" + searchTerm + "'";
                column="state";
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + searchField);
        }
        String query = select + column + like;
        if(orderBySnowdepth) {
            query = query + " ORDER BY snowdepth DESC";
        }
        query = query + " LIMIT " + limit;
        log.info("SQL Query: {}", query);
        return query;
    }

    @Override
    public void buildResponse() {
        stations = new ArrayList<>();
        try (
                Connection conn = getConnection();
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(queryString());
        ) {
            while(rs.next()) {
                Station station = new Station(rs.getInt("elevation"),
                        rs.getDouble("lat"), rs.getDouble("lng"),
                        rs.getInt("timezone"), rs.getString("triplet"),
                        rs.getBoolean("wind"), rs.getInt("snowdepth"),
                        rs.getString("state"), rs.getString("name")
                );
                stations.add(station);
            }
        } catch (Exception e) {
            log.error("Exception: {}", e);
        }
    }

    public List<Station> getStations() {
        return stations;
    }
}
