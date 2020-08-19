import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class State extends APIHeader{
    private final String state;
    private String stateName;
    private int region;

    public State(String state) {
        this.requestVersion = 1;
        this.requestType = "state";
        this.state = state;
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
        }
    }

    public String getStateName() {
        return stateName;
    }

    public int getRegion() {
        return region;
    }
}
