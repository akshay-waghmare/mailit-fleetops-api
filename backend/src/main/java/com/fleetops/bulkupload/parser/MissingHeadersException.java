package com.fleetops.bulkupload.parser;

/**
 * Indicates required headers are missing from the Excel sheet.
 */
public class MissingHeadersException extends ExcelParseException {
    public MissingHeadersException(String message) { super(message); }
}
