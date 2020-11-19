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
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import static java.lang.Integer.parseInt;

public class UpdateSnowDepth extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(UpdateSnowDepth.class);

    private String state, interval;
    private int rowsUpdated;

    public UpdateSnowDepth(String state, String interval) {
        this.requestVersion = 1;
        this.requestType = "updateSnowDepth";
        this.state = state;
        if (interval.equals("hourly") || interval.equals("daily")) {
            this.interval = interval;
        } else {
            throw new IllegalArgumentException("invalid interval");
        }
        this.rowsUpdated = 0;
    }

    private final transient ZoneId SNOTEL_ZONE = ZoneId.of("GMT-8"); //snotel report time zone
    private final transient ZoneId DB_ZONE = ZoneId.of("UTC");

    private int reportHour() {
        int hour = LocalDateTime.now(SNOTEL_ZONE).minusHours(1).getHour();
        log.info("Getting {} hourly snow data from {}:00 {}", state, hour, SNOTEL_ZONE.toString());
        return hour;
    }

    LocalDateTime updatedTime (String timeStamp) { //parse snotel report time string into UTC timestamp for db
        LocalDateTime snotelTime = LocalDateTime.parse(timeStamp, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        LocalDateTime dbTime = snotelTime.atZone(SNOTEL_ZONE).withZoneSameInstant(DB_ZONE).toLocalDateTime();

        log.debug(dbTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return dbTime;
    }

    URL reportUrl() {
        StringBuilder url = new StringBuilder("https://wcc.sc.egov.usda.gov/reportGenerator/view_csv");

        if (interval.equals("hourly")) {
            url.append("/customMultipleStationReport/hourly/start_of_period/state=%22" + state + "%22%20AND%20");
            url.append("network=%22SNTLT%22,%22SNTL%22%20AND%20element=%22SNWD%22%20AND%20outServiceDate=%22");
            url.append("2100-01-01%22%7Cname/-23,0:H%7C" + reportHour() + "/stationId,SNWD::value?fitToScreen=false");
        } else {
            url.append("/customMultipleStationReport/daily/start_of_period/state=%22" + state + "%22%20AND%20network=");
            url.append("%22SNTLT%22,%22SNTL%22%20AND%20element=%22SNWD%22%20AND%20outServiceDate=%222100-01-01%22");
            url.append("%7Cname/0,0/name,stationId,SNWD::value?fitToScreen=false");

            String reportDate = LocalDateTime.now(SNOTEL_ZONE).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            log.info("Getting {} start of day snow report for {}", state, reportDate);
        }

        log.debug("Report url: {}", url.toString());
        try {
            return new URL(url.toString());
        } catch (MalformedURLException e) {
            log.error("Malformed url: {}", url.toString());
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
        if (status != 1) {
            log.error("SQL Status: {}, row does not exist: {}", status, triplet);
        }
    }

    private void updateDatabase(InputStreamReader isr) throws SQLException, IOException, URISyntaxException {
        String query = "UPDATE stations SET \"snowDepth\"=?, \"lastUpdated\"=? WHERE triplet=?";

        try (
            BufferedReader in = new BufferedReader(isr);
            Connection conn = WebApplication.getDBConnection();
            PreparedStatement stmt = conn.prepareStatement(query);
        ) {
            String inputLine;
            int nonCommentLine = 0;
            int rowCount = rowCount(conn);

            while ((inputLine = in.readLine()) != null) {
                if (inputLine.charAt(0) != '#') {
                    if (nonCommentLine != 0) {
                        String[] result = inputLine.split(",", -1);
                        int snowDepth = 0;
                        if (result[2].isEmpty()) {
                            continue;
                        } else {
                            snowDepth = parseInt(result[2]);
                        }
                        String triplet = String.format("%d:%s:SNTL", parseInt(result[1]), state);

                        stmt.setInt(1, snowDepth);
                        if(interval.equals("hourly")) {
                            stmt.setTimestamp(2, Timestamp.valueOf(updatedTime(result[0])));
                        } else {
                            stmt.setTimestamp(2,
                                Timestamp.valueOf(LocalDateTime.now(DB_ZONE).withSecond(0).withNano(0)));
                        }
                        stmt.setString(3, triplet);
                        log.debug(stmt.toString());

                        int status = stmt.executeUpdate();
                        checkQueryStatus(status, triplet);
                        rowsUpdated += status;
                        log.debug("{} snowDepth: {} {}/{}", triplet, snowDepth, rowsUpdated, rowCount);
                    }
                    nonCommentLine++;
                }
            }
        }
    }

    @Override
    public void buildResponse() throws SQLException, URISyntaxException, IOException {
        URL url = reportUrl();

        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");
        int status = con.getResponseCode();

        if (status > 199 && status < 300) {
            updateDatabase(new InputStreamReader(con.getInputStream()));
        } else {
            log.error("Snotel response: {}", con.getResponseMessage());
            throw new IOException(String.format("Snotel response code: %d", status));
        }
    }
}
