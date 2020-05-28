public abstract class APIHeader {
    protected int requestVersion;
    protected String requestType;

    public abstract void buildResponse() throws Exception;

    public int getRequestVersion() {
        return requestVersion;
    }

    public String getRequestType() {
        return requestType;
    }
}
