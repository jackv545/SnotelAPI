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
    private String searchField, searchTerm, orderBy;

    public Stations() {
        this.limit = 822;
        this.searchField = "name";
        this.searchTerm = "";
        this.orderBy = "";
    }

    public Stations(String searchField, String searchTerm, String orderBy) {
        this.limit = 822;
        this.searchField = searchField;
        this.searchTerm = searchTerm;
        this.orderBy = orderBy;
    }

    public Stations(int limit) {
        this.limit = limit;
        this.searchField = "name";
        this.searchTerm = "";
        this.orderBy = "snowDepth";
    }

    public static Connection getConnection() throws URISyntaxException, SQLException {
        URI dbUri = new URI(System.getenv("DATABASE_URL"));
        String username = dbUri.getUserInfo().split(":")[0];
        String password = dbUri.getUserInfo().split(":")[1];
        String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath() + "?sslmode=require";

        return DriverManager.getConnection(dbUrl, username, password);
    }

    private String queryString() throws SQLException {
        String query = "SELECT * FROM stations";
        switch (searchField) {
            case "name":
                String column = "name";
                String like = " ILIKE '" + searchTerm + "%'";
                query += " WHERE " + column + like;
                break;
            case "urlName":
                column = "\"urlName\"";
                like = " ILIKE '" + searchTerm + "%'";
                query += " WHERE " + column + like;
                break;
            case "state":
                column="state";
                like = "='" + searchTerm + "'";
                query += " WHERE " + column + like;
                break;
            case "":
            case "none":
                break;
            default:
                throw new SQLException("Cannot search by: " + searchField);
        }
        switch (orderBy) {
            case "alphabetical":
                query += " ORDER BY name";
                break;
            case "elevation":
                query += " ORDER BY elevation DESC";
                break;
            case "snowDepth":
                query += " ORDER BY snowdepth DESC";
                break;
            case "":
            case "none":
                break;
            default:
                throw new SQLException("Cannot order by: " + orderBy);
        }
        query += " LIMIT " + limit;
        log.info("SQL Query: {}", query);
        return query;
    }

    @Override
    public void buildResponse() throws SQLException, URISyntaxException {
        stations = new ArrayList<>();
        try (
                Connection conn = getConnection();
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(queryString());
        ) {
            while(rs.next()) {
                Station station = new Station(
                    rs.getInt("elevation"),
                    rs.getDouble("lat"), rs.getDouble("lng"),
                    rs.getInt("timezone"), rs.getString("triplet"),
                    rs.getBoolean("wind"), rs.getInt("snowdepth"),
                    rs.getString("state"), rs.getString("name"),
                    rs.getString("statename"), rs.getString("urlName")
                );
                stations.add(station);
            }
        }
    }

    public List<Station> getStations() {
        return stations;
    }
}
