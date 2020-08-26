import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.sql.SQLException;

public class MicroServer {
    private final Logger log = LoggerFactory.getLogger(MicroServer.class);

    public static final String DEFAULT_QUERY_PARAM = "Any";

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
        Spark.get("/", this::processConfigRequest);
        Spark.get("api/config", this::processConfigRequest);
        Spark.post("api/stations", this::processStationsRequest);
        Spark.post("api/snotel", this::processSnotelRequest);
        Spark.post("api/dailySnowDepth", this::processDailySnowDepthRequest);
        Spark.get("api/states", this::processStatesRequest);
        Spark.get("api/updateResorts", this::processUpdateResortsRequest);
        Spark.get("api/skiAreas", this::processSkiAreasRequest);
        Spark.get("api/state", this::processStateRequest);
        Spark.get("api/count", this::processCountRequest);
    }

    private String processConfigRequest(Request request, Response response) {
        return processGetRequest(new Config(), request, response);
    }

    private String processStationsRequest(Request request, Response response) {
        return processPostRequest(Stations.class, request, response);
    }

    private String processSnotelRequest(Request request, Response response) {
        return processPostRequest(Snotel.class, request, response);
    }

    private String processDailySnowDepthRequest(Request request, Response response) {
        return processPostRequest(DailySnowDepth.class, request, response);
    }

    private String processStatesRequest(Request request, Response response) {
        return processGetRequest(new States(), request, response);
    }

    private String processUpdateResortsRequest(Request request, Response response) {
        return processGetRequest(new SkiAreaData(), request, response);
    }

    private String processSkiAreasRequest(Request request, Response response) {
        String id =
            request.queryParamOrDefault("id", DEFAULT_QUERY_PARAM);
        String region =
            request.queryParamOrDefault("region", DEFAULT_QUERY_PARAM);
        String name =
                request.queryParamOrDefault("name", DEFAULT_QUERY_PARAM);
        String orderBy =
            request.queryParamOrDefault("orderBy", "none");
        return processGetRequest(new SkiAreas(id, region, name, orderBy), request, response);
    }

    private String processStateRequest(Request request, Response response) {
        String state = request.queryParams("state");
        String includeBounds =
            request.queryParamOrDefault("includeStationBounds", "false");
        String includeSkiAreaBounds =
            request.queryParamOrDefault("includeSkiAreaBounds", "false");
        return processGetRequest(
            new State(state, includeBounds, includeSkiAreaBounds), request, response
        );
    }
    
    private String processCountRequest(Request request, Response response) {
        return processGetRequest(new Count(request.queryParams("state")), request, response);
    }

    private String processGetRequest(APIHeader requestType, Request request, Response response) {
        log.info("{} request: {}", requestType.getRequestType(), HTTPrequestToJson(request));
        response.type("application/json");
        response.header("Access-Control-Allow-Origin", "*");
        response.status(200);

        try {
            Gson jsonConverter = new Gson();
            APIHeader apiRequest = requestType;
            apiRequest.buildResponse();
            String responseBody = jsonConverter.toJson(apiRequest);
            log.trace("{} response: {}", requestType.getRequestType(), responseBody);
            return responseBody;
        } catch (NumberFormatException | SQLException e) {
            log.error("Exception:", e);
            response.status(400);
            return request.body();
        } catch (Exception e) {
            log.error("Exception:", e);
            response.status(500);
            return request.body();
        }
    }

    private String processPostRequest(Type requestType, Request request, Response response) {
        log.info("API request: {}", HTTPrequestToJson(request));
        response.type("application/json");
        response.header("Access-Control-Allow-Origin", "*");
        response.status(200);

        try {
            Gson jsonConverter = new Gson();
            APIHeader apiRequest = jsonConverter.fromJson(request.body(), requestType);
            apiRequest.buildResponse();
            String responseBody = jsonConverter.toJson(apiRequest);
            log.trace("API response: {}", responseBody);
            return responseBody;
        } catch(URISyntaxException e){
            log.error("URISyntaxException: {}", e);
            response.status(502);
            return request.body();
        } catch (SQLException e) {
            log.error("SQLException: {}", e);
            response.status(400);
            return request.body();
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
