public class StateInfo {
    private String stateName;
    private int count; //number of stations in state
    private String name; //top snowpack in state station name
    private int snowDepth;
    private String triplet;

    public StateInfo(String stateName, int count, String name, int snowDepth, String triplet) {
        this.stateName = stateName;
        this.count = count;
        this.name = name;
        this.snowDepth = snowDepth;
        this.triplet = triplet;
    }
}
