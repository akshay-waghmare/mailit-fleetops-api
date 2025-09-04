package com.fleetops.geo.dto;

import lombok.Data;
import java.util.List;

@Data
public class ImportResultDto {
    private int totalRows;
    private int successRows;
    private int errorRows;
    private List<String> errors;
    private String message;
}
