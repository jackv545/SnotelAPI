public abstract class APIHeader {
    protected int requestVersion;
    protected String requestType;

    public abstract void buildResponse();

    public int getRequestVersion() {
        return requestVersion;
    }

    public String getRequestType() {
        return requestType;
    }
}
