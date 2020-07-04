import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import java.util.LinkedHashMap;

public class States extends APIHeader{
    private final transient Logger log = LoggerFactory.getLogger(States.class);

    private LinkedHashMap<String, StateInfo> states;

    public States() {
        this.requestVersion = 1;
        this.requestType = "states";
    }

    @Override
    public void buildResponse() throws Exception {
        states = new LinkedHashMap<>();
        try (
                Connection conn = Stations.getConnection();

                Statement st1 = conn.createStatement();
                ResultSet stationCount = st1.executeQuery(
                        "SELECT state, statename, COUNT(state) FROM stations GROUP BY state, " +
                                "stateName ORDER BY state;"
                );

                Statement st2 = conn.createStatement();
                ResultSet stateTopSnowpack = st2.executeQuery(
                        "SELECT DISTINCT ON (state) state, name, snowdepth, triplet\n" +
                                "FROM Stations ORDER BY state, snowdepth DESC;"
                );
        ) {
            while(stationCount.next() && stateTopSnowpack.next()) {
                StateInfo stateInfo = new StateInfo(
                        stationCount.getString("statename"),
                        stationCount.getInt("count"),
                        stateTopSnowpack.getString("name"),
                        stateTopSnowpack.getInt("snowdepth"),
                        stateTopSnowpack.getString("triplet")
                );
                states.put(stationCount.getString("state"), stateInfo);
            }
        }

    }
}
