import java.net.URISyntaxException;
import java.sql.SQLException;

public class LocationMap extends APIHeader {
    private State stateInfo;
    private transient String state;
    private transient boolean all;
    private transient State.Table table;
    private APIHeader locations;

    public LocationMap(String state, State.Table table) {
        this.requestType = String.format("%s map", table.toString());
        this.requestVersion = 1;
        this.state = state;
        this.all = state.equals("all");
        this.table = table;
    }

    @Override
    public void buildResponse() throws Exception {
        if(!all) {
            stateInfo = new State(state, table);
            stateInfo.buildResponse();
        }

        switch(table) {
            case skiAreas:
                if(all) {
                    locations = new SkiAreas(MicroServer.DEFAULT_QUERY_PARAM,
                        MicroServer.DEFAULT_QUERY_PARAM, MicroServer.DEFAULT_QUERY_PARAM
                    );
                } else {
                    locations = new SkiAreas(stateInfo.getRegion());
                }
                break;
            case backcountry:
                if(all) {
                    locations = new Stations("none", "", "none");
                } else {
                    locations = new Stations("state", stateInfo.getState(), "none");
                }
                break;
        }
        locations.buildResponse();
    }

    public State getStateInfo() {
        return stateInfo;
    }

    public String getState() {
        return state;
    }

    public boolean isAll() {
        return all;
    }

    public APIHeader getLocations() {
        return locations;
    }
}
