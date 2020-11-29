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
import java.util.Arrays;

import static java.lang.Integer.parseInt;

public class UpdateSnowDepth extends APIHeader {
    private static final Logger log = LoggerFactory.getLogger(UpdateSnowDepth.class);

    private String state, interval;
    private int rowsUpdated, rowCount;

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

    LocalDateTime updatedTime(String timeStamp) { //parse snotel report time string into UTC timestamp for db
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
            url.append("2100-01-01%22%7Cname/-23,0:H%7C" + reportHour() + "/stationId,SNWD::value,WTEQ::value");
            url.append("?fitToScreen=false");
        } else {
            url.append("/customMultipleStationReport/daily/start_of_period/state=%22" + state + "%22%20AND%20network=");
            url.append("%22SNTLT%22,%22SNTL%22%20AND%20element=%22SNWD%22%20AND%20outServiceDate=%222100-01-01%22");
            url.append("%7Cname/0,0/name,stationId,SNWD::value,WTEQ::value?fitToScreen=false");

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

    static String[] splitReportLine(String inputLine) {
        String[] result = inputLine.split(",", -1);
        if (result.length < 4 || result.length > 4) {
            log.warn("Unexpected split result: {}", Arrays.toString(result));
        }
        return result;
    }

    static boolean newSnowDataValid(int snowDepth, int lastSnowDepth, double swe, double lastSwe) {
        if (snowDepth < 0) {
            return false;
        }

        if (snowDepth - lastSnowDepth > 12 && !(lastSnowDepth == 0 || lastSwe == 0)) {
            double snowIncreaseRatio = (double) snowDepth / lastSnowDepth;
            double sweIncreaseRatio = swe / lastSwe;
            return snowIncreaseRatio - sweIncreaseRatio < 1.13;
        } else {
            boolean reasonableSnowIncrease = snowDepth - lastSnowDepth < 48;
            if (swe == 0) {
                return reasonableSnowIncrease;
            } else {
                double snowDensity = (double) snowDepth / swe;
                return reasonableSnowIncrease && snowDensity < 25;
            }
        }
    }

    private void updateDatabase(InputStreamReader isr) throws SQLException, IOException, URISyntaxException {
        String updateQuery = "UPDATE stations SET \"snowDepth\"=?, \"lastUpdated\"=?, swe=? WHERE triplet=?";
        String selectQuery = "SELECT \"snowDepth\", swe FROM stations WHERE triplet=?";

        try (
            BufferedReader in = new BufferedReader(isr);
            Connection conn = WebApplication.getDBConnection();
            PreparedStatement updateStmt = conn.prepareStatement(updateQuery);
            PreparedStatement selectStmt = conn.prepareStatement(selectQuery);
        ) {
            String inputLine;
            int nonCommentLine = 0;
            rowCount = rowCount(conn);

            while ((inputLine = in.readLine()) != null) {
                if (inputLine.charAt(0) != '#') {
                    if (nonCommentLine != 0) {
                        String[] result = splitReportLine(inputLine);
                        if (result[1].isEmpty()) {
                            log.error("No station ID: {}", inputLine);
                            continue;
                        }
                        if (result[2].isEmpty()) { //no snowDepth
                            continue;
                        }
                        String triplet = String.format("%d:%s:SNTL", parseInt(result[1]), state);
                        selectStmt.setString(1, triplet);

                        int snowDepth, lastSnowDepth;
                        double swe, lastSwe;

                        ResultSet rs = selectStmt.executeQuery();
                        if (rs.next()) {
                            lastSnowDepth = rs.getInt("snowDepth");
                            lastSwe = rs.getDouble("swe");
                            log.debug("Last snow data for {} snowDepth: {} swe: {}", triplet, lastSnowDepth, lastSwe);
                        } else {
                            log.warn("{} not found in db", triplet);
                            continue;
                        }

                        snowDepth = parseInt(result[2]);
                        swe = result[3].isEmpty() ? 0 : Double.parseDouble(result[3]);

                        if (!newSnowDataValid(snowDepth, lastSnowDepth, swe, lastSwe)) {
                            log.error("Invalid snow data for {}", triplet);
                            log.error("\tsnowDepth: {}, lastSnowDepth: {}, swe: {}, lastSwe: {}", snowDepth,
                                lastSnowDepth, swe, lastSwe);
                            continue;
                        }

                        updateStmt.setInt(1, snowDepth);
                        updateStmt.setDouble(3, swe);
                        if (interval.equals("hourly")) {
                            updateStmt.setTimestamp(2, Timestamp.valueOf(updatedTime(result[0])));
                        } else {
                            updateStmt.setTimestamp(2,
                                Timestamp.valueOf(LocalDateTime.now(DB_ZONE).withSecond(0).withNano(0)));
                        }
                        updateStmt.setString(4, triplet);
                        log.debug(updateStmt.toString());

                        int status = updateStmt.executeUpdate();
                        rowsUpdated += status;
                        log.debug("{} snowDepth: {} swe: {} {}/{}", triplet, snowDepth, swe, rowsUpdated, rowCount);
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
