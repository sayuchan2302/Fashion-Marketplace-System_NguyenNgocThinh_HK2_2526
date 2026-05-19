package vn.edu.hcmuaf.fit.marketplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.marketplace.entity.ProductAuditLog;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductAuditLogRepository extends JpaRepository<ProductAuditLog, UUID> {

    List<ProductAuditLog> findByProductIdOrderByCreatedAtDesc(UUID productId);

    @Query("""
            SELECT log FROM ProductAuditLog log
            WHERE log.productId IN :productIds
              AND log.action IN :actions
            ORDER BY log.productId ASC, log.createdAt DESC
            """)
    List<ProductAuditLog> findVendorBlockReasonCandidates(
            @Param("productIds") Collection<UUID> productIds,
            @Param("actions") Collection<ProductAuditLog.Action> actions
    );
}
