package com.fleetops.client.service;

import com.fleetops.client.Client;
import com.fleetops.client.ClientRepository;
import com.fleetops.client.dto.ClientDto;
import com.fleetops.client.mapper.ClientMapper;
import com.fleetops.client.dto.ClientImportResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientExcelParserService excelParserService;
    private final ClientMapper clientMapper;

    public ClientImportResponse importClients(MultipartFile file) {
        log.info("Starting client import from file: {}", file.getOriginalFilename());
        
        // Parse the Excel file
        ClientParseResult parseResult = excelParserService.parseClients(file);
        
        List<ClientDto> validDtos = parseResult.getValidClients();
        List<String> parseErrors = parseResult.getErrors();
        
        log.info("Parsed {} valid clients, {} rows with errors", validDtos.size(), parseErrors.size());

        ClientImportResponse response = new ClientImportResponse();
        int totalRows = validDtos.size() + parseErrors.size();
        response.setTotalProcessed(totalRows);
        
        List<ClientDto> importedClients = new ArrayList<>();
        List<String> allErrors = new ArrayList<>(parseErrors);
        int successCount = 0;
        int failureCount = parseErrors.size();

        // Try to save valid clients
        for (ClientDto dto : validDtos) {
            try {
                Client savedClient = upsertClient(dto);
                importedClients.add(clientMapper.toDto(savedClient));
                successCount++;
            } catch (Exception e) {
                log.error("Failed to save client: {}", dto.getContractNo(), e);
                failureCount++;
                allErrors.add("Client " + dto.getContractNo() + ": " + e.getMessage());
            }
        }

        response.setSuccessCount(successCount);
        response.setFailureCount(failureCount);
        response.setImportedClients(importedClients);
        response.setErrors(allErrors);

        log.info("Import completed. Success: {}, Failure: {}", successCount, failureCount);
        return response;
    }

    public byte[] generateTemplate() {
        return excelParserService.generateTemplate();
    }

    @Transactional
    protected Client upsertClient(ClientDto dto) {
        Optional<Client> existing = clientRepository.findByContractNoAndSubContractCode(
                dto.getContractNo(), dto.getSubContractCode());

        Client client;
        if (existing.isPresent()) {
            client = existing.get();
            updateClientFields(client, dto);
        } else {
            client = clientMapper.toEntity(dto);
        }
        
        return clientRepository.save(client);
    }

    private void updateClientFields(Client client, ClientDto dto) {
        // Update core fields
        client.setName(dto.getName());
        client.setAddress(dto.getAddress());
        client.setContactPerson(dto.getContactPerson());

        // Update legacy fields
        client.setSubContractName(dto.getSubContractName());
        client.setVAddress(dto.getVAddress());
        client.setVPincode(dto.getVPincode());
        client.setVCity(dto.getVCity());
        client.setVState(dto.getVState());
        client.setVCountry(dto.getVCountry());
        client.setVContactPerson(dto.getVContactPerson());
        client.setVContactMobile(dto.getVContactMobile());
        client.setVContactEmail(dto.getVContactEmail());
        client.setVBillGstNo(dto.getVBillGstNo());
        client.setVBillingName(dto.getVBillingName());
        client.setVDeptName(dto.getVDeptName());
        client.setVBillAddress1(dto.getVBillAddress1());
        client.setVBillAddress2(dto.getVBillAddress2());
        client.setVBillPincode(dto.getVBillPincode());
        client.setVBillState(dto.getVBillState());
        client.setVBillCity(dto.getVBillCity());
        client.setVCcName(dto.getVCcName());
        client.setVBillCountry(dto.getVBillCountry());
        client.setVBillStaeCode(dto.getVBillStaeCode());
        client.setVBillKindAttn(dto.getVBillKindAttn());
        client.setVBillEmail(dto.getVBillEmail());
        client.setVBillMobile(dto.getVBillMobile());
        client.setVIntimationEmailIds(dto.getVIntimationEmailIds());
    }
    
    public List<ClientDto> getAllClients() {
        return clientRepository.findAll().stream()
                .map(clientMapper::toDto)
                .collect(Collectors.toList());
    }
    
    public ClientDto createClient(ClientDto dto) {
        Client client = clientMapper.toEntity(dto);
        return clientMapper.toDto(clientRepository.save(client));
    }
    
    public ClientDto updateClient(Long id, ClientDto dto) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        
        updateClientFields(client, dto);
        // Also update unique keys if provided, but be careful about conflicts
        if (dto.getContractNo() != null) client.setContractNo(dto.getContractNo());
        if (dto.getSubContractCode() != null) client.setSubContractCode(dto.getSubContractCode());
        
        return clientMapper.toDto(clientRepository.save(client));
    }

    @Transactional
    public void deleteClient(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
        log.info("Deleted client with id: {}", id);
    }
}
