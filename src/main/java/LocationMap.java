import java.util.List;

public class LocationMap extends APIHeader {
    private State stateInfo;
    private transient String state;
    private transient boolean all;
    private State.Table table;
    private List<Mappable> locations;

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
                SkiAreas skiAreas;
                if(all) {
                    skiAreas = new SkiAreas(
                        MicroServer.DEFAULT_QUERY_PARAM, MicroServer.DEFAULT_QUERY_PARAM,
                        MicroServer.DEFAULT_QUERY_PARAM, true
                    );
                } else {
                    skiAreas = new SkiAreas(stateInfo.getRegion());
                }
                skiAreas.buildResponse();
                locations = skiAreas.getSkiAreasMap();
                break;
            case backcountry:
                Stations stations;
                if(all) {
                    stations = new Stations("none", "", "none", true);
                } else {
                    stations = new Stations("state", stateInfo.getState(), "none", true);
                }
                stations.buildResponse();
                locations = stations.getStations();
                break;
        }

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
}
