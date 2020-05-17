import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class DailySnowDepth extends APIHeader {
    private final transient Logger log = LoggerFactory.getLogger(DailySnowDepth.class);

    public DailySnowDepth() {

    }

    @Override
    public void buildResponse() {
        String sql = "UPDATE stations SET snowdepth=? WHERE triplet=?";

        try (
                Connection conn = Stations.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
        ) {
            Stations stations = new Stations();
            stations.buildResponse();
            for(Station station : stations.getStations()) {
                Snotel snotel = new Snotel(station.getTriplet());
                snotel.buildResponse();
                log.trace("{} snow depth: {}", station.getTriplet(), snotel.getSnowDepth());

                stmt.setInt(1, snotel.getSnowDepth());
                stmt.setString(2, station.getTriplet());

                stmt.executeUpdate();
            }
        } catch (Exception e) {
            log.error("Exception: {}", e);
        }
    }
}
