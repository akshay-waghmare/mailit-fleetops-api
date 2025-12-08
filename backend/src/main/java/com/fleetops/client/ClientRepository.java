package com.fleetops.client;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByContractNoAndSubContractCode(String contractNo, String subContractCode);

    @Query("SELECT c FROM Client c WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.contactPerson) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.subContractCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.vCity) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Client> searchClients(@Param("query") String query, Pageable pageable);
}
