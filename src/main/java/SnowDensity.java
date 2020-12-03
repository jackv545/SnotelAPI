import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URISyntaxException;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SnowDensity extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(SnowDensity.class);

    private Map<String, Double> snowDensity;

    public SnowDensity() {
        this.requestVersion = 1;
        this.requestType = "averageSnowDensity";
        this.snowDensity = new HashMap<>();
    }

    static double calculateDensity(int snowDepth, double swe) {
        if (snowDepth <= 0 || swe <= 0) {
            return -1.0;
        } else {
            return swe / snowDepth;
        }
    }

    private void updateDB(Connection conn) throws SQLException {
        String query = "UPDATE states set \"avgSnowDensity\"=? WHERE state=?";

        try (
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            for(Map.Entry<String, Double> entry : snowDensity.entrySet()) {
                stmt.setDouble(1, entry.getValue());
                stmt.setString(2, entry.getKey());
                stmt.executeUpdate();
            }
        }
    }

    @Override
    public void buildResponse() throws URISyntaxException, SQLException {
        List<String> states = States.getAllStates();
        String query = "SELECT \"snowDepth\", swe FROM stations WHERE state=?";

        try (
            Connection conn = WebApplication.getDBConnection();
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            for (String state : states) {
                List<Double> stateSnowDensity = new ArrayList<>();

                stmt.setString(1, state);
                ResultSet rs = stmt.executeQuery();
                int size = 0;
                while (rs.next()) {
                    int snowDepth = rs.getInt("snowDepth");
                    double swe = rs.getDouble("swe");
                    double stationSnowDensity = calculateDensity(snowDepth, swe);
                    if (rs.wasNull() || stationSnowDensity < 0) {
                        continue;
                    } else {
                        size++;
                    }
                    stateSnowDensity.add(stationSnowDensity);
                }
                rs.close();

                if (log.isDebugEnabled()) {
                    String list = stateSnowDensity.stream().map(Object::toString).collect(Collectors.joining(", "));
                    log.debug("{} average snow density: {}", state, list);
                }

                double sum = 0, averageDensity;
                for (double density : stateSnowDensity) {
                    sum += density;
                }
                averageDensity = sum / size;
                snowDensity.put(state, averageDensity);
                updateDB(conn);
            }
        }
    }

    Map<String, Double> getSnowDensity() {
        log.info(snowDensity.toString());
        return snowDensity;
    }
}
