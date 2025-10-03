package com.fleetops.bulkupload.repository;

import com.fleetops.bulkupload.entity.BulkUploadBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface BulkUploadBatchRepository extends JpaRepository<BulkUploadBatch, Long> {

    Optional<BulkUploadBatch> findByBatchId(String batchId);

    @Modifying
    @Query("DELETE FROM BulkUploadBatch b WHERE b.createdAt < :cutoff AND NOT EXISTS (SELECT 1 FROM com.fleetops.bulkupload.entity.BulkUploadRow r WHERE r.batch = b)")
    int deleteEmptyBatchesCreatedBefore(@Param("cutoff") LocalDateTime cutoff);
}
