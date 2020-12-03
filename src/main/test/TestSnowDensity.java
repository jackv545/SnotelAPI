import org.junit.Test;

import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Map;

import static org.junit.Assert.assertEquals;

public class TestSnowDensity {
    @Test
    public void testState() throws SQLException, URISyntaxException {
        SnowDensity snowDensity = new SnowDensity();
        snowDensity.buildResponse();
        Map<String, Double> stateSnowDensity = snowDensity.getSnowDensity();
        assertEquals(stateSnowDensity.size(), 13);
    }
}
