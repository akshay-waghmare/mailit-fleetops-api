package com.fleetops.bulkupload.parser;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class ExcelParserServiceTest {

    private final ExcelParserService service = new ExcelParserService();

    @Test
    void parseExcel_validTwoRows_returnsListOfTwoDtos() throws IOException {
        MultipartFile file = createExcelWithHeadersAndRows(2);

        List<CreateOrderDto> result = service.parseExcel(file);

        assertThat(result).hasSize(2);
        CreateOrderDto first = result.get(0);
        assertThat(first.getClientReference()).isEqualTo("REF001");
        assertThat(first.getSenderName()).isEqualTo("Sender 1");
        assertThat(first.getReceiverName()).isEqualTo("Receiver 1");
        assertThat(first.getItemCount()).isEqualTo(1);
        assertThat(first.getTotalWeight()).isEqualTo(new BigDecimal("2.50"));
        assertThat(first.getDeclaredValue()).isEqualTo(new BigDecimal("100.00"));
        assertThat(first.getServiceType()).isEqualTo("express");
        assertThat(first.getCarrierName()).isEqualTo("DHL");
        assertThat(first.getCodAmount()).isEqualTo(new BigDecimal("50.00"));
        assertThat(first.getSpecialInstructions()).isEqualTo("Handle with care");
    }

    @Test
    void parseExcel_missingRequiredHeaders_throwsMissingHeaders() throws IOException {
        MultipartFile file = createExcelMissingRequiredHeaders();

        assertThatThrownBy(() -> service.parseExcel(file))
                .isInstanceOf(MissingHeadersException.class)
                .hasMessageContaining("senderName")
                .hasMessageContaining("receiverName");
    }

    private MultipartFile createExcelWithHeadersAndRows(int rows) throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Orders");

        String[] headers = new String[]{
                "clientReference",
                "senderName","senderAddress","senderContact","senderEmail",
                "receiverName","receiverAddress","receiverContact","receiverPincode","receiverCity",
                "itemCount","totalWeight","itemDescription","declaredValue",
                "serviceType","carrierName","codAmount","specialInstructions"
        };
        Row h = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) h.createCell(i).setCellValue(headers[i]);

        for (int r = 1; r <= rows; r++) {
            Row row = sheet.createRow(r);
            row.createCell(0).setCellValue("REF" + String.format("%03d", r));
            row.createCell(1).setCellValue("Sender " + r);
            row.createCell(2).setCellValue("Sender Address " + r);
            row.createCell(3).setCellValue("9876543210");
            row.createCell(4).setCellValue("sender" + r + "@example.com");
            row.createCell(5).setCellValue("Receiver " + r);
            row.createCell(6).setCellValue("Receiver Address " + r);
            row.createCell(7).setCellValue("1234567890");
            row.createCell(8).setCellValue("560001");
            row.createCell(9).setCellValue("Bengaluru");
            row.createCell(10).setCellValue(1);
            row.createCell(11).setCellValue(2.5);
            row.createCell(12).setCellValue("Test Item " + r);
            row.createCell(13).setCellValue(100.0);
            row.createCell(14).setCellValue("express");
            row.createCell(15).setCellValue("DHL");
            row.createCell(16).setCellValue(50.0);
            row.createCell(17).setCellValue("Handle with care");
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out);
        wb.close();
        return new MockMultipartFile("orders.xlsx", "orders.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                out.toByteArray());
    }

    private MultipartFile createExcelMissingRequiredHeaders() throws IOException {
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("Orders");
        // Deliberately exclude some required headers like senderName & receiverName
        String[] headers = new String[]{
                "clientReference","senderAddress","receiverAddress","itemCount","totalWeight"
        };
        Row h = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) h.createCell(i).setCellValue(headers[i]);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out);
        wb.close();
        return new MockMultipartFile("orders.xlsx", "orders.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                out.toByteArray());
    }
}
