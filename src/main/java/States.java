import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class States extends APIHeader{
    private final transient Logger log = LoggerFactory.getLogger(States.class);

    private List<String> states;

    public States() {
        this.requestVersion = 1;
        this.requestType = "states";
    }

    @Override
    public void buildResponse() throws Exception {
        states = new ArrayList<>();
        try (
                Connection conn = Stations.getConnection();
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT state FROM stations GROUP BY state ORDER BY state;"
                );
        ) {
            while(rs.next()) {
                states.add(rs.getString("state"));
            }
        }

    }
}
