package com.fleetops.bulkupload.parser;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Simple unit test to verify TDD approach for ExcelParserService
 * This test should FAIL because the service stub throws UnsupportedOperationException
 */
@Disabled("Legacy TDD guard - superseded by ExcelParserServiceTest")
class ExcelParserSimpleTest {

    @Test
    void testServiceThrowsExceptionTDD() {
        // Arrange
        ExcelParserService service = new ExcelParserService();

        // Act & Assert - This should fail with UnsupportedOperationException (TDD approach)
        assertThatThrownBy(() -> service.parseExcel(null))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessageContaining("not implemented yet");
    }
}
