package com.fleetops.bulkupload.entity;

/**
 * How the idempotency key was derived for a bulk upload row
 */
public enum IdempotencyBasis {
    /**
     * Idempotency key is from clientReference field (user-provided)
     * Preferred method for duplicate detection
     */
    CLIENT_REFERENCE,

    /**
     * Idempotency key is SHA-256 hash of canonical fields
     * Fallback when clientReference is not provided
     * Hash computed over: clientId|senderName|receiverName|receiverPincode|itemCount|totalWeight|serviceType
     */
    HASH
}
