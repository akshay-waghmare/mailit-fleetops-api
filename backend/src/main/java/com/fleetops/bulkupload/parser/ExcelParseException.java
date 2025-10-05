package com.fleetops.bulkupload.parser;

/**
 * Generic Excel parsing exception.
 */
public class ExcelParseException extends RuntimeException {
    public ExcelParseException(String message) { super(message); }
    public ExcelParseException(String message, Throwable cause) { super(message, cause); }
}
