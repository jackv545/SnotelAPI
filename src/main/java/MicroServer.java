import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.io.File;
import java.util.Scanner;

public class MicroServer {
    private final Logger log = LoggerFactory.getLogger(MicroServer.class);

    MicroServer() {
        Spark.port(getHerokuAssignedPort());
        processRestfulAPIrequests();
        log.info("MicroServer running on port: {}", getHerokuAssignedPort());
    }

    static int getHerokuAssignedPort() {
        ProcessBuilder processBuilder = new ProcessBuilder();
        if (processBuilder.environment().get("PORT") != null) {
            return Integer.parseInt(processBuilder.environment().get("PORT"));
        }
        return 3001; //return default port if heroku-port isn't set (i.e. on localhost)
    }

    private void processRestfulAPIrequests() {
        Spark.get("api/config", this::processConfigRequest);
        Spark.get("api/stations", this::processStationsRequest);
    }

    private String processConfigRequest(Request request, Response response) {
        log.info("Config request: {}", HTTPrequestToJson(request));
        response.type("application/json");
        response.header("Access-Control-Allow-Origin", "*");
        response.status(200);

        try {
            Gson jsonConverter = new Gson();
            Config apiRequest = new Config();
            apiRequest.buildResponse();
            String responseBody = jsonConverter.toJson(apiRequest);
            log.trace("Config response: {}", responseBody);
            return responseBody;
        } catch (Exception e) {
            log.error("Exception: {}", e);
            response.status(500);
            return request.body();
        }
    }

    private String processStationsRequest(Request request, Response response) {
        log.info("Stations request: {}", HTTPrequestToJson(request));
        response.type("application/json");
        response.header("Access-Control-Allow-Origin", "*");
        response.status(200);

        try {
            String responseBody = new Scanner(new File("stations.json")).useDelimiter("\\Z").next();
            log.trace("Stations response: {}", responseBody);
            return responseBody;
        } catch (Exception e) {
            log.error("Exception: {}", e);
            response.status(500);
            return request.body();
        }
    }

    private String HTTPrequestToJson(Request request) {
        return "{\n"
                + "\t\"attributes\":\"" + request.attributes() + "\",\n"
                + "\t\"body\":\"" + request.body() + "\",\n"
                + "\t\"contentLength\":\"" + request.contentLength() + "\",\n"
                + "\t\"contentType\":\"" + request.contentType() + "\",\n"
                + "\t\"contextPath\":\"" + request.contextPath() + "\",\n"
                + "\t\"cookies\":\"" + request.cookies() + "\",\n"
                + "\t\"headers\":\"" + request.headers() + "\",\n"
                + "\t\"host\":\"" + request.host() + "\",\n"
                + "\t\"ip\":\"" + request.ip() + "\",\n"
                + "\t\"params\":\"" + request.params() + "\",\n"
                + "\t\"pathInfo\":\"" + request.pathInfo() + "\",\n"
                + "\t\"serverPort\":\"" + request.port() + "\",\n"
                + "\t\"protocol\":\"" + request.protocol() + "\",\n"
                + "\t\"queryParams\":\"" + request.queryParams() + "\",\n"
                + "\t\"requestMethod\":\"" + request.requestMethod() + "\",\n"
                + "\t\"scheme\":\"" + request.scheme() + "\",\n"
                + "\t\"servletPath\":\"" + request.servletPath() + "\",\n"
                + "\t\"session\":\"" + request.session() + "\",\n"
                + "\t\"uri()\":\"" + request.uri() + "\",\n"
                + "\t\"url()\":\"" + request.url() + "\",\n"
                + "\t\"userAgent\":\"" + request.userAgent() + "\"\n"
                + "}";
    }
}
