package com.fleetops.client.service;

import com.fleetops.client.dto.ClientDto;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ClientExcelParserServiceTest {

    private final ClientExcelParserService parserService = new ClientExcelParserService();

    @Test
    void shouldParseValidClients() throws IOException {
        // Given: A valid Excel file with all mandatory fields
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode", "vAddress", "vContactPerson"},
                {"CON001", "Test Client 1", "SUB001", "123 Main St", "John Doe"},
                {"CON002", "Test Client 2", "SUB002", "456 Park Ave", "Jane Smith"}
        });

        // When
        List<ClientDto> clients = parserService.parseClients(file);

        // Then
        assertEquals(2, clients.size());
        assertEquals("CON001", clients.get(0).getContractNo());
        assertEquals("Test Client 1", clients.get(0).getSubContractName());
        assertEquals("SUB001", clients.get(0).getSubContractCode());
        assertEquals("Test Client 1", clients.get(0).getName()); // Mapped from SubContractName
        assertEquals("123 Main St", clients.get(0).getAddress()); // Mapped from vAddress
        assertEquals("John Doe", clients.get(0).getContactPerson()); // Mapped from vContactPerson
    }

    @Test
    void shouldThrowExceptionWhenContractNoIsMissing() throws IOException {
        // Given: Excel file missing ContractNo
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode"},
                {"", "Test Client", "SUB001"} // Empty ContractNo
        });

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            parserService.parseClients(file);
        });
        assertTrue(exception.getMessage().contains("Missing mandatory fields"));
        assertTrue(exception.getMessage().contains("ContractNo"));
    }

    @Test
    void shouldThrowExceptionWhenSubContractCodeIsMissing() throws IOException {
        // Given: Excel file missing SubContractCode
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode"},
                {"CON001", "Test Client", ""} // Empty SubContractCode
        });

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            parserService.parseClients(file);
        });
        assertTrue(exception.getMessage().contains("Missing mandatory fields"));
        assertTrue(exception.getMessage().contains("SubContractCode"));
    }

    @Test
    void shouldThrowExceptionWhenSubContractNameIsMissing() throws IOException {
        // Given: Excel file missing SubContractName
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode"},
                {"CON001", "", "SUB001"} // Empty SubContractName
        });

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            parserService.parseClients(file);
        });
        assertTrue(exception.getMessage().contains("Missing mandatory fields"));
        assertTrue(exception.getMessage().contains("SubContractName"));
    }

    @Test
    void shouldThrowExceptionWithMultipleMissingFields() throws IOException {
        // Given: Excel file with multiple missing mandatory fields
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode"},
                {"", "", "SUB001"} // Missing ContractNo and SubContractName
        });

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            parserService.parseClients(file);
        });
        assertTrue(exception.getMessage().contains("Missing mandatory fields"));
        assertTrue(exception.getMessage().contains("ContractNo"));
        assertTrue(exception.getMessage().contains("SubContractName"));
    }

    @Test
    void shouldThrowExceptionWhenAddressIsMissing() throws IOException {
        // Given: Excel file missing vAddress
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode", "vAddress", "vContactPerson"},
                {"CON001", "Test Client", "SUB001", "", "John Doe"} // Empty vAddress
        });

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            parserService.parseClients(file);
        });
        assertTrue(exception.getMessage().contains("Address (vAddress) is required"));
    }

    @Test
    void shouldThrowExceptionWhenContactPersonIsMissing() throws IOException {
        // Given: Excel file missing vContactPerson
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode", "vAddress", "vContactPerson"},
                {"CON001", "Test Client", "SUB001", "123 Main St", ""} // Empty vContactPerson
        });

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            parserService.parseClients(file);
        });
        assertTrue(exception.getMessage().contains("Contact Person (vContactPerson) is required"));
    }

    @Test
    void shouldSkipEmptyRows() throws IOException {
        // Given: Excel file with empty rows
        MultipartFile file = createExcelFile(new String[][]{
                {"ContractNo", "SubContractName", "SubContractCode", "vAddress", "vContactPerson"},
                {"CON001", "Test Client 1", "SUB001", "123 Main St", "John Doe"},
                {"", "", "", "", ""}, // Empty row
                {"CON002", "Test Client 2", "SUB002", "456 Park Ave", "Jane Smith"}
        });

        // When
        List<ClientDto> clients = parserService.parseClients(file);

        // Then: Empty row should be skipped
        assertEquals(2, clients.size());
    }

    @Test
    void shouldHandleNumericCellsCorrectly() throws IOException {
        // Given: Excel file with numeric values
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Clients");
            
            // Header
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("ContractNo");
            header.createCell(1).setCellValue("SubContractName");
            header.createCell(2).setCellValue("SubContractCode");
            header.createCell(3).setCellValue("vAddress");
            header.createCell(4).setCellValue("vContactPerson");
            header.createCell(5).setCellValue("vPincode");
            
            // Data row with numeric pincode
            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("CON001");
            dataRow.createCell(1).setCellValue("Test Client");
            dataRow.createCell(2).setCellValue("SUB001");
            dataRow.createCell(3).setCellValue("123 Main St");
            dataRow.createCell(4).setCellValue("John Doe");
            dataRow.createCell(5).setCellValue(400001); // Numeric pincode
            
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            MultipartFile file = new MockMultipartFile("file", "test.xlsx", 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    bos.toByteArray());

            // When
            List<ClientDto> clients = parserService.parseClients(file);

            // Then
            assertEquals(1, clients.size());
            assertEquals("400001", clients.get(0).getVPincode()); // Should be converted to string
        }
    }

    private MultipartFile createExcelFile(String[][] data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Clients");
            
            for (int rowIdx = 0; rowIdx < data.length; rowIdx++) {
                Row row = sheet.createRow(rowIdx);
                for (int colIdx = 0; colIdx < data[rowIdx].length; colIdx++) {
                    row.createCell(colIdx).setCellValue(data[rowIdx][colIdx]);
                }
            }
            
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return new MockMultipartFile("file", "test.xlsx", 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    bos.toByteArray());
        }
    }
}
