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
        Stations stationsRequest = new Stations("state", "CO");
        stationsRequest.buildResponse();

        assertEquals("Count of available CO stations",
                113, stationsRequest.getStations().size());
    }

    @Test
    public void testTop5SnowPack() throws SQLException, URISyntaxException {
        //Request the top 5 stations with most snow
        Stations stationsRequest = new Stations(5);
        stationsRequest.buildResponse();

        List<Station> stations = stationsRequest.getStations();

        String testDescription = String.format("%s snow depth of %d greater than %s snow depth of %d",
                stations.get(0).getTriplet(), stations.get(0).getSnowDepth(),
                stations.get(1).getTriplet(), stations.get(1).getSnowDepth());

        assertTrue(testDescription,
                stations.get(0).getSnowDepth() >= stations.get(1).getSnowDepth());
    }

    @Test(expected = SQLException.class)
    public void testSQLerror() throws SQLException, URISyntaxException {
        Stations stationsRequest = new Stations("county", "Summit");
        stationsRequest.buildResponse();
    }
}
