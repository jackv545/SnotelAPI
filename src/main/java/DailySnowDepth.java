import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.sql.*;

import static java.lang.Integer.parseInt;

public class DailySnowDepth extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(DailySnowDepth.class);

    private String state;
    private int rowsUpdated;

    public DailySnowDepth() {
        this.requestVersion = 1;
        this.requestType = "dailySnowDepth";
    }

    private URL stateDailyReportURL() {
        try {
            return new URL("https://wcc.sc.egov.usda.gov/reportGenerator/view_csv" +
                    "/customMultipleStationReport/daily/state=%22" + state + "%22%20AND%20network" +
                    "=%22SNTLT%22,%22SNTL%22%20AND%20element=%22SNWD%22%20AND%20outServiceDate=" +
                    "%222100-01-01%22%7Cname/0,0/name,stationId,WTEQ::value,WTEQ::delta," +
                    "SNWD::value,SNWD::delta"
            );
        } catch (MalformedURLException e) {
            log.error("Malformed url: {}", e);
            return null;
        }
    }

    private int rowCount(Connection conn) throws SQLException {
        String sqlCount = String.format("SELECT COUNT(state) FROM stations WHERE state='%s'", state);

        try (
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(sqlCount);
        ) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private void checkQueryStatus(int status, String triplet) {
        if(status != 1) {
            log.info("SQL Status: {}, row does not exist: {}", status, triplet);
        }
    }

    private void updateDatabase(InputStreamReader isr) throws SQLException, IOException, URISyntaxException {
        String inputLine;
        int nonCommentLine = 0;
        String sqlUpdate = "UPDATE stations SET snowdepth=? WHERE triplet=?";
        rowsUpdated = 0;

        try (
            BufferedReader in = new BufferedReader(isr);
            Connection conn = Stations.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sqlUpdate);
        ) {
            while ((inputLine = in.readLine()) != null) {
                if (inputLine.charAt(0) != '#') {
                    if (nonCommentLine != 0) {
                        String[] result = inputLine.split(",", -1);
                        int snowDepth = result[4].isEmpty() ? 0 : parseInt(result[4]);
                        String triplet = String.format("%d:%s:SNTL", parseInt(result[1]), state);

                        stmt.setInt(1, snowDepth);
                        stmt.setString(2, triplet);

                        int status = stmt.executeUpdate();
                        checkQueryStatus(status, triplet);
                        rowsUpdated += status;
                        log.info("{} snowDepth: {} {}/{}", triplet, snowDepth, rowsUpdated,
                                rowCount(conn)
                        );
                    }
                    nonCommentLine++;
                }
            }
        }
    }

    @Override
    public void buildResponse() throws SQLException, URISyntaxException {
        URL url = stateDailyReportURL();

        try {
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            int status = con.getResponseCode();

            if (status > 199 && status < 300) {
                updateDatabase(new InputStreamReader(con.getInputStream()));
            } else {
                log.error("{}\nResponse code: {}", url, status);
            }
        } catch (IOException e) {
            log.error("IOException: {}", e);
        }
    }
}
