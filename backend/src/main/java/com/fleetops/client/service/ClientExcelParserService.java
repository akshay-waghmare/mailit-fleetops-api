package com.fleetops.client.service;

import com.fleetops.client.dto.ClientDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class ClientExcelParserService {

    public ClientParseResult parseClients(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ClientParseResult.builder().build();
        }

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getNumberOfSheets() > 0 ? wb.getSheetAt(0) : null;
            if (sheet == null) return ClientParseResult.builder().build();

            Row header = sheet.getRow(0);
            Map<String, Integer> idx = buildHeaderIndex(header);

            // We don't strictly enforce all headers, but we need at least the keys
            // ContractNo, SubContractCode
            
            int last = sheet.getLastRowNum();
            List<ClientDto> validClients = new ArrayList<>();
            List<String> allErrors = new ArrayList<>();
            
            for (int r = 1; r <= last; r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                
                // Skip empty rows
                if (isRowEmpty(row)) continue;

                try {
                    // Extract mandatory fields first
                    String contractNo = getString(row, idx.get("ContractNo"));
                    String subContractCode = getString(row, idx.get("SubContractCode"));
                    String subContractName = getString(row, idx.get("SubContractName"));

                    // Validate mandatory fields
                    List<String> missingFields = new ArrayList<>();
                    if (contractNo == null || contractNo.trim().isEmpty()) {
                        missingFields.add("ContractNo");
                    }
                    if (subContractCode == null || subContractCode.trim().isEmpty()) {
                        missingFields.add("SubContractCode");
                    }
                    if (subContractName == null || subContractName.trim().isEmpty()) {
                        missingFields.add("SubContractName");
                    }

                    if (!missingFields.isEmpty()) {
                        allErrors.add("Row " + (r + 1) + ": Missing mandatory fields: " + 
                                String.join(", ", missingFields));
                        continue; // Skip this row but continue processing others
                    }

                    ClientDto dto = ClientDto.builder()
                            .contractNo(contractNo)
                            .subContractName(subContractName)
                            .subContractCode(subContractCode)
                            .vAddress(getString(row, idx.get("vAddress")))
                            .vPincode(getString(row, idx.get("vPincode")))
                            .vCity(getString(row, idx.get("vCity")))
                            .vState(getString(row, idx.get("vState")))
                            .vCountry(getString(row, idx.get("vCountry")))
                            .vContactPerson(getString(row, idx.get("vContactPerson")))
                            .vContactMobile(getString(row, idx.get("vContactMobile")))
                            .vContactEmail(getString(row, idx.get("vContactEmail")))
                            .vBillGstNo(getString(row, idx.get("vBillGSTNo")))
                            .vBillingName(getString(row, idx.get("vBillingName")))
                            .vDeptName(getString(row, idx.get("vDeptName")))
                            .vBillAddress1(getString(row, idx.get("vBillAddress1")))
                            .vBillAddress2(getString(row, idx.get("vBillAddress2")))
                            .vBillPincode(getString(row, idx.get("vBillPincode")))
                            .vBillState(getString(row, idx.get("vBillState")))
                            .vBillCity(getString(row, idx.get("vBillCity")))
                            .vCcName(getString(row, idx.get("vCCName")))
                            .vBillCountry(getString(row, idx.get("vBillCountry")))
                            .vBillStaeCode(getString(row, idx.get("vBillStaeCode")))
                            .vBillKindAttn(getString(row, idx.get("vBillKindAttn")))
                            .vBillEmail(getString(row, idx.get("vBillEmail")))
                            .vBillMobile(getString(row, idx.get("vBillMobile")))
                            .vIntimationEmailIds(getString(row, idx.get("vIntimationEmailids")))
                            .build();

                    // Map mandatory legacy fields to core fields
                    dto.setName(dto.getSubContractName());
                    dto.setAddress(dto.getVAddress());
                    dto.setContactPerson(dto.getVContactPerson());

                    // Validate mapped mandatory fields
                    List<String> mappedMissingFields = new ArrayList<>();
                    if (dto.getAddress() == null || dto.getAddress().trim().isEmpty()) {
                        mappedMissingFields.add("vAddress");
                    }
                    if (dto.getContactPerson() == null || dto.getContactPerson().trim().isEmpty()) {
                        mappedMissingFields.add("vContactPerson");
                    }

                    if (!mappedMissingFields.isEmpty()) {
                        allErrors.add("Row " + (r + 1) + ": Missing mandatory fields: " + 
                                String.join(", ", mappedMissingFields));
                        continue; // Skip this row but continue processing others
                    }

                    validClients.add(dto);
                } catch (Exception e) {
                    allErrors.add("Row " + (r + 1) + ": " + e.getMessage());
                }
            }
            
            return ClientParseResult.builder()
                    .validClients(validClients)
                    .errors(allErrors)
                    .build();
        } catch (IOException e) {
            return ClientParseResult.builder()
                    .errors(List.of("Failed to read Excel file: " + e.getMessage()))
                    .build();
        }
    }

    public byte[] generateTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Clients");
            Row header = sheet.createRow(0);
            
            String[] headers = {
                "ContractNo", "SubContractName", "SubContractCode", "vAddress", "vPincode", 
                "vCity", "vState", "vCountry", "vContactPerson", "vContactMobile", 
                "vContactEmail", "vBillGSTNo", "vBillingName", "vDeptName", "vBillAddress1", 
                "vBillAddress2", "vBillPincode", "vBillState", "vBillCity", "vCCName", 
                "vBillCountry", "vBillStaeCode", "vBillKindAttn", "vBillEmail", "vBillMobile", 
                "vIntimationEmailids"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }

            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate template", e);
        }
    }

    private Map<String, Integer> buildHeaderIndex(Row header) {
        if (header == null) return Collections.emptyMap();
        Map<String, Integer> m = new HashMap<>();
        short last = header.getLastCellNum();
        for (int c = 0; c < last; c++) {
            Cell cell = header.getCell(c);
            String name = (cell != null) ? getCellValueAsString(cell).trim() : null;
            if (name != null && !name.isEmpty()) {
                m.put(name, c);
            }
        }
        return m;
    }

    private String getString(Row row, Integer colIdx) {
        if (colIdx == null) return null;
        Cell cell = row.getCell(colIdx);
        return getCellValueAsString(cell);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                }
                // Check if it's an integer-like number (e.g. Pincode)
                double val = cell.getNumericCellValue();
                if (val == (long) val) {
                    return String.valueOf((long) val);
                }
                return String.valueOf(val);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return null;
        }
    }
    
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }
}
