package com.fleetops.geo.exception;

import java.util.UUID;

public class PlaceNameConflictException extends RuntimeException {
    
    public PlaceNameConflictException(String message) {
        super(message);
    }
    
    public PlaceNameConflictException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static PlaceNameConflictException nameExists(UUID organizationId, String placeName) {
        return new PlaceNameConflictException(
            String.format("A place with name '%s' already exists for organization %s", placeName, organizationId)
        );
    }
    
    public static PlaceNameConflictException nameExistsForUpdate(UUID placeId, UUID organizationId, String placeName) {
        return new PlaceNameConflictException(
            String.format("Cannot update place %s: A different place with name '%s' already exists for organization %s", 
                placeId, placeName, organizationId)
        );
    }
}
