import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import java.net.URISyntaxException;
import java.sql.*;

public class Stations extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(Stations.class);

    private List<Mappable> stations;
    private int limit;
    private String searchField, searchTerm, orderBy;

    private transient boolean mappable;

    public Stations(String searchField, String searchTerm, String orderBy, Boolean mappable) {
        this.limit = 0;
        this.searchField = searchField;
        this.searchTerm = searchTerm;
        this.orderBy = orderBy;
        this.mappable = mappable;
    }

    public Stations(int limit, String searchField, String searchTerm, String orderBy, Boolean mappable) {
        this.limit = limit;
        this.searchField = searchField;
        this.searchTerm = searchTerm;
        this.orderBy = orderBy;
        this.mappable = mappable;
    }

    private String query() throws SQLException {
        String[] columns = new String[]{"elevation", "lat", "lng", "timezone", "triplet", "wind", "\"snowDepth\"",
            "s.state", "name", "st.\"stateName\"", "\"urlName\", \"lastUpdated\""};
        String query = String.format("SELECT %s ", String.join(", ", columns));
        query = String.format(
            "%sFROM stations s INNER JOIN states st ON s.state = st.state", query
        );
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
                column = "s.state";
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
                query += " ORDER BY \"snowDepth\" DESC";
                break;
            case "":
            case "none":
                break;
            default:
                throw new SQLException("Cannot order by: " + orderBy);
        }
        query += limit > 0 ? " LIMIT " + limit : "";
        log.debug("Query: {}", query);
        return query;
    }

    @Override
    public void buildResponse() throws SQLException, URISyntaxException {
        stations = new ArrayList<>();
        try (
            Connection conn = WebApplication.getDBConnection();
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(query());
        ) {
            if (mappable) {
                while (rs.next()) {
                    stations.add(new Mappable(
                        rs.getString("name"),
                        rs.getString("urlName"),
                        rs.getDouble("lat"),
                        rs.getDouble("lng")
                    ));
                }
            } else {
                while (rs.next()) {
                    Timestamp lastUpdated = rs.getTimestamp("lastUpdated");
                    if(rs.wasNull()) {
                        stations.add(new Station(
                            rs.getInt("elevation"), rs.getDouble("lat"),
                            rs.getDouble("lng"), rs.getInt("timezone"),
                            rs.getString("triplet"), rs.getBoolean("wind"),
                            rs.getInt("snowDepth"), rs.getString("state"),
                            rs.getString("name"), rs.getString("stateName"),
                            rs.getString("urlName")
                        ));
                    } else {
                        stations.add(new Station(
                            rs.getInt("elevation"), rs.getDouble("lat"),
                            rs.getDouble("lng"), rs.getInt("timezone"),
                            rs.getString("triplet"), rs.getBoolean("wind"),
                            rs.getInt("snowDepth"), rs.getString("state"),
                            rs.getString("name"), rs.getString("stateName"),
                            rs.getString("urlName"), lastUpdated.toLocalDateTime()
                        ));
                    }
                }
            }
        }
    }

    public List<Mappable> getStations() {
        return stations;
    }
}
