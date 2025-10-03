package com.fleetops.bulkupload.parser;

/**
 * Indicates uploaded file exceeds configured max size.
 */
public class FileSizeExceededException extends ExcelParseException {
    public FileSizeExceededException(String message) { super(message); }
}
