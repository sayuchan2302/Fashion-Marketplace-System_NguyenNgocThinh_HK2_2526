package vn.edu.hcmuaf.fit.fashionstore.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.fashionstore.entity.Voucher;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, UUID> {

    @Query("""
            SELECT v FROM Voucher v
            WHERE v.storeId = :storeId
              AND (:status IS NULL OR v.status = :status)
              AND (
                  COALESCE(:keyword, '') = ''
                  OR LOWER(v.name) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
                  OR LOWER(v.code) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
                  OR LOWER(COALESCE(v.description, '')) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
              )
            """)
    Page<Voucher> searchByStore(
            @Param("storeId") UUID storeId,
            @Param("status") Voucher.VoucherStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Optional<Voucher> findByIdAndStoreId(UUID id, UUID storeId);

    Optional<Voucher> findByStoreIdAndCode(UUID storeId, String code);

    long countByStoreId(UUID storeId);

    long countByStoreIdAndStatus(UUID storeId, Voucher.VoucherStatus status);

    @Query("""
            SELECT COALESCE(SUM(v.usedCount), 0) FROM Voucher v
            WHERE v.storeId = :storeId
            """)
    long sumUsedCountByStoreId(@Param("storeId") UUID storeId);
}
