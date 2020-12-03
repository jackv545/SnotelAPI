import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URISyntaxException;
import java.sql.*;

import java.util.*;

public class States extends APIHeader{
    private final transient Logger log = LoggerFactory.getLogger(States.class);

    private class StateInfo {
        private String stateName;
        private int count; //number of stations in state
        private String name; //top snowpack in state station name
        private int snowDepth;
        private String triplet;
        private String urlName;

        public StateInfo(String stateName, String name, int snowDepth, String triplet, String urlName) {
            this.stateName = stateName;
            this.count = 0;
            this.name = name;
            this.snowDepth = snowDepth;
            this.triplet = triplet;
            this.urlName = urlName;
        }

        public void setCount(int stationCount, Integer skiAreaCount) {
            if(skiAreaCount == null) {
                count = stationCount;
            } else {
                count = stationCount + skiAreaCount;
            }
        }
    }

    private LinkedHashMap<String, StateInfo> states;
    private transient Queue<Integer> stationCount;
    private transient Map<String, Integer> skiAreaCount;

    public States() {
        this.requestVersion = 1;
        this.requestType = "states";
    }

    static List<String> getAllStates() throws URISyntaxException, SQLException {
        ArrayList<String> states = new ArrayList<>();
        String query = "SELECT state FROM states";

        try (
            Connection conn = WebApplication.getDBConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);
        ) {
            while(rs.next()) {
                states.add(rs.getString("state"));
            }
        }
        return states;
    }

    private void setStationCount(Connection conn) throws SQLException {
        stationCount = new LinkedList<>();
        String query = "SELECT COUNT(triplet), state FROM stations GROUP BY state ORDER BY state";

        try(
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);
        ) {
            while(rs.next()) {
                stationCount.add(rs.getInt("count"));
            }
        }
    }

    private void setSkiAreaCount(Connection conn) throws SQLException {
        skiAreaCount = new HashMap<>();
        String query = "SELECT COUNT(\"skiAreas\".id), state FROM \"skiAreas\" " +
            "INNER JOIN states ON \"skiAreas\".region = states.id " +
            "WHERE \"operatingStatus\"=1 AND \"hasDownhill\"=true AND \"openToPublic\"=true " +
            "GROUP BY state";

        try(
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);
        ) {
            while (rs.next()) {
                skiAreaCount.put(rs.getString("state"), rs.getInt("count"));
            }
        }
    }

    @Override
    public void buildResponse() throws Exception {
        states = new LinkedHashMap<>();
        String query = "SELECT DISTINCT ON (state) state, \"stateName\", name, \"snowDepth\", " +
            "triplet, \"urlName\" FROM stations INNER JOIN states USING(state) " +
            "ORDER BY state, \"snowDepth\" DESC";
        try (
            Connection conn = WebApplication.getDBConnection();

            Statement stmt = conn.createStatement();
            ResultSet stateTopSnowpack = stmt.executeQuery(query);
        ) {
            setStationCount(conn);
            setSkiAreaCount(conn);

            while(stateTopSnowpack.next()) {
                String state = stateTopSnowpack.getString("state");

                StateInfo stateInfo = new StateInfo(
                    stateTopSnowpack.getString("stateName"),
                    stateTopSnowpack.getString("name"),
                    stateTopSnowpack.getInt("snowdepth"),
                    stateTopSnowpack.getString("triplet"),
                    stateTopSnowpack.getString("urlName")
                );
                stateInfo.setCount(stationCount.remove(), skiAreaCount.get(state));
                states.put(state, stateInfo);
            }
        }
    }
}
