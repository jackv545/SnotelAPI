public class Config extends APIHeader {
    private String serverName;

    public Config() {
        this.requestType = "config";
        this.requestVersion = 1;
    }

    @Override
    public void buildResponse() {
        this.serverName = "Snotel API";
    }
}
