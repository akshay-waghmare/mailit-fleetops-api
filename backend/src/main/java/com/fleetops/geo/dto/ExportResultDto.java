package com.fleetops.geo.dto;

import lombok.Data;

@Data
public class ExportResultDto {
    private byte[] data;
    private String contentType;
    private String filename;
}
