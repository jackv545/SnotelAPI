import java.net.URISyntaxException;
import java.sql.*;

public class State extends APIHeader {
    private transient boolean includeStats, includeStationBounds, includeSkiAreaBounds;
    private final String state;
    private String stateName;
    private int region;
    private Integer backcountryStationCount, skiAreaCount; //gson does not serialize null objects
    private double[][] stationBounds, skiAreaBounds;

    private State(String state) {
        this.requestVersion = 1;
        this.requestType = "state";
        this.state = state;
    }

    public State(
        String state, String includeStats, String includeStationBounds,
        String includeSkiAreaBounds
    ) {
        this(state);
        this.includeStats = Boolean.parseBoolean(includeStats);
        this.includeStationBounds = Boolean.parseBoolean(includeStationBounds);
        this.includeSkiAreaBounds = Boolean.parseBoolean(includeSkiAreaBounds);
    }

    public State(
        String state, boolean includeStats, boolean includeStationBounds,
        boolean includeSkiAreaBounds
    ) {
        this(state);
        this.includeStats = includeStats;
        this.includeStationBounds = includeStationBounds;
        this.includeSkiAreaBounds = includeSkiAreaBounds;
    }

    private void setBackcountryStationCount(Connection conn) throws SQLException {
        String query = "SELECT COUNT(triplet) from stations WHERE state=?";
        try (
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            stmt.setString(1, state);

            ResultSet rs = stmt.executeQuery();
            if(rs.next()) {
                backcountryStationCount = rs.getInt("count");
            } else {
                throw new SQLException(String.format("No rows where state='%s'", state));
            }
        }
    }

    private void setSkiAreaCount(Connection conn) throws SQLException {
        String query =
            "SELECT COUNT(id) from \"skiAreas\" WHERE region=? AND \"hasDownhill\"=true AND " +
                "\"operatingStatus\"=1";
        try (
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            stmt.setInt(1, region);

            ResultSet rs = stmt.executeQuery();
            if(rs.next()) {
                skiAreaCount = rs.getInt("count");
            } else {
                throw new SQLException(String.format("No rows where region='%d'", region));
            }
        }
    }

    private enum Bounds {
        Stations, SkiAreas
    }

    private static double[][] getBounds(
        Bounds boundsType, String state, Connection conn
    ) throws SQLException {
        double[][] bounds = new double[2][2];

        String query = "";

        switch (boundsType) {
            case Stations:
                query = "SELECT MIN(lat) AS \"minLat\", MIN(lng) AS \"minLng\", MAX(lat) " +
                    "AS \"maxLat\", MAX(lng) AS \"maxLng\" FROM stations WHERE state=?";
                break;
            case SkiAreas:
                query = "SELECT MIN(lat) AS \"minLat\", MIN(lng) as \"minLng\", " +
                    "MAX(lat) as \"maxLat\", MAX(lng) as \"maxLng\"  FROM \"skiAreas\" " +
                    "INNER JOIN states ON region = states.id WHERE state=? " +
                    "AND \"hasDownhill\"=true AND \"operatingStatus\"=1";
                break;
        }

        try (
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            stmt.setString(1, state);

            ResultSet rs = stmt.executeQuery();

            if(rs.next()) {
                bounds[0][0] = rs.getDouble("minLat");
                bounds[0][1] = rs.getDouble("minLng");
                bounds[1][0] = rs.getDouble("maxLat");
                bounds[1][1] = rs.getDouble("maxLng");
            } else {
                throw new SQLException(String.format("No rows where state='%s'", state));
            }
        }

        if(bounds[1][0] < 89.9) {
            bounds[1][0] += 0.1;
        }
        return bounds;
    }

    private void setStationBounds(Connection conn) throws SQLException {
        stationBounds = getBounds(Bounds.Stations, state, conn);
    }

    private void setSkiAreaBounds(Connection conn) throws SQLException {
        skiAreaBounds = getBounds(Bounds.SkiAreas, state, conn);

    }

    @Override
    public void buildResponse() throws URISyntaxException, SQLException {
        String query = "SELECT * FROM states WHERE state=?";
        try (
            Connection conn = Stations.getConnection();
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            stmt.setString(1, state);

            ResultSet rs = stmt.executeQuery();
            if(rs.next()) {
                stateName = rs.getString("stateName");
                region = rs.getInt("id");
            } else {
                throw new SQLException(String.format("No rows where state='%s'", state));
            }

            if(includeStats) {
                setBackcountryStationCount(conn);
                setSkiAreaCount(conn);
            }

            if(includeStationBounds) {
                setStationBounds(conn);
            }

            if(includeSkiAreaBounds) {
                setSkiAreaBounds(conn);
            }
        }
    }

    public String getStateName() {
        return stateName;
    }

    public int getRegion() {
        return region;
    }

    public double[][] getStationBounds() {
        return stationBounds;
    }
}
