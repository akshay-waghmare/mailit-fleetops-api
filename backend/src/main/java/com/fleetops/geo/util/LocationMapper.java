package com.fleetops.geo.util;

import com.fleetops.geo.dto.LocationDto;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public final class LocationMapper {
    
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    
    private LocationMapper() {
        // Utility class
    }
    
    /**
     * Creates a JTS Point from latitude and longitude coordinates.
     * Note: JTS uses (X, Y) = (longitude, latitude) coordinate order.
     */
    public static Point createPoint(double latitude, double longitude) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, latitude));
    }
    
    /**
     * Converts a JTS Point to LocationDto.
     * Note: JTS Point X = longitude, Y = latitude.
     */
    public static LocationDto toLocationDto(Point point) {
        if (point == null) {
            return null;
        }
        return new LocationDto(point.getY(), point.getX()); // Y=latitude, X=longitude
    }
    
    /**
     * Creates a Point from LocationDto.
     */
    public static Point fromLocationDto(LocationDto location) {
        if (location == null) {
            return null;
        }
        return createPoint(location.getLatitude(), location.getLongitude());
    }
}
