import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;

public class StateBounds extends APIHeader{
    private final transient Logger log = LoggerFactory.getLogger(States.class);

    private String state;
    private double[][] stateBounds;

    private static final String[] STATES = {
            "AK", "AZ", "CA", "CO", "ID", "MT", "NM", "NV", "OR", "SD", "UT", "WA", "WY"
    };

    public StateBounds() {
        this.requestVersion = 1;
        this.requestType = "stateBounds";
    }

    public StateBounds(String state) {
        this();
        this.state = state;
    }

    @Override
    public void buildResponse() throws SQLException, URISyntaxException {
        boolean validState = Arrays.stream(STATES).anyMatch(state::equals);

        if(validState) {
            stateBounds = new double[2][2];
            try (
                    Connection conn = Stations.getConnection();

                    Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(
                            "SELECT MIN(lat) AS \"minLat\", MIN(lng) AS \"minLng\", " +
                                    "MAX(lat) AS \"maxLat\", MAX(lng) AS \"maxLng\" " +
                                    "FROM stations WHERE state='" + state + "';"
                    );
            ) {
                if(rs.next()) {
                    stateBounds[0][0] = rs.getDouble("minLat");
                    stateBounds[0][1] = rs.getDouble("minLng");
                    stateBounds[1][0] = rs.getDouble("maxLat");
                    stateBounds[1][1] = rs.getDouble("maxLng");
                }
            }

            //add more space to view marker
            if(stateBounds[1][0] < 89.9) {
                stateBounds[1][0] += 0.1;
            }
        } else {
            throw new SQLException();
        }
    }

    public double[][] getStateBounds() {
        return stateBounds;
    }
}
