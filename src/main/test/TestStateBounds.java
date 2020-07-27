import org.junit.Test;
import static org.junit.Assert.assertEquals;

import java.sql.SQLException;

public class TestStateBounds {
    @Test
    public void testStateBounds() throws Exception {
        StateBounds stateBoundsRequest = new StateBounds( "CO");
        stateBoundsRequest.buildResponse();

        assertEquals("State bounds array size",
                2, stateBoundsRequest.getStateBounds().length);
    }

    //should throw error when invalid state option is given
    @Test(expected = SQLException.class)
    public void testSQLerror() throws Exception {
        StateBounds stateBoundsRequest = new StateBounds( "123");
        stateBoundsRequest.buildResponse();
    }
}
