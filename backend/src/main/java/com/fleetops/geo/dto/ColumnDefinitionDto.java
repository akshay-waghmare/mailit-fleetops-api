package com.fleetops.geo.dto;

import lombok.Data;

@Data
public class ColumnDefinitionDto {
    private String key;
    private String label;
    private String type; // text, date, number, etc.
    private boolean sortable;
    private boolean filterable;
    private boolean visible;
}
