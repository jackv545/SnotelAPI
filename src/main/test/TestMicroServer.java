import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class TestMicroServer {
    private Config config;

    @Before
    public void createTestObjects() {
        config = new Config();
        config.buildResponse();
    }

    @Test
    public void testConfig() {
        assertEquals("Request version", 1, config.getRequestVersion());
        assertEquals("Request type", "config", config.getRequestType());
        assertEquals("Server name", "Snotel API", config.getServerName());
    }
}
