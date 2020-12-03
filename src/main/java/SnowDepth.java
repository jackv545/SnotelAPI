import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URISyntaxException;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SnowDepth extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(SnowDensity.class);

    private Map<String, Double> snowDepth;

    public SnowDepth() {
        this.requestVersion = 1;
        this.requestType = "averageSnowDepth";
        this.snowDepth = new HashMap<>();
    }

    private void updateDB(Connection conn) throws SQLException {
        String query = "UPDATE states set \"avgSnowDepth\"=? WHERE state=?";

        try (
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            for(Map.Entry<String, Double> entry : snowDepth.entrySet()) {
                stmt.setDouble(1, entry.getValue());
                stmt.setString(2, entry.getKey());
                stmt.executeUpdate();
            }
        }
    }

    @Override
    public void buildResponse() throws URISyntaxException, SQLException {
        List<String> states = States.getAllStates();
        String query = "SELECT \"snowDepth\" FROM stations WHERE state=?";

        try (
            Connection conn = WebApplication.getDBConnection();
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            for (String state : states) {
                List<Integer> stateSnowDepth = new ArrayList<>();

                stmt.setString(1, state);
                ResultSet rs = stmt.executeQuery();
                int size = 0;
                while (rs.next()) {
                    int currentSnowDepth = rs.getInt("snowDepth");
                    if (rs.wasNull() || currentSnowDepth == 0) {
                        continue;
                    } else {
                        size++;
                    }
                    stateSnowDepth.add(currentSnowDepth);
                }
                rs.close();

                int sum = 0;
                double averageSnowDepth;
                for (int snow : stateSnowDepth) {
                    sum += snow;
                }
                averageSnowDepth = (double) sum / size;
                snowDepth.put(state, averageSnowDepth);
                updateDB(conn);
            }
        }
    }

    Map<String, Double> getSnowDensity() {
        log.info(snowDepth.toString());
        return snowDepth;
    }
}
