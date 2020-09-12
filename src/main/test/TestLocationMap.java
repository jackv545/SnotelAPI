import org.junit.Test;

import static org.junit.Assert.*;

public class TestLocationMap {
    private void testAllLocationMap(LocationMap locationMapRequest) throws Exception {
        locationMapRequest.buildResponse();

        assertEquals("All states", locationMapRequest.getState(), "all");
        assertTrue(locationMapRequest.isAll());
    }

    @Test
    public void testAllSkiAreasMap() throws Exception {
        testAllLocationMap(new LocationMap("all", State.Table.skiAreas));
    }

    @Test
    public void testAllStationsMap() throws Exception {
        testAllLocationMap(new LocationMap("all", State.Table.backcountry));
    }

    private void testSingleStateMap(LocationMap locationMapRequest) throws Exception {
        locationMapRequest.buildResponse();

        assertEquals("State name",
            locationMapRequest.getStateInfo().getStateName(), "Colorado"
        );
        assertFalse(locationMapRequest.isAll());
    }

    @Test
    public void testSkiAreasMap() throws Exception {
        testSingleStateMap(new LocationMap("CO", State.Table.skiAreas));
    }

    @Test
    public void testStationsMap() throws Exception {
        testSingleStateMap(new LocationMap("CO", State.Table.backcountry));
    }
}
