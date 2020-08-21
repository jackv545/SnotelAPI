import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URISyntaxException;
import java.sql.*;

import java.util.ArrayList;
import java.util.List;

public class SkiAreas extends APIHeader{
    static class Filter {
        private final String searchField, searchTerm;

        Filter(String searchField, String searchTerm) {
            this.searchField = searchField;
            this.searchTerm = searchTerm;
        }

        boolean usingFilter() {
            return !searchTerm.equals(MicroServer.DEFAULT_QUERY_PARAM);
        }

        String getSearchField() {
            return searchField;
        }

        String getSearchTermString() {
            return searchTerm;
        }

        int getSearchTermInt() {
            return Integer.parseInt(searchTerm);
        }
    }

    private final transient Logger log = LoggerFactory.getLogger(SkiAreas.class);

    private List<SkiArea> skiAreas;
    private int size;

    private final transient List<Filter> FILTERS;
    private transient String orderBy;
    private enum SearchFields {
        id, region, name
    }


    public SkiAreas(String id, String region, String name) {
        this.requestVersion = 1;
        this.requestType= "skiAreas";

        FILTERS = new ArrayList<>();
        FILTERS.add(new Filter(SearchFields.id.toString(), id));
        FILTERS.add( new Filter(SearchFields.region.toString(), region));
        FILTERS.add(new Filter(SearchFields.name.toString(), name));

        orderBy = "none";
    }

    public SkiAreas(String id, String region, String name, String orderBy) {
        this(id, region, name);
        if(orderBy.equals("name") || orderBy.equals("elevation")) {
            this.orderBy = orderBy;
        } else {
            this.orderBy = "none";
        }
    }

    private String orderByClause() {
        if(orderBy.equals("none")) {
            return "";
        } else if(orderBy.equals("elevation")) {
            return "ORDER BY \"topElevation\" DESC";
        } else {
            return String.format("ORDER BY %s", orderBy);
        }
    }

    private String query() {
        String whereClause = "WHERE \"operatingStatus\"=1 AND \"hasDownhill\"=true";
        String query = String.format("SELECT * FROM \"skiAreas\" %s", whereClause);

        for(Filter filter : FILTERS) {
            if(filter.usingFilter()) {
                if(filter.getSearchField().equals("name")) {
                    query = String.format("%s AND %s ILIKE ?", query, filter.getSearchField());
                } else {
                    query = String.format("%s AND %s=?", query, filter.getSearchField());
                }
            }
        }
        query = String.format("%s %s", query, orderByClause());
        return query;
    }

    @Override
    public void buildResponse() throws URISyntaxException, SQLException {
        skiAreas = new ArrayList<>();

        try (
            Connection conn = Stations.getConnection();
            PreparedStatement stmt = conn.prepareStatement(query());
        ) {
            int i = 1;
            for(Filter filter : FILTERS) {
                if(filter.usingFilter()) {
                    if(filter.getSearchField().equals(SearchFields.name.toString())) {
                        stmt.setString(i, String.format("%s%%", filter.getSearchTermString()));
                    } else {
                        stmt.setInt(i, filter.getSearchTermInt());
                    }
                    i++;
                }
            }

            log.trace(stmt.toString());
            ResultSet rs = stmt.executeQuery();

            while(rs.next()) {
                skiAreas.add(new SkiArea(
                    rs.getInt("id"),
                    rs.getInt("region"),
                    rs.getString("name"),
                    rs.getString("website"),
                    rs.getDouble("lat"),
                    rs.getDouble("lng"),
                    rs.getInt("topElevation"),
                    rs.getInt("bottomElevation"),
                    rs.getInt("verticalDrop"),
                    rs.getInt("operatingStatus"),
                    rs.getBoolean("hasDownhill"),
                    rs.getBoolean("hasNordic")
                ));
            }
        }
        size = skiAreas.size();
    }

    public List<SkiArea> getSkiAreas() {
        return skiAreas;
    }
}
