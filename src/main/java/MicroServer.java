import com.google.gson.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

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
        Spark.get("api/stations", this::processStationsRequest);
        Spark.post("api/snotel", this::processSnotelRequest);
        Spark.patch("api/updateSnowDepth", this::processUpdateSnowDepthRequest);
        Spark.get("api/states", this::processStatesRequest);
        Spark.get("api/updateResorts", this::processUpdateResortsRequest);
        Spark.get("api/skiAreas", this::processSkiAreasRequest);
        Spark.get("api/state", this::processStateRequest);
        Spark.get("api/count", this::processCountRequest);
        Spark.get("api/map/ski-areas", this::processSkiAreaMapRequest);
        Spark.get("api/map/backcountry", this::processStationsMapRequest);
    }

    private String processConfigRequest(Request request, Response response) {
        return processGetRequest(new Config(), request, response);
    }

    private String processStationsRequest(Request request, Response response) {
        String limit = request.queryParamOrDefault("limit", "0");
        String searchField = request.queryParamOrDefault("searchField", "");
        String searchTerm = request.queryParamOrDefault("searchTerm", "");
        String orderBy = request.queryParamOrDefault("orderBy", "");
        return processGetRequest(new Stations(Integer.parseInt(limit), searchField, searchTerm, orderBy, false),
            request, response);
    }

    private String processSnotelRequest(Request request, Response response) {
        return processPostRequest(Snotel.class, request, response);
    }

    private String processUpdateSnowDepthRequest(Request request, Response response) {
        String state = request.queryParams("state");
        String interval = request.queryParamOrDefault("interval", "hourly");
        return processGetRequest(new UpdateSnowDepth(state, interval), request, response);
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
        return processGetRequest( new State(state), request, response);
    }
    
    private String processCountRequest(Request request, Response response) {
        return processGetRequest(new Count(request.queryParams("state")), request, response);
    }

    private String processSkiAreaMapRequest(Request request, Response response) {
        return processGetRequest(
            new LocationMap(request.queryParams("state"), State.Table.skiAreas),
            request, response
        );
    }

    private String processStationsMapRequest(Request request, Response response) {
        return processGetRequest(
            new LocationMap(request.queryParams("state"), State.Table.backcountry),
            request, response
        );
    }

    private String processGetRequest(APIHeader requestType, Request request, Response response) {
        log.info("{} request: {}", requestType.getRequestType(), HTTPRequestToJson(request, false, false));
        response.type("application/json");
        response.header("Access-Control-Allow-Origin", "*");
        response.status(200);

        try {
            Gson jsonConverter =
                new GsonBuilder().registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter()).create();
            APIHeader apiRequest = requestType;
            apiRequest.buildResponse();
            String responseBody = jsonConverter.toJson(apiRequest);
            log.debug("{} response: {}", requestType.getRequestType(), responseBody);
            return responseBody;
        } catch (SQLException | IllegalArgumentException e) {
            log.error("Exception:", e);
            response.status(400);
            return request.body();
        } catch (IOException e) {
            log.error("Exception:", e);
            response.status(502);
            return request.body();
        } catch (Exception e) {
            log.error("Exception:", e);
            response.status(500);
            return request.body();
        }
    }

    private String processPostRequest(Type requestType, Request request, Response response) {
        log.info("API request: {}", HTTPRequestToJson(request, true, false));
        response.type("application/json");
        response.header("Access-Control-Allow-Origin", "*");
        response.status(200);

        try {
            Gson jsonConverter = new Gson();
            APIHeader apiRequest = jsonConverter.fromJson(request.body(), requestType);
            apiRequest.buildResponse();
            String responseBody = jsonConverter.toJson(apiRequest);
            log.info("API response: {}", responseBody);
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

    private String HTTPRequestToJson(Request request, Boolean includeBody, Boolean verbose) {
        StringBuilder logMessage = new StringBuilder("{\n");
        logMessage.append("\t\"requestMethod\":\"" + request.requestMethod() + "\", ");
        logMessage.append("\"scheme\":\"" + request.scheme() + "\",\n");
        logMessage.append("\t\"url()\":\"" + request.url() + "\", ");
        logMessage.append("\"queryParams\":\"" + request.queryParams() + "\",\n");
        logMessage.append("\t\"userAgent\":\"" + request.userAgent() + "\", ");
        logMessage.append("\"ip\":\"" + request.ip() + "\",\n");
        if(includeBody) {
            logMessage.append("\t\"body\":\"" + request.body() + "\",\n");
            logMessage.append("\t\"contentLength\":\"" + request.contentLength() + "\", ");
            logMessage.append("\"contentType\":\"" + request.contentType() + "\",\n");
        }
        if(verbose) {
            logMessage.append("\t\"attributes\":\"" + request.attributes() + "\",\n");
            logMessage.append("\t\"contextPath\":\"" + request.contextPath() + "\",\n");
            logMessage.append("\t\"cookies\":\"" + request.cookies() + "\",\n");
            logMessage.append("\t\"headers\":\"" + request.headers() + "\",\n");
            logMessage.append("\t\"serverPort\":\"" + request.port() + "\",\n");
            logMessage.append("\t\"session\":\"" + request.session() + "\",\n");
        }
        logMessage.append("}");

        return logMessage.toString();
    }

    class LocalDateTimeAdapter implements JsonSerializer<LocalDateTime> {
        public JsonElement serialize(LocalDateTime date, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(date.toInstant(ZoneOffset.ofHours(0)).toEpochMilli());
        }
    }
}
