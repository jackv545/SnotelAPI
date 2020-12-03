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
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(70, 28, 6.0);
        assertFalse("Snow depth and swe unreasonable", valid);
    }

    @Test
    public void testNewSnowValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("AK", 20.2, 0.213);
        boolean valid = updateSnowDepth.newSnowDataValid(32, 26, 6);
        assertTrue("New snow", valid);
    }

    @Test
    public void testMeltingSnowValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(22, 26, 4.8);
        assertTrue("Melting snow", valid);
    }

    @Test
    public void testFirstSnowValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(4, 0, 0.81);
        assertTrue("First snow", valid);
    }

    @Test
    public void snowCompletelyMeltedValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(0, 4, 0.1);
        assertTrue("New snow", valid);
    }

    @Test
    public void testNoChangeValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(26, 26, 8.3);
        assertTrue("No change", valid);
    }

    @Test
    public void noSweValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(70, 4, 0);
        assertFalse("No swe", valid);
    }

    @Test
    public void noSweValid2() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(34, 10, 0);
        assertFalse("No swe", valid);
    }

    @Test
    public void noSweValid3() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 17.0, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(1, 25, 0);
        assertFalse("No swe", valid);
    }

    @Test
    public void sanityCheckValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(110, 110, 0.2);
        assertFalse("Sanity check", valid);
    }

    @Test
    public void correctedSnowValid() {
        UpdateSnowDepth updateSnowDepth = new UpdateSnowDepth("CO", 13.37, 0.238);
        boolean valid = updateSnowDepth.newSnowDataValid(15, 170, 3.5);
        assertTrue("Corrected snow", valid);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testIllegalArgument() {
        UpdateSnowDepth snowDepthRequest = new UpdateSnowDepth("CO", "weekly");
    }
}