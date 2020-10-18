import org.junit.Test;
import static org.junit.Assert.assertEquals;

import java.net.URISyntaxException;
import java.sql.SQLException;

public class TestSkiAreas {
    @Test
    public void testGetAllSkiAreas() throws SQLException, URISyntaxException {
        //Request all available ski areas
        SkiAreas skiAreasRequest = new SkiAreas(
            MicroServer.DEFAULT_QUERY_PARAM,
            MicroServer.DEFAULT_QUERY_PARAM,
            MicroServer.DEFAULT_QUERY_PARAM,
                false
        );
        skiAreasRequest.buildResponse();

        assertEquals(
    "Count of all available ski areas", 170, skiAreasRequest.getSkiAreas().size()
        );
    }

    @Test
    public void testGetCOskiAreas() throws URISyntaxException, SQLException {
        //Request all ski areas with region id 281 (CO)
        SkiAreas skiAreasRequest = new SkiAreas(
            MicroServer.DEFAULT_QUERY_PARAM, "281", MicroServer.DEFAULT_QUERY_PARAM, false
        );
        skiAreasRequest.buildResponse();

        assertEquals(
    "Count of CO ski areas",37, skiAreasRequest.getSkiAreas().size()
        );
    }

    //Should throw exception if non integer argument is given for id or region
    @Test(expected = NumberFormatException.class)
    public void testNumberFormatException() throws URISyntaxException, SQLException {
        SkiAreas skiAreasRequest = new SkiAreas(
            MicroServer.DEFAULT_QUERY_PARAM, "Colorado", MicroServer.DEFAULT_QUERY_PARAM, false
        );
        skiAreasRequest.buildResponse();
    }
}