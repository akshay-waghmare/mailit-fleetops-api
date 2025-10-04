package com.fleetops.bulkupload.service;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import com.fleetops.bulkupload.entity.IdempotencyBasis;
import com.fleetops.bulkupload.util.HashUtil;
import org.springframework.stereotype.Service;

@Service
public class IdempotencyService {

    public IdempotencyResult computeIdempotencyKey(CreateOrderDto dto) {
        if (dto == null) throw new IllegalArgumentException("Order cannot be null");
        String ref = dto.getClientReference();
        if (ref != null && !ref.isBlank()) {
            return new IdempotencyResult(ref, IdempotencyBasis.CLIENT_REFERENCE);
        }
        String canonical = computeCanonicalRepresentation(dto);
        String key = HashUtil.sha256Hex(canonical);
        return new IdempotencyResult(key, IdempotencyBasis.HASH);
    }

    public String computeCanonicalRepresentation(CreateOrderDto d) {
        StringBuilder sb = new StringBuilder(256);
        // Keep minimal fields for stability and speed
        append(sb, d.getSenderName());
        append(sb, d.getSenderAddress());
        append(sb, d.getSenderContact());
        append(sb, d.getSenderEmail());
        append(sb, d.getReceiverName());
        append(sb, d.getReceiverAddress());
        append(sb, d.getReceiverContact());
        append(sb, d.getReceiverPincode());
        append(sb, d.getReceiverCity());
        append(sb, d.getItemCount());
        append(sb, d.getTotalWeight());
        append(sb, d.getItemDescription());
        append(sb, d.getDeclaredValue());
        append(sb, d.getServiceType());
        append(sb, d.getCarrierName());
        append(sb, d.getCodAmount());
        return sb.toString();
    }

    private void append(StringBuilder sb, Object v) {
        if (v != null) sb.append(v);
        sb.append('|');
    }

    public boolean detectCollision(String key) {
        // Minimal stub for now
        return false;
    }

    public static class IdempotencyResult {
        private final String idempotencyKey;
        private final IdempotencyBasis basis;

        public IdempotencyResult(String idempotencyKey, IdempotencyBasis basis) {
            this.idempotencyKey = idempotencyKey;
            this.basis = basis;
        }

        public String getIdempotencyKey() { return idempotencyKey; }
        public IdempotencyBasis getBasis() { return basis; }
    }
}
