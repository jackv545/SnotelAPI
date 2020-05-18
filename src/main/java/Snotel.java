import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.*;

public class Snotel extends APIHeader{
    private final transient Logger log = LoggerFactory.getLogger(Snotel.class);

    private String stationTriplet;
    private int snowDepth;

    public Snotel() {

    }

    public Snotel(String stationTriplet) {
        this.requestVersion = 1;
        this.requestType = "snotel";
        this.stationTriplet = stationTriplet;
    }

    private URL reportURL() {
        try {
            return new URL("https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/"
                    + "customMultiTimeSeriesGroupByStationReport/daily/start_of_period/"
                    + stationTriplet + "%7Cid=%22%22%7Cname/0,0/SNWD::value?fitToScreen=false"
            );
        } catch (MalformedURLException e) {
            log.error("Malformed url: {}", e);
            return null;
        }
    }

    private void setParameters(InputStreamReader isr) throws IOException {
        BufferedReader in = new BufferedReader(isr);
        String inputLine;
        int nonCommentLine = 0;
        while ((inputLine = in.readLine()) != null) {
            if(inputLine.charAt(0) != '#') {
                if(nonCommentLine != 0) {
                    String[] result = inputLine.split(",");
                    snowDepth = Integer.parseInt(result[1]);
                }
                nonCommentLine++;
            }
        }

        in.close();
    }

    @Override
    public void buildResponse() {
        URL url = reportURL();

        try {
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            int status = con.getResponseCode();

            if(status > 199 && status < 300) {
                setParameters(new InputStreamReader(con.getInputStream()));
            } else {
                log.error("{}\nResponse code: {}", url, status);
            }
        } catch (IOException e) {
            log.error("IOException: {}", e);
        }
    }

    public int getSnowDepth() {
        return snowDepth;
    }
}
