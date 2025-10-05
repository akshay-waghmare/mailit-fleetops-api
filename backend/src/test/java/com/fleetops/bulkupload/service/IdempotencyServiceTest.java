package com.fleetops.bulkupload.service;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import com.fleetops.bulkupload.entity.IdempotencyBasis;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

class IdempotencyServiceTest {

    private final IdempotencyService service = new IdempotencyService();

    @Test
    void clientReferencePreferred_elseHash() {
        CreateOrderDto withRef = sampleOrder();
        withRef.setClientReference("REF-123");

        IdempotencyService.IdempotencyResult result1 = service.computeIdempotencyKey(withRef);
        assertThat(result1.getBasis()).isEqualTo(IdempotencyBasis.CLIENT_REFERENCE);
        assertThat(result1.getIdempotencyKey()).isEqualTo("REF-123");

        CreateOrderDto noRef = sampleOrder();
        noRef.setClientReference(null);
        IdempotencyService.IdempotencyResult result2 = service.computeIdempotencyKey(noRef);
        assertThat(result2.getBasis()).isEqualTo(IdempotencyBasis.HASH);
        assertThat(result2.getIdempotencyKey()).matches("[a-f0-9]{64}");
    }

    @Test
    void sameDataSameKey_differentDataDifferentKey() {
        CreateOrderDto a = sampleOrder();
        CreateOrderDto b = sampleOrder();

        var ra = service.computeIdempotencyKey(a);
        var rb = service.computeIdempotencyKey(b);
        assertThat(ra.getIdempotencyKey()).isEqualTo(rb.getIdempotencyKey());

        b.setSenderName("Other");
        var rc = service.computeIdempotencyKey(b);
        assertThat(rc.getIdempotencyKey()).isNotEqualTo(ra.getIdempotencyKey());
    }

    private CreateOrderDto sampleOrder() {
        CreateOrderDto dto = new CreateOrderDto();
        dto.setSenderName("John");
        dto.setSenderAddress("123 St");
        dto.setSenderContact("9999999999");
        dto.setSenderEmail("john@example.com");
        dto.setReceiverName("Jane");
        dto.setReceiverAddress("456 Ave");
        dto.setReceiverContact("8888888888");
        dto.setReceiverPincode("560001");
        dto.setReceiverCity("BLR");
        dto.setItemCount(1);
        dto.setTotalWeight(new BigDecimal("2.50"));
        dto.setItemDescription("Books");
        dto.setDeclaredValue(new BigDecimal("100.00"));
        dto.setServiceType("express");
        dto.setCarrierName("DHL");
        dto.setCodAmount(new BigDecimal("0.00"));
        return dto;
    }
}
