import org.junit.Test;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.junit.Assert.*;

public class TestUpdateSnowDepth {
    @Test
    public void testDailyReportUrl() {
        UpdateSnowDepth snowDepthRequest = new UpdateSnowDepth("CO", "daily");
        URL reportUrl = snowDepthRequest.reportUrl();
        String expectedUrl = "https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customMultipleStationReport/daily/start_of_period/state=%22CO%22%20AND%20network=%22SNTLT%22,%22SNTL%22%20AND%20element=%22SNWD%22%20AND%20outServiceDate=%222100-01-01%22%7Cname/0,0/name,stationId,SNWD::value,WTEQ::value?fitToScreen=false";

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

    @Test
    public void testUnreasonableSnowDepthValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(60, 28, 12.0, 12.0);
        assertFalse("Snow depth and swe unreasonable", valid);
    }

    @Test
    public void testNewSnowValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(32, 26, 6, 5.5);
        assertTrue("New snow", valid);
    }

    @Test
    public void testMeltingSnowValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(22, 26, 4.8, 5.5);
        assertTrue("Melting snow", valid);
    }

    @Test
    public void testFirstSnowValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(4, 0, 0.6, 0);
        assertTrue("First snow", valid);
    }

    @Test
    public void snowCompletelyMeltedValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(0, 4, 0.1, 0.6);
        assertTrue("New snow", valid);
    }

    @Test
    public void testNoChangeValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(4, 4, 0.3, 0.2);
        assertTrue("No change", valid);
    }

    @Test
    public void noSweValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(70, 4, 0, 0);
        assertFalse("No swe", valid);
    }

    @Test
    public void sanityCheckValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(110, 110, 0.2, 0.2);
        assertFalse("Sanity check", valid);
    }

    @Test
    public void correctedSnowValid() {
        boolean valid = UpdateSnowDepth.newSnowDataValid(15, 170, 3.5, 3.6);
        assertTrue("Corrected snow", valid);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testIllegalArgument() {
        UpdateSnowDepth snowDepthRequest = new UpdateSnowDepth("CO", "weekly");
    }
}
