import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class State extends APIHeader{
    private final String state;
    private String stateName;
    private int region, backcountryStationCount, skiAreaCount;

    public State(String state) {
        this.requestVersion = 1;
        this.requestType = "state";
        this.state = state;
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

            setBackcountryStationCount(conn);
            setSkiAreaCount(conn);
        }
    }

    public String getStateName() {
        return stateName;
    }

    public int getRegion() {
        return region;
    }
}
