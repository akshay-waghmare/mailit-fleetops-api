package com.fleetops.geo.exception;

public class InvalidCoordinatesException extends RuntimeException {
    
    public InvalidCoordinatesException(String message) {
        super(message);
    }
    
    public InvalidCoordinatesException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static InvalidCoordinatesException invalidLatitude(double latitude) {
        return new InvalidCoordinatesException(
            String.format("Invalid latitude: %f. Must be between -90 and 90 degrees", latitude)
        );
    }
    
    public static InvalidCoordinatesException invalidLongitude(double longitude) {
        return new InvalidCoordinatesException(
            String.format("Invalid longitude: %f. Must be between -180 and 180 degrees", longitude)
        );
    }
    
    public static InvalidCoordinatesException invalidCoordinates(double latitude, double longitude) {
        return new InvalidCoordinatesException(
            String.format("Invalid coordinates: latitude=%f, longitude=%f", latitude, longitude)
        );
    }
}
