import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.List;

public class TestStations {
    @Test
    public void testGetAllStations() throws SQLException, URISyntaxException {
        //Request all available snotel stations
        Stations stationsRequest = new Stations();
        stationsRequest.buildResponse();

        assertEquals("Count of all available stations",
                822, stationsRequest.getStations().size());
    }

    @Test
    public void testGetCOStations() throws SQLException, URISyntaxException {
        //Request all stations in Colorado
        Stations stationsRequest = new Stations("state", "CO", "", false);
        stationsRequest.buildResponse();

        assertEquals("Count of available CO stations",
                113, stationsRequest.getStations().size());
    }

    //should throw error when search field option is invalid
    @Test(expected = SQLException.class)
    public void testSQLerror1() throws SQLException, URISyntaxException {
        Stations stationsRequest = new Stations("county", "Summit", "", false);
        stationsRequest.buildResponse();
    }

    //should throw error when orderBy option is invalid
    @Test(expected = SQLException.class)
    public void testSQLerror2() throws SQLException, URISyntaxException {
        Stations stationsRequest = new Stations("state", "CO", "weather", false);
        stationsRequest.buildResponse();
    }
}
