import org.junit.Test;
import static org.junit.Assert.assertEquals;

import java.net.URISyntaxException;
import java.sql.SQLException;

public class TestState {
    @Test
    public void testState() throws SQLException, URISyntaxException {
        State stateRequest = new State(
            "CO", false,
            false, false
        );
        stateRequest.buildResponse();

        assertEquals("stateName", "Colorado", stateRequest.getStateName());
        assertEquals("regionID", 281, stateRequest.getRegion());
    }

    //should throw error when invalid state option is given
    @Test(expected = SQLException.class)
    public void testSQLerror() throws URISyntaxException, SQLException {
        State stateRequest = new State(
            "123", false,
            false, false
        );
        stateRequest.buildResponse();
    }

    @Test
    public void testStateBounds() throws Exception {
        State stateRequest = new State(
            "CO", false,
            true, false
        );
        stateRequest.buildResponse();

        assertEquals("State bounds array size",
                2, stateRequest.getStationBounds().length);
    }
}
