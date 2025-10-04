package com.fleetops.bulkupload.parser;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.math.RoundingMode;

@Service
public class ExcelParserService {

    private static final int MAX_ROWS = 500;

    public List<CreateOrderDto> parseExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Collections.emptyList();
        }

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getNumberOfSheets() > 0 ? wb.getSheetAt(0) : null;
            if (sheet == null) return Collections.emptyList();

            Row header = sheet.getRow(0);
            Map<String, Integer> idx = buildHeaderIndex(header);

            // Minimal required headers per our test
            requireHeaders(idx, "senderName", "receiverName");

            int last = Math.min(sheet.getLastRowNum(), MAX_ROWS);
            List<CreateOrderDto> out = new ArrayList<>();
            for (int r = 1; r <= last; r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                CreateOrderDto dto = new CreateOrderDto();
                
                // Client Information
                dto.setClientReference(getString(row, idx.get("clientReference")));
                dto.setClientId(getLong(row, idx.get("clientId")));
                dto.setClientName(getString(row, idx.get("clientName")));
                dto.setClientCompany(getString(row, idx.get("clientCompany")));
                dto.setContactNumber(getString(row, idx.get("contactNumber")));
                
                // Sender Information
                dto.setSenderName(getString(row, idx.get("senderName")));
                dto.setSenderAddress(getString(row, idx.get("senderAddress")));
                dto.setSenderContact(getString(row, idx.get("senderContact")));
                dto.setSenderEmail(getString(row, idx.get("senderEmail")));
                
                // Receiver Information
                dto.setReceiverName(getString(row, idx.get("receiverName")));
                dto.setReceiverAddress(getString(row, idx.get("receiverAddress")));
                dto.setReceiverContact(getString(row, idx.get("receiverContact")));
                dto.setReceiverEmail(getString(row, idx.get("receiverEmail")));
                dto.setReceiverPincode(getString(row, idx.get("receiverPincode")));
                dto.setReceiverCity(getString(row, idx.get("receiverCity")));
                dto.setReceiverState(getString(row, idx.get("receiverState")));
                
                // Package Details
                dto.setItemCount(getInteger(row, idx.get("itemCount")));
                dto.setTotalWeight(getBigDecimal(row, idx.get("totalWeight")));
                dto.setLengthCm(getBigDecimal(row, idx.get("lengthCm")));
                dto.setWidthCm(getBigDecimal(row, idx.get("widthCm")));
                dto.setHeightCm(getBigDecimal(row, idx.get("heightCm")));
                dto.setItemDescription(getString(row, idx.get("itemDescription")));
                dto.setDeclaredValue(getBigDecimal(row, idx.get("declaredValue")));
                
                // Service Details
                dto.setServiceType(getString(row, idx.get("serviceType")));
                dto.setCarrierName(getString(row, idx.get("carrierName")));
                dto.setCarrierId(getString(row, idx.get("carrierId")));
                
                // Financial Information
                dto.setCodAmount(getBigDecimal(row, idx.get("codAmount")));
                
                // Additional Fields
                dto.setSpecialInstructions(getString(row, idx.get("specialInstructions")));
                
                out.add(dto);
            }
            return out;
        } catch (MissingHeadersException e) {
            throw e;
        } catch (IOException e) {
            throw new ExcelParseException("Invalid Excel file format", e);
        }
    }

    private Map<String, Integer> buildHeaderIndex(Row header) {
        if (header == null) return Collections.emptyMap();
        Map<String, Integer> m = new HashMap<>();
        short last = header.getLastCellNum();
        for (int c = 0; c < last; c++) {
            String name = header.getCell(c) != null ? header.getCell(c).getStringCellValue() : null;
            if (name != null && !name.isBlank()) m.put(name.trim(), c);
        }
        return m;
    }

    private void requireHeaders(Map<String, Integer> idx, String... names) {
        List<String> missing = new ArrayList<>();
        for (String n : names) if (!idx.containsKey(n)) missing.add(n);
        if (!missing.isEmpty()) {
            throw new MissingHeadersException("Missing required headers: " + String.join(", ", missing));
        }
    }

    private String getString(Row row, Integer idx) {
        if (idx == null || row.getCell(idx) == null) return null;
        try { return row.getCell(idx).getStringCellValue(); } catch (Exception e) { return String.valueOf(getNumeric(row, idx)); }
    }

    private Integer getInteger(Row row, Integer idx) {
        if (idx == null || row.getCell(idx) == null) return null;
        try { return (int) Math.round(row.getCell(idx).getNumericCellValue()); } catch (Exception e) { return null; }
    }
    
    private Long getLong(Row row, Integer idx) {
        if (idx == null || row.getCell(idx) == null) return null;
        try { return Math.round(row.getCell(idx).getNumericCellValue()); } catch (Exception e) { return null; }
    }

    private BigDecimal getBigDecimal(Row row, Integer idx) {
        if (idx == null || row.getCell(idx) == null) return null;
    try { return BigDecimal.valueOf(row.getCell(idx).getNumericCellValue()).setScale(2, RoundingMode.HALF_UP); } catch (Exception e) { return null; }
    }

    private double getNumeric(Row row, Integer idx) {
        try { return row.getCell(idx).getNumericCellValue(); } catch (Exception e) { return 0d; }
    }
}

