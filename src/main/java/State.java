import java.net.URISyntaxException;
import java.sql.*;

public class State extends APIHeader {
    private String state, stateName;
    private int region;

    public enum Table {backcountry, skiAreas}

    private transient Table table;
    private transient boolean includeBounds;
    private double[][] bounds;

    public State(String state) {
        this.requestVersion = 1;
        this.requestType = "state";
        this.state = state;
        this.includeBounds = false;
    }

    public State(String state, Table table) {
        this(state);
        this.includeBounds = true;
        this.table = table;
    }

    private void setBounds(Connection conn) throws SQLException {
        bounds = new double[2][2];

        String query = "";

        switch (table) {
            case backcountry:
                query = "SELECT MIN(lat) AS \"minLat\", MIN(lng) AS \"minLng\", MAX(lat) " +
                    "AS \"maxLat\", MAX(lng) AS \"maxLng\" FROM stations WHERE state=?";
                break;
            case skiAreas:
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
    }

    @Override
    public void buildResponse() throws URISyntaxException, SQLException {
        String query = "SELECT * FROM states WHERE state=?";
        try (
                Connection conn = WebApplication.getDBConnection();
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

            if(includeBounds) {
                setBounds(conn);
            }
        }
    }

    public String getState() {
        return state;
    }

    public String getStateName() {
        return stateName;
    }

    public int getRegion() {
        return region;
    }

    public double[][] getBounds() {
        return bounds;
    }
}
