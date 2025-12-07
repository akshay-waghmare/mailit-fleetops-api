package com.fleetops.client.service;

import com.fleetops.client.dto.ClientDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientParseResult {
    @Builder.Default
    private List<ClientDto> validClients = new ArrayList<>();
    
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    public boolean hasValidClients() {
        return !validClients.isEmpty();
    }
}
