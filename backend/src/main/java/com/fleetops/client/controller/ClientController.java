package com.fleetops.client.controller;

import com.fleetops.client.dto.ClientDto;
import com.fleetops.client.dto.ClientImportResponse;
import com.fleetops.client.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow all origins for now
public class ClientController {

    private final ClientService clientService;

    @PostMapping("/import")
    public ResponseEntity<ClientImportResponse> importClients(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(clientService.importClients(file));
    }

    @GetMapping("/template")
    public ResponseEntity<Resource> downloadTemplate() {
        byte[] data = clientService.generateTemplate();
        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=client_import_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(data.length)
                .body(resource);
    }

    @GetMapping
    public ResponseEntity<Object> getClients(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id,desc") String[] sort) {
        
        if (page != null && size != null) {
            // Parse sort param (simple implementation)
            String sortField = "id";
            Sort.Direction direction = Sort.Direction.DESC;
            if (sort != null && sort.length > 0) {
                String[] sortParams = sort[0].split(",");
                if (sortParams.length > 0) sortField = sortParams[0];
                if (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1])) {
                    direction = Sort.Direction.ASC;
                }
            }
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
            return ResponseEntity.ok(clientService.getClients(query, pageable));
        }
        
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @PostMapping
    public ResponseEntity<ClientDto> createClient(@Valid @RequestBody ClientDto clientDto) {
        return ResponseEntity.ok(clientService.createClient(clientDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientDto> updateClient(@PathVariable Long id, @Valid @RequestBody ClientDto clientDto) {
        return ResponseEntity.ok(clientService.updateClient(id, clientDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
}
