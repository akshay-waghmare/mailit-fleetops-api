package com.fleetops.bulkupload.repository;

import com.fleetops.bulkupload.entity.BulkUploadRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BulkUploadRowRepository extends JpaRepository<BulkUploadRow, Long> {

    List<BulkUploadRow> findByBatch_IdOrderByRowIndexAsc(Long batchId);

    @Modifying
    @Query("DELETE FROM BulkUploadRow r WHERE r.createdAt < :cutoff")
    int deleteByCreatedAtBefore(@Param("cutoff") LocalDateTime cutoff);

    Optional<BulkUploadRow> findByIdempotencyKey(String idempotencyKey);
}
