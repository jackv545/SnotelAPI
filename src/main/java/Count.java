import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.util.HashMap;
import java.util.Map;

public class Count extends APIHeader {
    private final transient String state;
    private final transient boolean all;
    private Map<String, Integer> count;

    public Count(String state) {
        this.requestVersion = 1;
        this.requestType = "count";
        this.state = state;
        this.all = state.equals("all");
        this.count = new HashMap<>();
    }

    private void setStationCount(Connection conn, State.Table table) throws SQLException {
        String skiAreaQuery = "SELECT COUNT(\"skiAreas\".id) from \"skiAreas\" "
                + "INNER JOIN states ON \"skiAreas\".region = states.id "
                + "AND \"hasDownhill\"=true AND \"operatingStatus\"=1";
        String backcountryQuery = "SELECT COUNT(triplet) from stations";
        String query;

        switch(table) {
            case skiAreas:
                if(!all) {
                    skiAreaQuery = String.format("%s AND state=?", skiAreaQuery);
                }
                query = skiAreaQuery;
                break;
            case backcountry:
                if(!all) {
                    backcountryQuery = String.format("%s WHERE state=?", backcountryQuery);
                }
                query = backcountryQuery;
                break;
            default:
                throw new SQLException(
                    String.format("Invalid table: %s", table.toString())
                );
        }

        try (
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            if(!all) {
                stmt.setString(1, state);
            }

            ResultSet rs = stmt.executeQuery();
            if(rs.next()) {
                count.put(table.toString(), rs.getInt("count"));
            } else {
                String message = all
                    ? "Cannot get count" : String.format("No rows where state='%s'", state);
                throw new SQLException(message);
            }
        }
    }

    @Override
    public void buildResponse() throws Exception {
        try (
            Connection conn = Stations.getConnection();
        ) {
            setStationCount(conn, State.Table.skiAreas);
            setStationCount(conn, State.Table.backcountry);
        }
    }
}
