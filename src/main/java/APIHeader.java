public abstract class APIHeader {
    protected Integer requestVersion;
    protected String requestType;

    public abstract void buildResponse();
}
