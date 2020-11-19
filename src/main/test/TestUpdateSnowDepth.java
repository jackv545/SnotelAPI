import org.junit.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.junit.Assert.assertEquals;

public class TestUpdateSnowDepth {
    @Test
    public void testDailyReportUrl() {
        UpdateSnowDepth snowDepthRequest = new UpdateSnowDepth("CO", "daily");
        URL reportUrl = snowDepthRequest.reportUrl();
        String expectedUrl = "https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customMultipleStationReport/daily/start_of_period/state=%22CO%22%20AND%20network=%22SNTLT%22,%22SNTL%22%20AND%20element=%22SNWD%22%20AND%20outServiceDate=%222100-01-01%22%7Cname/0,0/name,stationId,SNWD::value?fitToScreen=false";

        assertEquals("Daily report url", expectedUrl, reportUrl.toString());
    }

    @Test
    public void testUpdatedTime() {
        UpdateSnowDepth snowDepthRequest = new UpdateSnowDepth("CO", "hourly");
        String testTimeString = "2020-11-16 18:00";
        LocalDateTime testLDT = LocalDateTime.parse(testTimeString, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        LocalDateTime updatedTime = snowDepthRequest.updatedTime("2020-11-16 18:00");

        assertEquals("DB updated time", testLDT.plusHours(8), updatedTime);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testIllegalArgument() {
        UpdateSnowDepth snowDepthRequest = new UpdateSnowDepth("CO", "weekly");
    }
}
