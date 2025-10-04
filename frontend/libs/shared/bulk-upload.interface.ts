/**
 * Bulk Upload Interfaces
 * Matches backend DTOs from backend/src/main/java/com/fleetops/bulkupload/dto/
 */

export interface BulkUploadResponseDto {
  batchId: string;
  totalRows: number;
  createdCount: number;
  failedCount: number;
  skippedDuplicateCount: number;
  processingDurationMs: number;
  rows: RowOutcomeDto[];
}

export interface RowOutcomeDto {
  rowIndex: number;
  status: 'CREATED' | 'FAILED_VALIDATION' | 'SKIPPED_DUPLICATE';
  idempotencyBasis: 'CLIENT_REFERENCE' | 'HASH';
  orderId?: number;
  errorMessages?: ValidationErrorDto[];
}

export interface ValidationErrorDto {
  code: string;
  field: string;
  message: string;
}

export interface BatchSummaryDto {
  id: number;
  batchId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  createdCount: number;
  failedCount: number;
  skippedDuplicateCount: number;
  uploadedAt: string;
  uploaderUserId?: number;
  uploaderName?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileChecksum?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  processingDurationMs?: number;
  createdAt?: string;
  updatedAt?: string;
  metadata?: any;
}

export interface BulkUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
